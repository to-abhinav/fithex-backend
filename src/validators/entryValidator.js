const { body } = require("express-validator");
const validate = require("./validate");


const validateCheckIn = [
  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Note must not exceed 300 characters."),

  validate,
];


const validateCheckOut = [
  validate,
];

module.exports = {
  validateCheckIn,
  validateCheckOut,
};
