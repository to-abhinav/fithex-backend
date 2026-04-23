const { body, param, query } = require("express-validator");
const validate = require("./validate");

const validateCreateAnnouncement = [
  body("title")
    .notEmpty().withMessage("Title is required.")
    .trim()
    .isLength({ max: 150 }).withMessage("Title must not exceed 150 characters."),

  body("message")
    .notEmpty().withMessage("Message is required.")
    .trim()
    .isLength({ max: 2000 }).withMessage("Message must not exceed 2000 characters."),

  body("category")
    .optional()
    .isIn(["general", "schedule", "offer", "closure", "event"])
    .withMessage("Category must be one of: general, schedule, offer, closure, event."),

  validate,
];

const validateAnnouncementId = [
  param("id")
    .isMongoId().withMessage("Invalid announcement ID."),

  validate,
];

const validateAnnouncementGymId = [
  param("gymId")
    .isMongoId().withMessage("Invalid gym ID."),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer."),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50."),

  validate,
];

module.exports = {
  validateCreateAnnouncement,
  validateAnnouncementId,
  validateAnnouncementGymId,
};
