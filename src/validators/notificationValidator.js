const { query, param } = require("express-validator");

const validateGetNotifications = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .toInt(),
];

const validateNotificationId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid notification ID"),
];

module.exports = {
  validateGetNotifications,
  validateNotificationId,
};
