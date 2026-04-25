const express = require("express");
const multer = require("multer");
const path = require("path");
const env = require("../config/env");
const { protect } = require("../middleware/authMiddleware");
const { uploadImage } = require("../controllers/uploadController");
const { handleUploadError } = require("../middleware/validationMiddleware");
const { buildStoredFileName, isLocalStorage } = require("../services/storageService");

const localDiskStorage = multer.diskStorage({
  destination: env.uploadDir,
  filename: (req, file, cb) => {
    cb(null, buildStoredFileName(file.originalname));
  }
});

const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: isLocalStorage() ? localDiskStorage : memoryStorage,
  limits: { fileSize: env.maxUploadFileSizeBytes },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

    if (!file.mimetype.startsWith("image/") || !allowedExts.has(ext)) {
      return cb(new Error("Only image uploads are allowed"));
    }

    cb(null, true);
  }
});
const router = express.Router();

router.post(
  "/image",
  protect,
  (req, res, next) => {
    if (!req.headers["content-length"] && !isLocalStorage()) {
      req.socket.setTimeout(30_000);
    }

    return next();
  },
  upload.single("image"),
  handleUploadError,
  (req, res, next) => {
    if (req.file && !req.file.generatedFileName) {
      req.file.generatedFileName = buildStoredFileName(req.file.originalname);
    }
    next();
  },
  uploadImage
);

module.exports = router;
