const { validationResult } = require("express-validator");
const notificationService = require("../services/notificationService");

const getMyNotifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    const result = await notificationService.getUserNotifications(req.user, {
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user
    );

    if (!notification) {
      return res
        .status(404)
        .json({ message: "Notification not found or already read" });
    }

    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const count = await notificationService.markAllRead(req.user);
    res.status(200).json({ message: `Marked ${count} notifications as read` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
