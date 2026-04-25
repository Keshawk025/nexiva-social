const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getFeed, createPost, toggleLike, addComment } = require("../controllers/postController");
const {
  validateComment,
  validateCreatePost,
  validateObjectIdParam
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.route("/").get(protect, getFeed).post(protect, validateCreatePost, createPost);
router.post("/:postId/like", protect, validateObjectIdParam("postId", "postId"), toggleLike);
router.post(
  "/:postId/comments",
  protect,
  validateObjectIdParam("postId", "postId"),
  validateComment,
  addComment
);

module.exports = router;
