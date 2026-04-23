const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const {
  validateGetNotifications,
  validateNotificationId,
} = require("../validators/notificationValidator");

router.use(auth);

router.get("/", validateGetNotifications, getMyNotifications);

router.get("/unread-count", getUnreadCount);

router.patch("/read-all", markAllAsRead);

router.patch("/:id/read", validateNotificationId, markAsRead);

module.exports = router;
