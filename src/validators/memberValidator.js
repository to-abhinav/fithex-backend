const { body, param } = require("express-validator");
const validate = require("./validate");

const validateCreateMember = [
  body("userId")
    .notEmpty().withMessage("userId is required.")
    .isMongoId().withMessage("userId must be a valid MongoDB ObjectId."),

  body("gymId")
    .notEmpty().withMessage("gymId is required.")
    .isMongoId().withMessage("gymId must be a valid MongoDB ObjectId."),

  body("subscriptionPlan")
    .optional()
    .isMongoId().withMessage("subscriptionPlan must be a valid MongoDB ObjectId."),

  body("subscriptionMonths")
    .notEmpty().withMessage("subscriptionMonths is required.")
    .isInt({ min: 1, max: 60 }).withMessage("subscriptionMonths must be a positive integer (1–60)."),

  body("startDate")
    .optional()
    .isISO8601().withMessage("startDate must be a valid ISO 8601 date."),

  body("status")
    .optional()
    .isIn(["active", "inactive"]).withMessage("status must be 'active' or 'inactive'."),

  validate,
];

const validateRenewMembership = [
  param("id").isMongoId().withMessage("Invalid member ID."),

  body("subscriptionMonths")
    .notEmpty().withMessage("subscriptionMonths is required.")
    .isInt({ min: 1, max: 60 }).withMessage("subscriptionMonths must be a positive integer (1–60)."),

  body("subscriptionPlan")
    .optional()
    .isMongoId().withMessage("subscriptionPlan must be a valid MongoDB ObjectId."),

  validate,
];

const validateMemberId = [
  param("id").isMongoId().withMessage("Invalid member ID."),
  validate,
];

const validateUpdateMemberNotes = [
  param("id").isMongoId().withMessage("Invalid member ID."),

  body("notes")
    .optional()
    .isString().withMessage("Notes must be a string.")
    .isLength({ max: 2000 }).withMessage("Notes must not exceed 2000 characters."),

  body("tags")
    .optional()
    .isArray({ max: 10 }).withMessage("Tags must be an array with max 10 items."),

  body("tags.*")
    .optional()
    .isString().withMessage("Each tag must be a string.")
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage("Each tag must be 1-50 characters."),

  body().custom((value, { req }) => {
    const { notes, tags } = req.body;
    if (notes === undefined && tags === undefined) {
      throw new Error("At least one of notes or tags is required.");
    }
    return true;
  }),

  validate,
];

module.exports = {
  validateCreateMember,
  validateRenewMembership,
  validateMemberId,
  validateUpdateMemberNotes,
};
