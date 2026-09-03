const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Keep local uploads folder intact so previous uploads are never lost
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage keeps the incoming file in buffer to stream directly to Cloudflare R2
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: config.upload.maxFileSize || 50 * 1024 * 1024 }, // 50MB default
});

module.exports = upload;

