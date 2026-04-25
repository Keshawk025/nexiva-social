const { asyncHandler } = require("../utils/asyncHandler");
const {
  getNotificationsForUser,
  markAllNotificationsRead
} = require("../services/notificationService");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await getNotificationsForUser(req.user._id);
  res.json({ notifications });
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsRead(req.user._id);
  res.json(result);
});

module.exports = { getNotifications, markAllRead };
