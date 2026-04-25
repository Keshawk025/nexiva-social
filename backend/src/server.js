const http = require("http");
const { Server } = require("socket.io");
const env = require("./config/env");
const { connectDb } = require("./config/db");
const { createApp } = require("./app");
const { setupSocket } = require("./socket");

async function startServer() {
  await connectDb(env.mongoUri);

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  app.set("io", io);
  setupSocket(io);

  server.listen(env.port, () => {
    console.log(`API server listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
