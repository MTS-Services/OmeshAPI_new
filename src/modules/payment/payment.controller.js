const { asyncHandler } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');
const PaymentService = require('./payment.services');

class PaymentController {
  constructor() {
    this.services = new PaymentService();
  }

  paymentCapture = asyncHandler(async (req, res) => {
    const { paypalOrderId } = req.body;
    const result = await this.services.capturePaypalPayment(paypalOrderId);
    res.sendCreated(result, 'Payout requested successfully');
  });

  // fygaroPaymentCapture = asyncHandler(async (req, res) => {
  //   const {
  //     batchId,
  //     providerRef,
  //     status,
  //     transactionId,
  //     cardType,
  //     companyTradeName,
  //     transactionAmount,
  //     currency,
  //     orderNumber,
  //     serviceDescription,
  //     processingDate,
  //   } = req.body;
  //   const result = await this.services.confirmFygaroPayment({
  //     batchId,
  //     providerRef: providerRef || transactionId,
  //     status,
  //     cardType,
  //     companyTradeName,
  //     transactionAmount,
  //     currency,
  //     orderNumber,
  //     serviceDescription,
  //     processingDate,
  //   });
  //   res.sendCreated(result, 'Fygaro payment captured successfully');
  // });

  fygaroPaymentCapture = asyncHandler(async (req, res) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.status(200).send('Fygaro Webhook is Active and Alive');
    }

    this.services.validateFygaroWebhook({
      signatureHeader: req.get('Fygaro-Signature'),
      keyIdHeader: req.get('Fygaro-Key-ID'),
      rawBody: req.rawBody,
    });

    const payload = { ...req.body };

    res.status(200).json({
      success: true,
      message: 'Fygaro webhook received successfully',
    });

    setImmediate(() => {
      this.services.processFygaroWebhook(payload).catch((error) => {
        logger.error('Fygaro webhook processing failed', {
          error: error.message,
          stack: error.stack,
          reference:
            payload.reference ||
            payload.transactionId ||
            payload.transaction_id,
          customReference:
            payload.customReference || payload.custom_reference || null,
        });
      });
    });
  });

  fygaroPaymentConfirm = asyncHandler(async (req, res) => {
    const batchId = req.body.batchId || req.params.batchId || req.query.batchId;

    logger.info(
      `Confirming Fygaro payment for ===== batchId ======: ${batchId}`,
    );

    const result = await this.services.getConfromPayment(batchId);
    res.sendSuccess(result, 'Fygaro payment confirmed successfully');
  });
}

module.exports = PaymentController;
