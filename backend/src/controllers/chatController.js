const { asyncHandler } = require("../utils/asyncHandler");
const {
  createOrGetConversation,
  getConversationMessages,
  getConversationsForUser
} = require("../services/chatService");

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await getConversationsForUser(req.user._id);
  res.json({ conversations });
});

const createOrGetConversationHandler = asyncHandler(async (req, res) => {
  const conversation = await createOrGetConversation({
    userId: req.user._id,
    participantId: req.body.participantId
  });
  res.status(201).json({ conversation });
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await getConversationMessages({
    conversationId: req.params.conversationId,
    userId: req.user._id
  });
  res.json({ messages });
});

module.exports = {
  createOrGetConversation: createOrGetConversationHandler,
  getConversations,
  getMessages
};
