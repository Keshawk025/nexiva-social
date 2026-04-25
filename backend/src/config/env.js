const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

function getNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return parsed;
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const jwtSecret = process.env.JWT_SECRET || "development_secret";
const storageDriver = process.env.STORAGE_DRIVER || "local";
const s3BucketName = process.env.S3_BUCKET_NAME || "";
const s3Region = process.env.S3_REGION || "";
const s3Endpoint = process.env.S3_ENDPOINT || "";
const s3KeyPrefix = (process.env.S3_KEY_PREFIX || "uploads").replace(/^\/+|\/+$/g, "");

if (isProduction && jwtSecret === "development_secret") {
  throw new Error("JWT_SECRET must be set in production");
}

if (!["local", "s3"].includes(storageDriver)) {
  throw new Error("STORAGE_DRIVER must be either 'local' or 's3'");
}

if (storageDriver === "s3") {
  if (!s3BucketName) {
    throw new Error("S3_BUCKET_NAME must be set when STORAGE_DRIVER=s3");
  }

  if (!s3Region) {
    throw new Error("S3_REGION must be set when STORAGE_DRIVER=s3");
  }
}

module.exports = {
  authRateLimitMax: getNumber("AUTH_RATE_LIMIT_MAX", 10),
  authRateLimitWindowMs: getNumber("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  isProduction,
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "1mb",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtSecret,
  maxUploadFileSizeBytes: getNumber("MAX_UPLOAD_FILE_SIZE_BYTES", 5 * 1024 * 1024),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nexiva",
  nodeEnv,
  port: process.env.PORT || 5000,
  rateLimitMax: getNumber("RATE_LIMIT_MAX", 200),
  rateLimitWindowMs: getNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  s3BucketName,
  s3Endpoint,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  s3KeyPrefix,
  s3Region,
  storageDriver,
  storagePublicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL || "",
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads")
};
