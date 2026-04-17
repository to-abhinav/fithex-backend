const { body, param } = require("express-validator");
const validate = require("./validate");

const validateCreateOrder = [
  body("planId")
    .notEmpty().withMessage("planId is required.")
    .isMongoId().withMessage("planId must be a valid MongoDB ObjectId."),

  body("gymId")
    .notEmpty().withMessage("gymId is required.")
    .isMongoId().withMessage("gymId must be a valid MongoDB ObjectId."),

  validate,
];

const validateVerifyPayment = [
  body("razorpay_order_id")
    .notEmpty().withMessage("razorpay_order_id is required.")
    .isString().withMessage("razorpay_order_id must be a string."),

  body("razorpay_payment_id")
    .notEmpty().withMessage("razorpay_payment_id is required.")
    .isString().withMessage("razorpay_payment_id must be a string."),

  body("razorpay_signature")
    .notEmpty().withMessage("razorpay_signature is required.")
    .isString().withMessage("razorpay_signature must be a string."),

  validate,
];

module.exports = {
  validateCreateOrder,
  validateVerifyPayment,
};
