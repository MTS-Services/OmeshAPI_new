const { asyncHandler } = require('../../middlewares/errorHandler');
const { uploadToR2 } = require('../../services/r2.service');

class UploadController {
  uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please upload at least one file.' });
    }

    // Upload each file to Cloudflare R2
    const fileUrls = await Promise.all(
      req.files.map((file) => uploadToR2(file, 'media'))
    );

    res.sendSuccess(fileUrls, 'Files uploaded successfully to R2');
  });

  uploadSingle = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file.' });
    }

    // Upload single file to Cloudflare R2
    const fileUrl = await uploadToR2(req.file, 'media');

    res.sendSuccess({ url: fileUrl }, 'File uploaded successfully to R2');
  });
}

module.exports = UploadController;

