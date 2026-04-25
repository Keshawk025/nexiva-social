const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getNotifications, markAllRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllRead);

module.exports = router;
