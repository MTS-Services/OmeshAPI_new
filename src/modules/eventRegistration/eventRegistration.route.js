const express = require('express');
const { authorize, authenticate } = require('../../middlewares/auth');
const RegistrationController = require('./eventRegistration.controller');
const router = express.Router();

const controller = new RegistrationController();

// Organizer routes
router.post('/', authenticate, controller.eventRegistration);
router.get('/', authenticate, controller.getEventRegistration);
router.get('/payment', authenticate, controller.getEventPayment);
router.get('/export/csv', authenticate, controller.downloadRegistrationCsv);
router.get('/export/excel', controller.downloadRegistrationExcel);

module.exports = router;
