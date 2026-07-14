const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const makeStorage = (subfolder) => {
  const dest = path.join(process.cwd(), env.upload.dir, subfolder);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
};

const imageFileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(ApiError.badRequest('Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
  }
  return cb(null, true);
};

const documentFileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(ApiError.badRequest('Only JPG, PNG, WEBP, and PDF files are allowed.'));
  }
  return cb(null, true);
};

const maxSize = env.upload.maxFileSizeMb * 1024 * 1024;

const uploadCropImage = multer({
  storage: makeStorage('crop-images'),
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
}).single('image');

const uploadReceipt = multer({
  storage: makeStorage('receipts'),
  fileFilter: documentFileFilter,
  limits: { fileSize: maxSize },
}).single('receipt');

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
}).single('avatar');

/** Wraps a multer single-file middleware so Multer errors flow into the centralized error handler. */
const handleUpload = (uploader) => (req, res, next) => {
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(ApiError.badRequest(`Upload error: ${err.message}`));
    }
    if (err) return next(err);
    return next();
  });
};

module.exports = {
  uploadCropImage: handleUpload(uploadCropImage),
  uploadReceipt: handleUpload(uploadReceipt),
  uploadAvatar: handleUpload(uploadAvatar),
};
