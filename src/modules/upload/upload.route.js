const express = require('express');
const UploadController = require('./upload.contoller');
const upload = require('../../middlewares/upload');
const router = express.Router();

const uploadController = new UploadController();

router.post(
  '/multiple',
  upload.array('images', 10),
  uploadController.uploadMultiple,
);

router.post('/single', upload.single('images'), uploadController.uploadSingle);

module.exports = router;
