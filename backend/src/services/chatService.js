const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { createNotification } = require("./notificationService");
const { HttpError } = require("../utils/httpError");

async function getConversationsForUser(userId) {
  return Conversation.find({
    participants: userId
  })
    .populate("participants", "name username avatarUrl")
    .sort({ lastMessageAt: -1 });
}

async function createOrGetConversation({ userId, participantId }) {
  if (participantId === userId.toString()) {
    throw new HttpError(400, "You cannot start a conversation with yourself");
  }

  const participant = await User.findById(participantId);
  if (!participant) {
    throw new HttpError(404, "Participant not found");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, participantId], $size: 2 }
  }).populate("participants", "name username avatarUrl");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, participantId]
    });
    conversation = await conversation.populate("participants", "name username avatarUrl");
  }

  return conversation;
}

async function getConversationMessages({ conversationId, userId }) {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation || !conversation.participants.some((id) => id.toString() === userId.toString())) {
    throw new HttpError(404, "Conversation not found");
  }

  return Message.find({ conversation: conversation._id })
    .populate("sender", "name username avatarUrl")
    .sort({ createdAt: 1 });
}

async function sendConversationMessage({ conversationId, sender, content, io }) {
  const trimmedContent = content?.trim();
  if (!conversationId || !trimmedContent) {
    throw new HttpError(400, "conversationId and content are required");
  }

  const conversation = await Conversation.findById(conversationId).populate(
    "participants",
    "name username avatarUrl"
  );

  if (!conversation) {
    throw new HttpError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant._id.toString() === sender._id.toString()
  );

  if (!isParticipant) {
    throw new HttpError(403, "You are not a participant in this conversation");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: sender._id,
    content: trimmedContent,
    readBy: [sender._id]
  });

  conversation.lastMessage = trimmedContent;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const populatedMessage = await message.populate("sender", "name username avatarUrl");

  if (io) {
    io.to(`conversation:${conversationId}`).emit("chat:message", populatedMessage);
  }

  const recipients = conversation.participants.filter(
    (participant) => participant._id.toString() !== sender._id.toString()
  );

  for (const recipient of recipients) {
    await createNotification(io, {
      recipient: recipient._id,
      actor: sender._id,
      type: "message",
      conversation: conversationId,
      message: `${sender.name} sent you a message`
    });
  }

  return populatedMessage;
}

module.exports = {
  createOrGetConversation,
  getConversationMessages,
  getConversationsForUser,
  sendConversationMessage
};
