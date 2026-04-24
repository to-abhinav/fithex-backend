const { body, param } = require("express-validator");
const validate = require("./validate");

const VALID_PLAN_NAMES     = ["Monthly", "Quarterly", "Half-Yearly", "Yearly", "Custom"];
const VALID_PLAN_CATEGORIES = ["Strength", "Cardio", "Yoga"];

const pricingRules = (required = false) => {
  const wrap = (chain) => (required ? chain : chain.optional());

  return [
    wrap(body("price"))
      .isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),

    body("originalPrice")
      .optional()
      .isFloat({ min: 0 }).withMessage("originalPrice must be a non-negative number."),

    body("discountPercent")
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage("discountPercent must be between 0 and 100."),

    body("taxPercent")
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage("taxPercent must be between 0 and 100."),

    // Cross-field: originalPrice should be >= price
    body("originalPrice").optional().custom((value, { req }) => {
      if (value != null && req.body.price != null && value < req.body.price) {
        throw new Error("originalPrice must be greater than or equal to price.");
      }
      return true;
    }),
  ];
};

const offerRules = () => [
  body("offerLabel")
    .optional()
    .isString().withMessage("offerLabel must be a string.")
    .isLength({ max: 50 }).withMessage("offerLabel cannot exceed 50 characters."),

  body("offerExpiresAt")
    .optional({ nullable: true })
    .isISO8601().withMessage("offerExpiresAt must be a valid ISO 8601 date."),
];

// ── Create Plan ────────────────────────────────────────────────────────────
const validateCreatePlan = [
  body("name")
    .notEmpty().withMessage("Plan name is required.")
    .isIn(VALID_PLAN_NAMES)
    .withMessage(`Plan name must be one of: ${VALID_PLAN_NAMES.join(", ")}.`),

  body("category")
    .notEmpty().withMessage("Plan category is required.")
    .isIn(VALID_PLAN_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_PLAN_CATEGORIES.join(", ")}.`),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string.")
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters."),

  body("features")
    .optional()
    .isArray({ max: 20 }).withMessage("Features must be an array with at most 20 items."),
  body("features.*")
    .optional()
    .isString().withMessage("Each feature must be a string."),

  body("durationInMonths")
    .notEmpty().withMessage("durationInMonths is required.")
    .isInt({ min: 1 }).withMessage("durationInMonths must be a positive integer."),

  body("maxMembers")
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage("maxMembers must be a positive integer."),

  ...pricingRules(true),
  ...offerRules(),

  validate,
];

// ── Update Plan ────────────────────────────────────────────────────────────
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

  body("description")
    .optional()
    .isString().withMessage("Description must be a string.")
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters."),

  body("features")
    .optional()
    .isArray({ max: 20 }).withMessage("Features must be an array with at most 20 items."),
  body("features.*")
    .optional()
    .isString().withMessage("Each feature must be a string."),

  body("durationInMonths")
    .optional()
    .isInt({ min: 1 }).withMessage("durationInMonths must be a positive integer."),

  body("maxMembers")
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage("maxMembers must be a positive integer."),

  ...pricingRules(false),
  ...offerRules(),

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
