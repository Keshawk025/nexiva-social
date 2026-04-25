class HttpError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = options.code;
  }
}

function ensure(condition, statusCode, message, options) {
  if (!condition) {
    throw new HttpError(statusCode, message, options);
  }
}

module.exports = { HttpError, ensure };
