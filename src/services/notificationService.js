const Notification = require("../models/Notification");

/**
 * Create and persist a notification.
 *
 * If `refId` is provided and a notification with that refId already exists,
 * the call is silently skipped (idempotent).
 *
 * @param {string} userId   - Recipient user ObjectId
 * @param {string} type     - One of NOTIFICATION_TYPES values
 * @param {string} title    - Short headline
 * @param {string} message  - Descriptive body text
 * @param {object} [data]   - Optional structured payload
 * @param {string} [refId]  - Optional idempotency key
 * @returns {Promise<object|null>} The created notification, or null if duplicate
 */
const send = async (userId, type, title, message, data = null, refId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      refId: refId || undefined, 
    });
    return notification;
  } catch (err) {
    if (err.code === 11000 && refId) {
      return null;
    }
    throw err;
  }
};


const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId, read: false },
    { read: true, readAt: new Date() },
    { new: true }
  );
  return notification;
};


const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
  return result.modifiedCount;
};


const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, read: false });
};

module.exports = {
  send,
  getUserNotifications,
  markAsRead,
  markAllRead,
  getUnreadCount,
};
