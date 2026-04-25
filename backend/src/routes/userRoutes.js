const express = require("express");
const { getProfile, updateMe, searchUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { validateProfileUpdate, validateUserSearch } = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/search", protect, validateUserSearch, searchUsers);
router.put("/me", protect, validateProfileUpdate, updateMe);
router.get("/:username", protect, getProfile);

module.exports = router;
