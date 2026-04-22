const express = require("express");
const router = express.Router();

const { sendOtp, registerUser, getProfile, updateProfile } = require("../controllers/userController");
const { updateProfileImage, updateBannerImage, getAvatars } = require("../controllers/imageController");
const { validateSendOtp, validateRegister } = require("../validators/userValidator");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadProfile, uploadBanner } = require("../config/cloudinary");


router.post("/send-otp", validateSendOtp, sendOtp);

router.post("/register", validateRegister, registerUser);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.patch("/profile-image", authMiddleware, uploadProfile.single("profileImage"), updateProfileImage);
router.patch("/banner-image", authMiddleware, uploadBanner.single("bannerImage"), updateBannerImage);
router.get("/avatars", getAvatars);

module.exports = router;