const { body, param, query } = require("express-validator");
const validate = require("./validate");

const VALID_SORT_OPTIONS = ["newest", "oldest", "highest", "lowest"];

const validateCreateReview = [
  param("id")
    .isMongoId().withMessage("Invalid gym ID."),

  body("rating")
    .notEmpty().withMessage("Rating is required.")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5."),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Title must not exceed 100 characters."),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Comment must not exceed 1000 characters."),

  validate,
];

const validateUpdateReview = [
  param("id")
    .isMongoId().withMessage("Invalid gym ID."),

  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5."),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Title must not exceed 100 characters."),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Comment must not exceed 1000 characters."),

  // Ensure at least one field is provided
  body().custom((value, { req }) => {
    const { rating, title, comment } = req.body;
    if (rating === undefined && title === undefined && comment === undefined) {
      throw new Error("At least one of rating, title, or comment is required.");
    }
    return true;
  }),

  validate,
];

const validateGetReviews = [
  param("id")
    .isMongoId().withMessage("Invalid gym ID."),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer."),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50."),

  query("sort")
    .optional()
    .isIn(VALID_SORT_OPTIONS)
    .withMessage(`Sort must be one of: ${VALID_SORT_OPTIONS.join(", ")}.`),

  validate,
];

const validateReviewGymId = [
  param("id")
    .isMongoId().withMessage("Invalid gym ID."),
  validate,
];

const validateReplyToReview = [
  param("id")
    .isMongoId().withMessage("Invalid gym ID."),

  param("reviewId")
    .isMongoId().withMessage("Invalid review ID."),

  body("text")
    .notEmpty().withMessage("Reply text is required.")
    .trim()
    .isLength({ max: 1000 }).withMessage("Reply must not exceed 1000 characters."),

  validate,
];

module.exports = {
  validateCreateReview,
  validateUpdateReview,
  validateGetReviews,
  validateReviewGymId,
  validateReplyToReview,
};
