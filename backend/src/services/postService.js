const Post = require("../models/Post");
const { createNotification } = require("./notificationService");
const { HttpError } = require("../utils/httpError");

function postByIdQuery(postId) {
  return Post.findById(postId)
    .populate("author", "name username avatarUrl")
    .populate("comments.author", "name username avatarUrl");
}

async function getFeedPosts() {
  return Post.find()
    .populate("author", "name username avatarUrl")
    .populate("comments.author", "name username avatarUrl")
    .sort({ createdAt: -1 })
    .limit(50);
}

async function createPost({ authorId, content, imageUrl }) {
  const post = await Post.create({
    author: authorId,
    content,
    imageUrl: imageUrl || ""
  });

  return post.populate("author", "name username avatarUrl");
}

async function toggleLike({ postId, actor, io }) {
  const post = await Post.findById(postId).populate("author", "name username avatarUrl");

  if (!post) {
    throw new HttpError(404, "Post not found");
  }

  const actorId = actor._id.toString();
  const hasLiked = post.likes.some((id) => id.toString() === actorId);

  if (hasLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== actorId);
  } else {
    post.likes.push(actor._id);

    if (post.author._id.toString() !== actorId) {
      await createNotification(io, {
        recipient: post.author._id,
        actor: actor._id,
        type: "like",
        post: post._id,
        message: `${actor.name} liked your post`
      });
    }
  }

  await post.save();
  return postByIdQuery(post._id);
}

async function addComment({ postId, actor, content, io }) {
  const post = await Post.findById(postId).populate("author", "name username avatarUrl");

  if (!post) {
    throw new HttpError(404, "Post not found");
  }

  post.comments.push({ author: actor._id, content });
  await post.save();

  if (post.author._id.toString() !== actor._id.toString()) {
    await createNotification(io, {
      recipient: post.author._id,
      actor: actor._id,
      type: "comment",
      post: post._id,
      message: `${actor.name} commented on your post`
    });
  }

  return postByIdQuery(post._id);
}

module.exports = {
  addComment,
  createPost,
  getFeedPosts,
  toggleLike
};
