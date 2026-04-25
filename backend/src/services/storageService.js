const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const env = require("../config/env");

if (env.storageDriver === "local") {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

let s3Client;

function getFileExtension(originalName = "") {
  return path.extname(originalName).toLowerCase();
}

function buildStoredFileName(originalName = "") {
  return `${crypto.randomUUID()}${getFileExtension(originalName)}`;
}

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.s3Region,
      endpoint: env.s3Endpoint || undefined,
      forcePathStyle: env.s3ForcePathStyle
    });
  }

  return s3Client;
}

function getS3ObjectKey(fileName) {
  return env.s3KeyPrefix ? `${env.s3KeyPrefix}/${fileName}` : fileName;
}

function getLocalPublicFileUrl(fileName) {
  return `/uploads/${fileName}`;
}

function getS3PublicBaseUrl() {
  if (env.storagePublicBaseUrl) {
    return env.storagePublicBaseUrl.replace(/\/$/, "");
  }

  if (env.s3Endpoint) {
    throw new Error("STORAGE_PUBLIC_BASE_URL must be set when using a custom S3 endpoint");
  }

  return `https://${env.s3BucketName}.s3.${env.s3Region}.amazonaws.com`;
}

function getPublicFileUrl(fileName) {
  if (env.storageDriver === "s3") {
    return `${getS3PublicBaseUrl()}/${getS3ObjectKey(fileName)}`;
  }

  return getLocalPublicFileUrl(fileName);
}

function resolveStoredPath(fileName) {
  if (env.storageDriver !== "local") {
    throw new Error("Local file paths are only available when STORAGE_DRIVER=local");
  }

  return path.join(env.uploadDir, fileName);
}

function isLocalStorage() {
  return env.storageDriver === "local";
}

function isS3Storage() {
  return env.storageDriver === "s3";
}

async function storeUploadedImage(file) {
  if (!file) {
    throw new Error("Image file is required");
  }

  if (isLocalStorage()) {
    const fileName = file.generatedFileName || file.filename;

    if (!fileName) {
      throw new Error("Uploaded file name is missing");
    }

    return {
      key: fileName,
      imageUrl: getPublicFileUrl(fileName)
    };
  }

  const fileName = file.generatedFileName || buildStoredFileName(file.originalname);
  const objectKey = getS3ObjectKey(fileName);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.s3BucketName,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  return {
    key: objectKey,
    imageUrl: getPublicFileUrl(fileName)
  };
}

module.exports = {
  buildStoredFileName,
  getPublicFileUrl,
  isLocalStorage,
  isS3Storage,
  resolveStoredPath,
  storeUploadedImage
};
