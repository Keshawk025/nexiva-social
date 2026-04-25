const { asyncHandler } = require("../utils/asyncHandler");
const { loginUser, registerUser } = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const auth = await registerUser(req.body);
  res.status(201).json(auth);
});

const login = asyncHandler(async (req, res) => {
  const auth = await loginUser(req.body);
  res.json(auth);
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getMe };
