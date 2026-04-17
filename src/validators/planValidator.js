const { body, param } = require("express-validator");
const validate = require("./validate");

const VALID_PLAN_NAMES     = ["Monthly", "Quarterly", "Half-Yearly", "Yearly", "Custom"];
const VALID_PLAN_CATEGORIES = ["Strength", "Cardio", "Yoga"];

const validateCreatePlan = [
  body("gymId")
    .notEmpty().withMessage("gymId is required.")
    .isMongoId().withMessage("gymId must be a valid MongoDB ObjectId."),

  body("name")
    .notEmpty().withMessage("Plan name is required.")
    .isIn(VALID_PLAN_NAMES)
    .withMessage(`Plan name must be one of: ${VALID_PLAN_NAMES.join(", ")}.`),

  body("category")
    .notEmpty().withMessage("Plan category is required.")
    .isIn(VALID_PLAN_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_PLAN_CATEGORIES.join(", ")}.`),

  body("price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),

  body("durationInMonths")
    .notEmpty().withMessage("durationInMonths is required.")
    .isInt({ min: 1 }).withMessage("durationInMonths must be a positive integer."),

  validate,
];

const validateUpdatePlan = [
  param("id").isMongoId().withMessage("Invalid plan ID."),

  body("name")
    .optional()
    .isIn(VALID_PLAN_NAMES)
    .withMessage(`Plan name must be one of: ${VALID_PLAN_NAMES.join(", ")}.`),

  body("category")
    .optional()
    .isIn(VALID_PLAN_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_PLAN_CATEGORIES.join(", ")}.`),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),

  body("durationInMonths")
    .optional()
    .isInt({ min: 1 }).withMessage("durationInMonths must be a positive integer."),

  validate,
];

const validatePlanId = [
  param("id").isMongoId().withMessage("Invalid plan ID."),
  validate,
];

const validateGymIdParam = [
  param("gymId").isMongoId().withMessage("Invalid gym ID in URL."),
  validate,
];

module.exports = {
  validateCreatePlan,
  validateUpdatePlan,
  validatePlanId,
  validateGymIdParam,
};
