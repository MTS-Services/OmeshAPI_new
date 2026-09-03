const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

// Initialize S3Client pointing to Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

/**
 * Upload buffer to Cloudflare R2
 * @param {Object} file - Multer file object with memory buffer
 * @param {string} [folder='media'] - Optional folder prefix inside bucket
 * @returns {Promise<string>} Public URL of the uploaded file
 */
const uploadToR2 = async (file, folder = 'media') => {
  const fileExt = path.extname(file.originalname);
  const randomName = crypto.randomBytes(16).toString('hex');
  const sanitizedOriginalName = path.basename(file.originalname, fileExt)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const key = `${folder}/${Date.now()}-${randomName}-${sanitizedOriginalName}${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2Client.send(command);

  // Normalize public domain (remove trailing slash if any)
  const domain = (config.r2.publicDomain || '').replace(/\/$/, '');
  return `${domain}/${key}`;
};

/**
 * Delete object from Cloudflare R2 by key or full URL
 * @param {string} fileUrlOrKey
 */
const deleteFromR2 = async (fileUrlOrKey) => {
  if (!fileUrlOrKey) return;

  let key = fileUrlOrKey;
  if (config.r2.publicDomain && fileUrlOrKey.startsWith(config.r2.publicDomain)) {
    key = fileUrlOrKey.replace(`${config.r2.publicDomain.replace(/\/$/, '')}/`, '');
  }

  const command = new DeleteObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  });

  await r2Client.send(command);
};

module.exports = {
  r2Client,
  uploadToR2,
  deleteFromR2,
};
