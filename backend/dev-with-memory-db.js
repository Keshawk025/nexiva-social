/**
 * Development launcher: starts an in-memory MongoDB instance and then
 * boots the regular backend server. Requires no local mongod installation.
 * Usage: node dev-with-memory-db.js
 */

const { MongoMemoryServer } = require("mongodb-memory-server");

async function main() {
  console.log("[dev] Starting in-memory MongoDB...");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log("[dev] MongoDB URI:", uri);

  // Inject the URI so the rest of the app uses it
  process.env.MONGODB_URI = uri;

  // Now load and start the actual server
  require("./src/server.js");

  // Keep the mongod instance alive for the lifetime of the process
  process.on("SIGINT", async () => {
    console.log("[dev] Shutting down...");
    await mongod.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[dev] Failed to start:", err);
  process.exit(1);
});
