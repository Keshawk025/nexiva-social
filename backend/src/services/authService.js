const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const { generateToken } = require("../utils/generateToken");
const { HttpError } = require("../utils/httpError");

function buildAuthResponse(user) {
  return {
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl
    }
  };
}

async function registerUser({ name, email, username, password }) {
  const existing = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existing) {
    throw new HttpError(409, "Email or username already in use");
  }

  const user = await User.create({
    name,
    email,
    username,
    password
  });

  return buildAuthResponse(user);
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password || ""))) {
    throw new HttpError(401, "Invalid email or password");
  }

  return buildAuthResponse(user);
}

async function getUserFromToken(token, projection = "-password") {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.userId).select(projection);

    if (!user) {
      throw new HttpError(401, "User no longer exists");
    }

    return user;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, "Invalid authorization token");
  }
}

module.exports = {
  buildAuthResponse,
  getUserFromToken,
  loginUser,
  registerUser
};
