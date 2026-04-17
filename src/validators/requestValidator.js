const { body, param } = require("express-validator");
const validate = require("./validate");

const validateApplyToGym = [
  body("gymId")
    .notEmpty().withMessage("gymId is required.")
    .isMongoId().withMessage("gymId must be a valid MongoDB ObjectId."),

  body("planId")
    .notEmpty().withMessage("planId is required.")
    .isMongoId().withMessage("planId must be a valid MongoDB ObjectId."),

  body("paymentMode")
    .notEmpty().withMessage("paymentMode is required.")
    .isIn(["Online", "Offline"]).withMessage("paymentMode must be 'Online' or 'Offline'."),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Note must not exceed 500 characters."),

  validate,
];

const validateRejectRequest = [
  param("id").isMongoId().withMessage("Invalid request ID."),

  body("rejectionReason")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Rejection reason must not exceed 500 characters."),

  validate,
];

const validateRequestId = [
  param("id").isMongoId().withMessage("Invalid request ID."),
  validate,
];

module.exports = {
  validateApplyToGym,
  validateRejectRequest,
  validateRequestId,
};
