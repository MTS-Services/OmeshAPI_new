const axios = require('axios');
const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const paymentEmitter = require('../../utils/eventEmitter');

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

  async createOrder(totalAmount, batchId) {
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

  async capturePayment(paypalOrderId) {
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

    return await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED', paidAt: new Date() },
        include: {
          event: {
            select: { organizerId: true },
          },
        },
      });
      const registrations = await tx.registration.findMany({
        where: { batchId: payment.batchId },
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
        payment: payment,
        registrations,
      });

      return {
        success: true,
        message: 'Payment confirmed and seats reserved.',
      };
    });
  }
}

module.exports = PaymentService;
