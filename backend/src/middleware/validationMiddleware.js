const mongoose = require("mongoose");

function badRequest(res, message) {
  return res.status(400).json({ message });
}

function optionalTrimmedString(value) {
  return typeof value === "string" ? value.trim() : value;
}

function validateRegister(req, res, next) {
  const name = optionalTrimmedString(req.body.name);
  const email = optionalTrimmedString(req.body.email);
  const username = optionalTrimmedString(req.body.username);
  const password = req.body.password;

  if (!name || !email || !username || !password) {
    return badRequest(res, "All registration fields are required");
  }

  if (name.length < 2 || name.length > 50) {
    return badRequest(res, "Name must be between 2 and 50 characters");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return badRequest(res, "A valid email is required");
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return badRequest(res, "Username must be 3-30 characters and use only letters, numbers, or underscores");
  }

  if (typeof password !== "string" || password.length < 6) {
    return badRequest(res, "Password must be at least 6 characters");
  }

  req.body.name = name;
  req.body.email = email.toLowerCase();
  req.body.username = username.toLowerCase();
  next();
}

function validateLogin(req, res, next) {
  const email = optionalTrimmedString(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return badRequest(res, "Email and password are required");
  }

  req.body.email = email.toLowerCase();
  next();
}

function validateProfileUpdate(req, res, next) {
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
    const name = optionalTrimmedString(req.body.name);
    if (!name) {
      return badRequest(res, "Name cannot be empty");
    }
    if (name.length < 2 || name.length > 50) {
      return badRequest(res, "Name must be between 2 and 50 characters");
    }
    payload.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "bio")) {
    const bio = optionalTrimmedString(req.body.bio) || "";
    if (bio.length > 280) {
      return badRequest(res, "Bio must be 280 characters or fewer");
    }
    payload.bio = bio;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "avatarUrl")) {
    const avatarUrl = optionalTrimmedString(req.body.avatarUrl) || "";
    if (avatarUrl && !/^(https?:\/\/|\/uploads\/)/.test(avatarUrl)) {
      return badRequest(res, "Avatar URL must be an absolute URL or uploaded asset path");
    }
    payload.avatarUrl = avatarUrl;
  }

  if (!Object.keys(payload).length) {
    return badRequest(res, "At least one profile field must be provided");
  }

  req.body = payload;
  next();
}

function validateCreatePost(req, res, next) {
  const content = optionalTrimmedString(req.body.content);
  const imageUrl = optionalTrimmedString(req.body.imageUrl) || "";

  if (!content) {
    return badRequest(res, "Post content is required");
  }

  if (content.length > 500) {
    return badRequest(res, "Post content must be 500 characters or fewer");
  }

  if (imageUrl && !/^(https?:\/\/|\/uploads\/)/.test(imageUrl)) {
    return badRequest(res, "Image URL must be an absolute URL or uploaded asset path");
  }

  req.body.content = content;
  req.body.imageUrl = imageUrl;
  next();
}

function validateComment(req, res, next) {
  const content = optionalTrimmedString(req.body.content);

  if (!content) {
    return badRequest(res, "Comment content is required");
  }

  if (content.length > 280) {
    return badRequest(res, "Comment content must be 280 characters or fewer");
  }

  req.body.content = content;
  next();
}

function validateParticipant(req, res, next) {
  const participantId = optionalTrimmedString(req.body.participantId);

  if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
    return badRequest(res, "Valid participantId is required");
  }

  req.body.participantId = participantId;
  next();
}

function validateObjectIdParam(paramName, label = paramName) {
  return function validateParam(req, res, next) {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return badRequest(res, `Valid ${label} is required`);
    }

    next();
  };
}

function validateUserSearch(req, res, next) {
  const query = optionalTrimmedString(req.query.q || "");

  if (query.length > 100) {
    return badRequest(res, "Search query must be 100 characters or fewer");
  }

  req.query.q = query;
  next();
}

function handleUploadError(err, req, res, next) {
  if (!err) {
    return next();
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return badRequest(res, "Image exceeds the configured maximum size");
  }

  return badRequest(res, err.message || "Invalid upload");
}

module.exports = {
  handleUploadError,
  validateComment,
  validateCreatePost,
  validateLogin,
  validateObjectIdParam,
  validateParticipant,
  validateProfileUpdate,
  validateRegister,
  validateUserSearch
};
