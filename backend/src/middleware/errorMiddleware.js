function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  if (statusCode >= 500 && process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({
    message: err.message || "Unexpected server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
}

module.exports = { notFound, errorHandler };
