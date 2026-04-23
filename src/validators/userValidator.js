const { body } = require("express-validator");
const validate = require("./validate");


const validateSendOtp = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  validate,
];


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

  body("phone")
    .notEmpty().withMessage("Phone number is required.")
    .isNumeric().withMessage("Phone must be a valid number.")
    .isLength({min :10, max :10}).withMessage("Phone number must be of 10 digits."),

  body("role")
    .optional()
    .isIn(["member", "owner"]).withMessage("Role must be either 'member' or 'owner'."),

  body("otp")
    .trim()
    .notEmpty().withMessage("OTP is required.")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits.")
    .isNumeric().withMessage("OTP must contain only digits."),

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


const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters."),

  body("age")
    .optional()
    .isInt({ min: 10, max: 100 }).withMessage("Age must be between 10 and 100."),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"]).withMessage("Gender must be 'male', 'female', or 'other'."),

  body("heightCm")
    .optional()
    .isFloat({ max: 250 }).withMessage("Height cannot exceed 250 cm."),

  body("weight")
    .optional()
    .isFloat({ min: 20, max: 500 }).withMessage("Weight must be between 20 and 500 kg."),

  body("goalWeight")
    .optional()
    .isFloat({ min: 20, max: 500 }).withMessage("Goal weight must be between 20 and 500 kg."),

  body("fitnessGoal")
    .optional()
    .isIn(["lose_weight", "gain_muscle", "maintain_fitness", "improve_endurance", "increase_flexibility"])
    .withMessage("Invalid fitness goal."),

  body("numberOfWorkoutDay")
    .optional()
    .isInt({ min: 0, max: 7 }).withMessage("Workout days must be between 0 and 7."),

  body("preferredVisitTime")
    .optional()
    .isInt({ min: 0, max: 23 }).withMessage("Preferred visit time must be between 0 and 23 (24h format)."),

  validate,
];


module.exports = { validateSendOtp, validateRegister, validateLogin, validateUpdateProfile };
