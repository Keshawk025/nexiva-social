const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.json({ user });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = name ?? user.name;
  user.bio = bio ?? user.bio;
  user.avatarUrl = avatarUrl ?? user.avatarUrl;
  await user.save();

  // Return a safe projection — never expose the password hash
  const safeUser = await User.findById(user._id).select("-password");
  res.json({ user: safeUser });
});

const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();
  const filter = query
    ? {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } }
        ]
      }
    : {};

  const users = await User.find(filter).select("name username avatarUrl bio").limit(10);
  res.json({ users });
});

module.exports = { getProfile, updateMe, searchUsers };
