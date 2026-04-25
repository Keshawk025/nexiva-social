const { asyncHandler } = require("../utils/asyncHandler");
const { storeUploadedImage } = require("../services/storageService");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Image file is required");
  }

  const stored = await storeUploadedImage(req.file);
  res.status(201).json(stored);
});

module.exports = { uploadImage };
