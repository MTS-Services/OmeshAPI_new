const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const paymentEmitter = require('../../utils/eventEmitter');
const logger = require('../../utils/logger');

const FYGARO_SUCCESS_STATUSES = new Set([
  'APPROVED',
  'COMPLETED',
  'PAID',
  'SUCCESS',
  'SUCCEEDED',
]);

const DEFAULT_FYGARO_WEBHOOK_MAX_AGE_SECONDS = 300;

const parseDelimitedEnv = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseFygaroSignatureHeader = (header) => {
  return header.split(',').reduce((accumulator, token) => {
    const [key, value] = token.split('=', 2).map((item) => item.trim());

    if (!key || value === undefined) {
      return accumulator;
    }

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(value);
    return accumulator;
  }, {});
};

const computeFygaroSignature = (secret, timestamp, rawBody) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${timestamp}.`);
  hmac.update(rawBody);
  return hmac.digest('hex');
};

const isMatchingFygaroSignature = (expectedSignature, candidateSignature) => {
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const candidateBuffer = Buffer.from(candidateSignature, 'hex');

    if (
      expectedBuffer.length === 0 ||
      expectedBuffer.length !== candidateBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
  } catch (error) {
    return false;
  }
};

class PaymentService {
  // constructor() {
  //   this.baseUrl = 'https://api-m.paypal.com';
  // }

  constructor() {
    this.baseUrl =
      process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
  }

  // test credentials

  normalizePaymentMethod(paymentMethod = 'PAYPAL') {
    const normalizedMethod = paymentMethod.toUpperCase();

    if (!['PAYPAL', 'FYGARO'].includes(normalizedMethod)) {
      throw new AppError('Unsupported payment method.', 400);
    }

    return normalizedMethod;
  }

  getFygaroWebhookSecrets() {
    const secrets = parseDelimitedEnv(process.env.FYGARO_WEBHOOK_SECRETS);

    if (secrets.length > 0) {
      return secrets;
    }

    return parseDelimitedEnv(process.env.FYGARO_SECRET_KEY);
  }

  getFygaroWebhookKeyIds() {
    const keyIds = parseDelimitedEnv(process.env.FYGARO_WEBHOOK_KEY_IDS);

    if (keyIds.length > 0) {
      return keyIds;
    }

    return parseDelimitedEnv(process.env.FYGARO_PUBLIC_KEY);
  }

  validateFygaroWebhook({ signatureHeader, keyIdHeader, rawBody }) {
    const secrets = this.getFygaroWebhookSecrets();

    if (secrets.length === 0) {
      throw new AppError('Fygaro webhook secrets are not configured.', 500);
    }

    if (!signatureHeader) {
      throw new AppError('Missing Fygaro-Signature header.', 400);
    }

    if (!rawBody || rawBody.length === 0) {
      throw new AppError(
        'Missing raw request body for webhook validation.',
        400,
      );
    }

    const expectedKeyIds = this.getFygaroWebhookKeyIds();

    if (expectedKeyIds.length > 0) {
      if (!keyIdHeader) {
        throw new AppError('Missing Fygaro-Key-ID header.', 400);
      }

      if (!expectedKeyIds.includes(keyIdHeader)) {
        throw new AppError('Invalid Fygaro-Key-ID header.', 400);
      }
    }

    const parsedHeader = parseFygaroSignatureHeader(signatureHeader);
    const timestamp = parsedHeader.t?.[0];
    const signatures = parsedHeader.v1 || [];

    if (!timestamp) {
      throw new AppError('Fygaro signature timestamp is missing.', 400);
    }

    const timestampNumber = Number(timestamp);

    if (Number.isNaN(timestampNumber)) {
      throw new AppError('Fygaro signature timestamp is invalid.', 400);
    }

    const maxAgeSeconds =
      Number(process.env.FYGARO_WEBHOOK_MAX_AGE_SECONDS) ||
      DEFAULT_FYGARO_WEBHOOK_MAX_AGE_SECONDS;

    if (Math.abs(Date.now() / 1000 - timestampNumber) > maxAgeSeconds) {
      throw new AppError('Fygaro signature timestamp has expired.', 400);
    }

    if (signatures.length === 0) {
      throw new AppError('Fygaro signature digest is missing.', 400);
    }

    const isValid = secrets.some((secret) => {
      const expectedSignature = computeFygaroSignature(
        secret,
        timestamp,
        rawBody,
      );

      return signatures.some((candidateSignature) => {
        return isMatchingFygaroSignature(expectedSignature, candidateSignature);
      });
    });

    if (!isValid) {
      throw new AppError('Fygaro webhook signature validation failed.', 400);
    }
  }

  async findFygaroPayment(batchId, providerRef) {
    if (batchId) {
      return prisma.payment.findUnique({
        where: { batchId },
      });
    }

    if (!providerRef) {
      return null;
    }

    return prisma.payment.findFirst({
      where: {
        OR: [{ providerRef }, { batchId: providerRef }],
      },
    });
  }

  async processFygaroWebhook(payload = {}) {
    const providerRef =
      payload.reference ||
      payload.transactionId ||
      payload.transaction_id ||
      null;
    const customReference =
      payload.customReference || payload.custom_reference || null;
    const payment = await this.findFygaroPayment(customReference, providerRef);

    if (!payment) {
      logger.warn('Fygaro webhook could not reconcile payment.', {
        customReference,
        providerRef,
      });
      return {
        success: false,
        skipped: true,
        reason: 'PAYMENT_NOT_FOUND',
      };
    }

    try {
      return await this.confirmFygaroPayment({
        batchId: payment.batchId,
        providerRef,
        status:
          payload.status ||
          payload.transactionStatus ||
          payload.transaction_status ||
          'APPROVED',
        cardType: payload.card?.brand || 'CARD',
        companyTradeName: payload.companyTradeName || null,
        transactionAmount: payload.amount || payload.transactionAmount,
        currency: payload.currency,
        orderNumber: payload.reference || providerRef,
        serviceDescription:
          payload.serviceDescription || payload.service_description || null,
        processingDate:
          payload.processingDate || payload.processing_date || null,
      });
    } catch (error) {
      logger.error('Fygaro webhook reconciliation failed.', {
        error: error.message,
        batchId: payment.batchId,
        providerRef,
      });

      return {
        success: false,
        skipped: true,
        reason: 'RECONCILIATION_FAILED',
      };
    }
  }

  async finalizeSuccessfulPayment(
    tx,
    payment,
    providerRef,
    orderEmailData = {},
  ) {
    const registrations = await tx.registration.findMany({
      where: { batchId: payment.batchId },
    });

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
        ...(providerRef ? { providerRef } : {}),
      },
      include: {
        event: {
          select: { organizerId: true },
        },
      },
    });

    await tx.organizerProfile.update({
      where: { userId: updatedPayment.event.organizerId },
      data: {
        availableBalance: { increment: updatedPayment.subtotal },
      },
    });

    await tx.registration.updateMany({
      where: { batchId: payment.batchId },
      data: { status: 'CONFIRMED' },
    });

    await tx.event.update({
      where: { id: payment.eventId },
      data: { availableSeats: { decrement: registrations.length } },
    });

    paymentEmitter.emit('payment.success', {
      payment: updatedPayment,
      registrations,
      orderEmailData,
    });

    return {
      success: true,
      message: 'Payment confirmed and seats reserved.',
      payment: updatedPayment,
      registrations,
    };
  }

  async generateAccessToken() {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
    ).toString('base64');

    try {
      const response = await axios({
        url: `${this.baseUrl}/v1/oauth2/token`,
        method: 'post',
        data: 'grant_type=client_credentials',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data.access_token;
    } catch (error) {
      console.error(
        'PayPal Auth Error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  async createPaypalOrder(totalAmount, batchId) {
    const accessToken = await this.generateAccessToken();

    try {
      const response = await axios({
        url: `${this.baseUrl}/v2/checkout/orders`,
        method: 'post',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: batchId,
              amount: {
                currency_code: 'USD',
                value: parseFloat(totalAmount).toFixed(2),
              },
              custom_id: batchId,
              description: `Event Registration Batch: ${batchId}`,
            },
          ],
          application_context: {
            brand_name: 'Your Event Platform',
            shipping_preference: 'NO_SHIPPING',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${process.env.FRONTEND_URL}/payment-success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        'PayPal Create Order Error:',
        error.response?.data || error.message,
      );
      throw new Error('Could not create PayPal order');
    }
  }

  async createOrder(
    totalAmount,
    batchId,
    paymentMethod = 'PAYPAL',
    eventTitle,
  ) {
    const normalizedMethod = this.normalizePaymentMethod(paymentMethod);

    if (normalizedMethod === 'FYGARO') {
      return this.createFygaroOrder(totalAmount, batchId, eventTitle);
    }

    const paypalOrder = await this.createPaypalOrder(totalAmount, batchId);

    return {
      ...paypalOrder,
      paymentMethod: normalizedMethod,
      providerRef: paypalOrder.id,
    };
  }

  async handlePaypalCapture(paypalOrderId) {
    return await prisma.$transaction(async (tx) => {
      const captureData = await this.captureOrder(paypalOrderId);
      if (captureData.status !== 'COMPLETED') {
        throw new Error('PayPal payment was not completed');
      }

      const batchId =
        captureData.purchase_units[0].payments.captures[0].custom_id;
      const updatedPayment = await tx.payment.update({
        where: { batchId: batchId },
        data: {
          status: 'SUCCEEDED',
          paidAt: new Date(),
          providerRef: captureData.id,
        },
        include: {
          event: {
            select: { organizerId: true },
          },
        },
      });

      await tx.organizerProfile.update({
        where: { userId: updatedPayment.event.organizerId },
        data: {
          availableBalance: { increment: updatedPayment.subtotal },
        },
      });

      await tx.registration.updateMany({
        where: { batchId: batchId },
        data: {
          status: 'CONFIRMED',
        },
      });

      return { success: true, batchId };
    });
  }

  async getOrderDetails(paypalOrderId) {
    const accessToken = await this.generateAccessToken();

    try {
      const response = await axios({
        url: `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`,
        method: 'get',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        'PayPal Get Order Error:',
        error.response?.data || error.message,
      );
      throw new AppError('Could not verify PayPal order.', 400);
    }
  }

  async captureOrder(paypalOrderId) {
    const accessToken = await this.generateAccessToken();

    try {
      const response = await axios({
        url: `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
        method: 'post',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const paypalError = error.response?.data;
      const issue = paypalError?.details?.[0]?.issue;
      const description = paypalError?.details?.[0]?.description;

      console.error('PayPal Capture Error Log:', {
        message: error.message,
        paypalError: paypalError,
        paypalOrderId: paypalOrderId,
      });

      if (issue === 'ORDER_NOT_APPROVED') {
        const approveUrl = paypalError?.links?.find(
          (link) => link.rel === 'approve',
        )?.href;

        throw new AppError(
          approveUrl
            ? `Order is not approved yet. Redirect user to: ${approveUrl}`
            : 'Order is not approved yet. Please approve payment on PayPal and retry capture.',
          400,
        );
      }

      if (issue === 'INSTRUMENT_DECLINED') {
        throw new AppError(
          'Your payment method was declined by the bank or processor. Please try another card or payment method in your PayPal account.',
          400,
        );
      }

      if (issue === 'ORDER_ALREADY_CAPTURED') {
        throw new AppError(
          'This order has already been captured and processed.',
          400,
        );
      }

      if (issue === 'TRANSACTION_REFUSED') {
        throw new AppError(
          'The transaction was refused by PayPal due to risk or policy. Please contact PayPal support.',
          400,
        );
      }

      if (description) {
        throw new AppError(`PayPal Capture Failed: ${description}`, 400);
      }

      throw new AppError(
        'Payment capture failed due to an unexpected gateway error.',
        400,
      );
    }
  }

  async capturePaypalPayment(paypalOrderId) {
    const payment = await prisma.payment.findFirst({
      where: { providerRef: paypalOrderId },
    });

    if (!payment || payment.status === 'SUCCEEDED') {
      throw new AppError('Payment already processed or not found.', 400);
    }

    const order = await this.getOrderDetails(paypalOrderId);

    if (order.status !== 'APPROVED' && order.status !== 'COMPLETED') {
      const approvalUrl = order.links?.find(
        (link) => link.rel === 'approve',
      )?.href;
      throw new AppError(
        approvalUrl
          ? `Order is not approved yet. Redirect user to: ${approvalUrl}`
          : 'Order is not approved yet. Please approve the payment and retry capture.',
        400,
      );
    }

    const capture =
      order.status === 'COMPLETED'
        ? order
        : await this.captureOrder(paypalOrderId);

    if (capture.status !== 'COMPLETED') {
      throw new AppError('Payment capture failed.', 400);
    }

    const purchaseUnit = capture.purchase_units?.[0] || {};
    const capturedPayment = purchaseUnit.payments?.captures?.[0] || {};
    const cardSource =
      capture.payment_source?.card ||
      capture.payment_source?.paypal?.card ||
      {};

    const orderEmailData = {
      processingDate:
        capturedPayment.create_time ||
        capture.create_time ||
        new Date().toISOString(),
      companyTradeName:
        purchaseUnit.payee?.display_data?.brand_name ||
        purchaseUnit.payee?.business_name ||
        'Endura Sports Limited Traded as Endura Events.',
      cardType: cardSource.brand || payment.method || 'PAYPAL',
      transactionAmount:
        capturedPayment.amount?.value || purchaseUnit.amount?.value,
      currency:
        capturedPayment.amount?.currency_code ||
        purchaseUnit.amount?.currency_code ||
        payment.currency,
      orderNumber:
        capture.id || paypalOrderId || payment.providerRef || payment.batchId,
      serviceDescription:
        purchaseUnit.description ||
        `Event Registration Batch: ${payment.batchId}`,
    };

    return await prisma.$transaction(async (tx) => {
      return this.finalizeSuccessfulPayment(
        tx,
        payment,
        capture.id || paypalOrderId,
        orderEmailData,
      );
    });
  }

  async confirmFygaroPayment({
    batchId,
    providerRef,
    status,
    cardType,
    companyTradeName,
    transactionAmount,
    currency,
    orderNumber,
    serviceDescription,
    processingDate,
  }) {
    if (!batchId) {
      throw new AppError(
        'batchId (customReference) is required for Fygaro confirmation.',
        400,
      );
    }
    if (status && typeof status === 'string') {
      if (
        typeof FYGARO_SUCCESS_STATUSES?.has === 'function' &&
        !FYGARO_SUCCESS_STATUSES.has(status.toUpperCase())
      ) {
        throw new AppError('Fygaro payment is not marked as successful.', 400);
      }
    }
    const payment = await prisma.payment.findUnique({
      where: { batchId },
    });

    console.log('Fygaro payment confirmation request:======', {
      batchId,
      payment,
    });

    if (!payment) {
      throw new AppError('Payment not found for the provided batchId.', 400);
    }

    if (payment.status === 'SUCCEEDED') {
      return {
        success: true,
        message: 'Payment already confirmed.',
        payment,
      };
    }

    const orderEmailData = {
      processingDate: processingDate || new Date().toISOString(),
      companyTradeName:
        companyTradeName || 'Endura Sports Limited Traded as Endura Events.',
      cardType: cardType || 'CARD',
      transactionAmount: transactionAmount || payment.total,
      currency: currency || payment.currency,
      orderNumber:
        orderNumber || providerRef || payment.providerRef || payment.batchId,
      serviceDescription:
        serviceDescription || `Event Registration Batch: ${payment.batchId}`,
    };

    return prisma.$transaction(async (tx) => {
      return this.finalizeSuccessfulPayment(
        tx,
        payment,
        providerRef || payment.providerRef || batchId,
        orderEmailData,
      );
    });
  }

  async capturePayment({
    batchId,
    paymentMethod = 'PAYPAL',
    providerRef,
    status,
  }) {
    const normalizedMethod = this.normalizePaymentMethod(paymentMethod);

    if (normalizedMethod === 'FYGARO') {
      return this.confirmFygaroPayment({ batchId, providerRef, status });
    }

    if (!providerRef) {
      throw new AppError('providerRef is required for PayPal capture.', 400);
    }

    return this.capturePaypalPayment(providerRef);
  }

  async createFygaroOrder(totalAmount, batchId, eventTitle) {
    try {
      if (
        !process.env.FYGARO_SECRET_KEY ||
        !process.env.FYGARO_PUBLIC_KEY ||
        !process.env.FYGARO_BASE_URL
      ) {
        throw new AppError('Fygaro credentials are not configured.', 500);
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const expireInSeconds = nowInSeconds + 10 * 60;

      const payload = {
        amount: parseFloat(totalAmount).toFixed(2),
        currency: 'USD',
        custom_reference: batchId,
        return_url: `${process.env.FRONTEND_URL}/payment-success?batchId=${batchId}&eventName=${encodeURIComponent(eventTitle)}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
        nbf: nowInSeconds,
        exp: expireInSeconds,
      };

      const options = {
        algorithm: 'HS256',
        header: {
          alg: 'HS256',
          typ: 'JWT',
          kid: process.env.FYGARO_PUBLIC_KEY,
        },
      };
      const token = jwt.sign(payload, process.env.FYGARO_SECRET_KEY, options);
      const paymentUrl = `${process.env.FYGARO_BASE_URL}?jwt=${token}`;

      return {
        batchId,
        paymentMethod: 'FYGARO',
        paymentUrl,
        expiresAt: new Date(expireInSeconds * 1000).toISOString(),
      };
    } catch (error) {
      console.error(
        'Fygaro Create Order Error:',
        error.response?.data || error.message,
      );

      if (error instanceof AppError) {
        throw error;
      }

      throw new Error('Could not create Fygaro order');
    }
  }

  async getConfromPayment(batchId) {
    const payment = await prisma.payment.findUnique({
      where: { batchId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            organizerId: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment not found for the provided batchId.', 404);
    }

    const registrations = await prisma.registration.findMany({
      where: { batchId },
      orderBy: { createdAt: 'asc' },
    });

    if (registrations.length === 0) {
      throw new AppError(
        'Registrations not found for the provided batchId.',
        404,
      );
    }

    if (payment.status === 'SUCCEEDED') {
      return {
        success: true,
        message: 'Payment already confirmed.',
        payment,
        registrations,
      };
    }

    const orderEmailData = {
      processingDate: new Date().toISOString(),
      companyTradeName: 'Endura Sports Limited Traded as Endura Events.',
      cardType: payment.method || 'CARD',
      transactionAmount: payment.total,
      currency: payment.currency,
      orderNumber: payment.providerRef || payment.batchId,
      serviceDescription: `Event Registration Batch: ${payment.batchId}`,
    };

    return prisma.$transaction(async (tx) => {
      return this.finalizeSuccessfulPayment(
        tx,
        payment,
        payment.providerRef || payment.batchId,
        orderEmailData,
      );
    });
  }
}

module.exports = PaymentService;
