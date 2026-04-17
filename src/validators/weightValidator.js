// src/validators/weightValidator.js
const { body, param } = require("express-validator");
const validate = require("./validate");

// POST /weight — logWeight
const validateLogWeight = [
  body("weight")
    .notEmpty().withMessage("weight is required.")
    .isFloat({ min: 20, max: 500 }).withMessage("weight must be between 20 and 500 kg."),

  body("goalWeight")
    .optional()
    .isFloat({ min: 20, max: 500 }).withMessage("goalWeight must be between 20 and 500 kg."),

  body("date")
    .optional()
    .isISO8601().withMessage("date must be a valid ISO 8601 date string."),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Note must not exceed 300 characters."),

  validate,
];

// PUT /weight/:id — updateWeightEntry
const validateUpdateWeight = [
  param("id").isMongoId().withMessage("Invalid weight entry ID."),

  body("weight")
    .optional()
    .isFloat({ min: 20, max: 500 }).withMessage("weight must be between 20 and 500 kg."),

  body("goalWeight")
    .optional()
    .isFloat({ min: 20, max: 500 }).withMessage("goalWeight must be between 20 and 500 kg."),

  body("date")
    .optional()
    .isISO8601().withMessage("date must be a valid ISO 8601 date string."),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Note must not exceed 300 characters."),

  validate,
];

// DELETE /weight/:id — deleteWeightEntry
const validateWeightId = [
  param("id").isMongoId().withMessage("Invalid weight entry ID."),
  validate,
];

module.exports = {
  validateLogWeight,
  validateUpdateWeight,
  validateWeightId,
};
