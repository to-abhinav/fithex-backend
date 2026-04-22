const { body, query } = require("express-validator");
const validate = require("./validate");


const validateFreeze = [
  body("reason")
    .notEmpty()
    .withMessage("Freeze reason is required.")
    .isIn(["user_request", "holiday"])
    .withMessage("Reason must be 'user_request' or 'holiday'."),

  body("days")
    .notEmpty()
    .withMessage("Number of freeze days is required.")
    .isInt({ min: 1, max: 30 })
    .withMessage("Freeze days must be between 1 and 30."),

  validate,
];


const validateLeaderboard = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),

  validate,
];

module.exports = {
  validateFreeze,
  validateLeaderboard,
};
