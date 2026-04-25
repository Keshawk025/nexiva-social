process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.UPLOAD_DIR = "backend/test-uploads";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { connectDb } = require("../src/config/db");
const { createApp } = require("../src/app");
const Notification = require("../src/models/Notification");
const { sendConversationMessage } = require("../src/services/chatService");

let mongod;
let app;

function noopIo() {
  return {
    to() {
      return {
        emit() {}
      };
    }
  };
}

async function registerUser(overrides = {}) {
  const payload = {
    name: "Test User",
    email: `user-${Math.random().toString(16).slice(2)}@example.com`,
    username: `user_${Math.random().toString(16).slice(2, 10)}`,
    password: "password123",
    ...overrides
  };

  const response = await request(app).post("/api/auth/register").send(payload);
  assert.equal(response.status, 201);
  return { ...payload, ...response.body };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri());
  app = createApp();
  app.set("io", noopIo());
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test.beforeEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

test("auth register, login, and me flow works", async () => {
  const registration = await registerUser({
    name: "Alice",
    email: "alice@example.com",
    username: "alice"
  });

  assert.ok(registration.token);
  assert.equal(registration.user.email, "alice@example.com");

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "alice@example.com",
    password: "password123"
  });

  assert.equal(loginResponse.status, 200);
  assert.ok(loginResponse.body.token);

  const meResponse = await request(app)
    .get("/api/auth/me")
    .set(authHeader(loginResponse.body.token));

  assert.equal(meResponse.status, 200);
  assert.equal(meResponse.body.user.username, "alice");
});

test("feed flow supports create, like, and comment with notifications", async () => {
  const author = await registerUser({
    name: "Author",
    email: "author@example.com",
    username: "author"
  });
  const actor = await registerUser({
    name: "Actor",
    email: "actor@example.com",
    username: "actor"
  });

  const postResponse = await request(app)
    .post("/api/posts")
    .set(authHeader(author.token))
    .send({ content: "Hello world" });

  assert.equal(postResponse.status, 201);
  const postId = postResponse.body.post._id;

  const likeResponse = await request(app)
    .post(`/api/posts/${postId}/like`)
    .set(authHeader(actor.token))
    .send({});

  assert.equal(likeResponse.status, 200);
  assert.equal(likeResponse.body.post.likes.length, 1);

  const commentResponse = await request(app)
    .post(`/api/posts/${postId}/comments`)
    .set(authHeader(actor.token))
    .send({ content: "Nice post" });

  assert.equal(commentResponse.status, 201);
  assert.equal(commentResponse.body.post.comments.length, 1);

  const feedResponse = await request(app)
    .get("/api/posts")
    .set(authHeader(author.token));

  assert.equal(feedResponse.status, 200);
  assert.equal(feedResponse.body.posts.length, 1);

  const notifications = await Notification.find({ recipient: author.user._id });
  assert.equal(notifications.length, 2);
});

test("chat flow creates conversations and returns message history", async () => {
  const alice = await registerUser({
    name: "Alice",
    email: "alice-chat@example.com",
    username: "alice_chat"
  });
  const bob = await registerUser({
    name: "Bob",
    email: "bob-chat@example.com",
    username: "bob_chat"
  });

  const conversationResponse = await request(app)
    .post("/api/chat/conversations")
    .set(authHeader(alice.token))
    .send({ participantId: bob.user._id });

  assert.equal(conversationResponse.status, 201);
  const conversationId = conversationResponse.body.conversation._id;

  await sendConversationMessage({
    conversationId,
    content: "Hey Bob",
    io: noopIo(),
    sender: { _id: alice.user._id, name: "Alice" }
  });

  const messagesResponse = await request(app)
    .get(`/api/chat/conversations/${conversationId}/messages`)
    .set(authHeader(bob.token));

  assert.equal(messagesResponse.status, 200);
  assert.equal(messagesResponse.body.messages.length, 1);
  assert.equal(messagesResponse.body.messages[0].content, "Hey Bob");
});

test("notifications API lists and marks notifications as read", async () => {
  const author = await registerUser({
    name: "Notify Author",
    email: "notify-author@example.com",
    username: "notify_author"
  });
  const actor = await registerUser({
    name: "Notify Actor",
    email: "notify-actor@example.com",
    username: "notify_actor"
  });

  const postResponse = await request(app)
    .post("/api/posts")
    .set(authHeader(author.token))
    .send({ content: "Trigger notifications" });
  const postId = postResponse.body.post._id;

  await request(app)
    .post(`/api/posts/${postId}/like`)
    .set(authHeader(actor.token))
    .send({});

  const listResponse = await request(app)
    .get("/api/notifications")
    .set(authHeader(author.token));

  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.notifications.length, 1);
  assert.equal(listResponse.body.notifications[0].isRead, false);

  const markReadResponse = await request(app)
    .patch("/api/notifications/read-all")
    .set(authHeader(author.token))
    .send({});

  assert.equal(markReadResponse.status, 200);

  const refreshed = await request(app)
    .get("/api/notifications")
    .set(authHeader(author.token));

  assert.equal(refreshed.status, 200);
  assert.equal(refreshed.body.notifications[0].isRead, true);
});
