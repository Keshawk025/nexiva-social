const User = require("../models/User");
const { getUserFromToken } = require("../services/authService");
const { sendConversationMessage } = require("../services/chatService");

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      socket.user = await getUserFromToken(token, "name username avatarUrl");
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id.toString()}`);

    socket.on("chat:join", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("chat:send", async ({ conversationId, content }) => {
      try {
        await sendConversationMessage({
          conversationId,
          content,
          io,
          sender: socket.user
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "test") {
          console.error(error);
        }
      }
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(socket.user._id, { lastSeenAt: new Date() });
    });
  });
}

module.exports = { setupSocket };
