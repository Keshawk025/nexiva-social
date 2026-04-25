const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { apiLimiter, authLimiter } = require("./middleware/rateLimitMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true
    })
  );
  app.use(
    morgan(env.isProduction ? "combined" : "dev", {
      skip: () => env.nodeEnv === "test"
    })
  );
  app.use(apiLimiter);
  app.use(express.json({ limit: env.jsonBodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: env.jsonBodyLimit }));
  app.use("/uploads", express.static(path.resolve(env.uploadDir)));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/uploads", uploadRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
