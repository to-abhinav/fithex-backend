const express = require("express");
const router = express.Router();

const { sendOtp, registerUser, getProfile, updateProfile, savePushToken, changePassword, deleteAccount } = require("../controllers/userController");
const { updateProfileImage, updateBannerImage, getAvatars } = require("../controllers/imageController");
const { validateSendOtp, validateRegister, validateUpdateProfile } = require("../validators/userValidator");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadProfile, uploadBanner } = require("../config/cloudinary");


router.post("/send-otp", validateSendOtp, sendOtp);

router.post("/register", validateRegister, registerUser);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validateUpdateProfile, updateProfile);

router.patch("/profile-image", authMiddleware, uploadProfile.single("profileImage"), updateProfileImage);
router.patch("/banner-image", authMiddleware, uploadBanner.single("bannerImage"), updateBannerImage);
router.get("/avatars", getAvatars);

router.put("/push-token", authMiddleware, savePushToken);

router.put("/change-password", authMiddleware, changePassword);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;