const { asyncHandler } = require('../../middlewares/errorHandler');

class UploadController {
  uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please upload at least one image.' });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.sendSuccess(imageUrls, 'Image get successfully');
  });

  uploadSingle = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.sendSuccess({ url: imageUrl }, 'Image uploaded successfully');
  });
}

module.exports = UploadController;
