const { body } = require("express-validator");
const validate = require("./validate");

const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
    .matches(/\d/).withMessage("Password must contain at least one number."),

  body("role")
    .optional()
    .isIn(["member", "owner"]).withMessage("Role must be either 'member' or 'owner'."),

  validate,
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),

  validate,
];

module.exports = { validateRegister, validateLogin };
