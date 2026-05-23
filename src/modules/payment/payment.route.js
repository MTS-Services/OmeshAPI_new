const express = require('express');
const { authorize, authenticate } = require('../../middlewares/auth');
const PaymentController = require('./payment.controller');
const router = express.Router();

const controller = new PaymentController();

// Organizer routes
router.post('/capture', controller.paymentCapture);

module.exports = router;
