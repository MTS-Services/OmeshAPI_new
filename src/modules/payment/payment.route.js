const express = require('express');
const { authorize, authenticate } = require('../../middlewares/auth');
const PaymentController = require('./payment.controller');
const router = express.Router();

const controller = new PaymentController();

// Organizer routes
router.post('/capture', controller.paymentCapture);
router.post('/fygaro/capture-new', controller.fygaroPaymentCapture);
router.post('/fygaro/confirm', controller.fygaroPaymentConfirm);

module.exports = router;
