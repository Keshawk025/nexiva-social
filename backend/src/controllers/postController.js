const { asyncHandler } = require("../utils/asyncHandler");
const { addComment, createPost, getFeedPosts, toggleLike } = require("../services/postService");

const getFeed = asyncHandler(async (req, res) => {
  const posts = await getFeedPosts();
  res.json({ posts });
});

const createPostHandler = asyncHandler(async (req, res) => {
  const post = await createPost({
    authorId: req.user._id,
    content: req.body.content,
    imageUrl: req.body.imageUrl
  });
  res.status(201).json({ post });
});

const toggleLikeHandler = asyncHandler(async (req, res) => {
  const post = await toggleLike({
    postId: req.params.postId,
    actor: req.user,
    io: req.app.get("io")
  });
  res.json({ post });
});

const addCommentHandler = asyncHandler(async (req, res) => {
  const post = await addComment({
    postId: req.params.postId,
    actor: req.user,
    content: req.body.content,
    io: req.app.get("io")
  });
  res.status(201).json({ post });
});

module.exports = {
  addComment: addCommentHandler,
  createPost: createPostHandler,
  getFeed,
  toggleLike: toggleLikeHandler
};
