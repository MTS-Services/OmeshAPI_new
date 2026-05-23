const { asyncHandler } = require('../../middlewares/errorHandler');
const PaymentService = require('./payment.services');

class PaymentController {
  constructor() {
    this.services = new PaymentService();
  }

  paymentCapture = asyncHandler(async (req, res) => {
    const { paypalOrderId } = req.body;
    const result = await this.services.capturePayment(paypalOrderId);
    res.sendCreated(result, 'Payout requested successfully');
  });
}

module.exports = PaymentController;
