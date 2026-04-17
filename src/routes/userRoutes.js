const express = require("express");
const router = express.Router();

const { sendOtp, registerUser } = require("../controllers/userController");
const { validateSendOtp, validateRegister } = require("../validators/userValidator");


router.post("/send-otp", validateSendOtp, sendOtp);

router.post("/register", validateRegister, registerUser);

module.exports = router;