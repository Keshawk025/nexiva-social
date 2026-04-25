const Notification = require("../models/Notification");

async function createNotification(io, payload) {
  const notification = await Notification.create(payload);
  const populated = await notification.populate("actor", "name username avatarUrl");

  if (io) {
    io.to(`user:${payload.recipient.toString()}`).emit("notification:new", populated);
  }
  return populated;
}

async function getNotificationsForUser(userId) {
  return Notification.find({ recipient: userId })
    .populate("actor", "name username avatarUrl")
    .sort({ createdAt: -1 })
    .limit(50);
}

async function markAllNotificationsRead(userId) {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  return { success: true };
}

module.exports = { createNotification, getNotificationsForUser, markAllNotificationsRead };
