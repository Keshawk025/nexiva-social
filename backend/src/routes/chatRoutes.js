const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getConversations, createOrGetConversation, getMessages } = require("../controllers/chatController");
const {
  validateObjectIdParam,
  validateParticipant
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.post("/conversations", protect, validateParticipant, createOrGetConversation);
router.get(
  "/conversations/:conversationId/messages",
  protect,
  validateObjectIdParam("conversationId", "conversationId"),
  getMessages
);

module.exports = router;
