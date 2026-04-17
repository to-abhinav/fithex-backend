const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner, isMember } = require("../middleware/roleMiddleware");
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getMyPayments,
  getGymPayments,
} = require("../controllers/paymentController");
const {
  validateCreateOrder,
  validateVerifyPayment,
} = require("../validators/paymentValidator");

router.post("/webhook", handleWebhook);

router.post("/create-order", authMiddleware, isMember, validateCreateOrder,   createOrder);
router.post("/verify",       authMiddleware, isMember, validateVerifyPayment, verifyPayment);
router.get("/mine",          authMiddleware, isMember,                        getMyPayments);

// Owner route
router.get("/gym",           authMiddleware, isOwner,                         getGymPayments);

module.exports = router;