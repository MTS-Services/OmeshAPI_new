const express = require('express');
const { authenticate, optionalAuthenticate } = require('../../middlewares/auth');
const RegistrationController = require('./eventRegistration.controller');
const router = express.Router();

const controller = new RegistrationController();

// Checkout routes are open to guests; organizers/admins are identified when logged in.
router.post('/fygaro-payment', optionalAuthenticate, controller.fygaroEventRegistration);
router.post('/', optionalAuthenticate, controller.eventRegistration);
router.get('/', authenticate, controller.getEventRegistration);
router.get('/payment', authenticate, controller.getEventPayment);
router.get('/export/csv', authenticate, controller.downloadRegistrationCsv);
router.get('/export/excel', controller.downloadRegistrationExcel);

module.exports = router;
