const express = require('express');
const EnrollmentController = require('./trainingEnrollment.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../validators/common.validator');
const {
  createEnrollmentSchema,
  updateEnrollmentSchema,
} = require('../../validators/trainingEnrollment.validtor');
const router = express.Router();

const controller = new EnrollmentController();

router.use(authenticate);

router.post('/', validate(createEnrollmentSchema), controller.enroll);
router.get('/my', controller.getMyEnrollments);
router.get('/all', authorize(['ADMIN']), controller.getAllEnrollments);
router.get('/export', controller.exportEnrollments);
router.patch(
  '/:id/status',
  authorize(['ADMIN']),
  validate(updateEnrollmentSchema),
  controller.updateStatus,
);

module.exports = router;
