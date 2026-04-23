const { body, param } = require("express-validator");
const validate = require("./validate");

const validateCreateClosure = [
  body("date")
    .notEmpty().withMessage("date is required.")
    .isISO8601().withMessage("date must be a valid ISO 8601 date."),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Reason must not exceed 200 characters."),

  body("type")
    .optional()
    .isIn(["holiday", "maintenance", "event", "other"])
    .withMessage("type must be one of: holiday, maintenance, event, other."),

  validate,
];

const validateClosureDate = [
  param("date")
    .notEmpty().withMessage("date parameter is required.")
    .isISO8601().withMessage("date must be a valid ISO 8601 date."),

  validate,
];

const validateClosureGymId = [
  param("gymId")
    .isMongoId().withMessage("Invalid gym ID."),

  validate,
];

module.exports = {
  validateCreateClosure,
  validateClosureDate,
  validateClosureGymId,
};
