const express = require('express');
const PlatformSettingController = require('./platformSetting.controlller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../validators/common.validator');
const {
  UpdateSettingSchema,
} = require('../../validators/platformSetting.validator');
const router = express.Router();

const controller = new PlatformSettingController();

router.get('/', controller.getSettings);

router.patch(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(UpdateSettingSchema),
  controller.updateSettings,
);

module.exports = router;
