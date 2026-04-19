const express = require("express");
const router = express.Router();

const { sendOtp, registerUser, getProfile, updateProfile } = require("../controllers/userController");
const { validateSendOtp, validateRegister } = require("../validators/userValidator");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/send-otp", validateSendOtp, sendOtp);

router.post("/register", validateRegister, registerUser);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;