const { body } = require("express-validator");
const validate = require("./validate");


const validateCheckIn = [
  body("qrPayload")
    .trim()
    .notEmpty().withMessage("QR payload is required. Please scan the gym QR code."),

  body("latitude")
    .notEmpty().withMessage("Latitude is required.")
    .isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90."),

  body("longitude")
    .notEmpty().withMessage("Longitude is required.")
    .isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180."),

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
