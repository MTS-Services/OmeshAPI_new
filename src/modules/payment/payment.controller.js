const { asyncHandler } = require('../../middlewares/errorHandler');
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

  fygaroPaymentCapture = asyncHandler(async (req, res) => {
    const {
      batchId,
      providerRef,
      status,
      transactionId,
      cardType,
      companyTradeName,
      transactionAmount,
      currency,
      orderNumber,
      serviceDescription,
      processingDate,
    } = req.body;
    const result = await this.services.confirmFygaroPayment({
      batchId,
      providerRef: providerRef || transactionId,
      status,
      cardType,
      companyTradeName,
      transactionAmount,
      currency,
      orderNumber,
      serviceDescription,
      processingDate,
    });
    res.sendCreated(result, 'Fygaro payment captured successfully');
  });

  fygaroPaymentConfirm = asyncHandler(async (req, res) => {
    const batchId = req.body.batchId || req.params.batchId || req.query.batchId;
    const result = await this.services.getConfromPayment(batchId);
    res.sendSuccess(result, 'Fygaro payment confirmed successfully');
  });
}

module.exports = PaymentController;
