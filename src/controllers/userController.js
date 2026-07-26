const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOtp, sendOtpEmail } = require("../services/otpService");

const Notification = require("../models/Notification");
const MembershipRequest = require("../models/MembershipRequest");
const Members = require("../models/Members");
const WeightLog = require("../models/WeightLog");
const Streak = require("../models/Streak");
const GymSession = require("../models/GymSession");
const Review = require("../models/Review");
const Payment = require("../models/Payment");
const Gym = require("../models/Gym");
const Plan = require("../models/PlanSchema");
const Announcement = require("../models/Announcement");
const GymClosure = require("../models/GymClosure");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("[SEND-OTP] Request received for email:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[SEND-OTP] Email already registered:", email);
      return res.status(400).json({ message: "Email is already registered." });
    }

    const otp = generateOtp();
    console.log("[SEND-OTP] Generated OTP for:", email);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    console.log("[SEND-OTP] OTP saved to DB for:", email);

    console.log("[SEND-OTP] Calling sendOtpEmail...");
    await sendOtpEmail(email, otp);
    console.log("[SEND-OTP] ✅ OTP email sent successfully to:", email);

    res.status(200).json({ message: "OTP sent successfully. Check your email." });
  } catch (error) {
    console.error("[SEND-OTP] ❌ FULL ERROR:");
    console.error("[SEND-OTP] Name:", error.name);
    console.error("[SEND-OTP] Message:", error.message);
    console.error("[SEND-OTP] Code:", error.code);
    console.error("[SEND-OTP] Stack:", error.stack);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    await Otp.deleteMany({ email });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error.message);
    res.status(500).json({ message: "Cannot register user." });
  }
};


/** GET /users/profile  (protected) */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (error) {
    console.error("getProfile error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};


const updateProfile = async (req, res) => {
  try {
    const ALLOWED_FIELDS = [
      "name",
      "age",
      "gender",
      "heightCm",
      "weight",
      "goalWeight",
      "fitnessGoal",
      "numberOfWorkoutDay",
      "preferredVisitTime",
    ];

    // Build update object from only allowed fields
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided." });
    }

   
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found." });

    Object.assign(user, updates);

   
    const REQUIRED_PROFILE_FIELDS = [
      "age", "gender", "heightCm", "weight", "fitnessGoal", "numberOfWorkoutDay",
    ];
    const allFilled = REQUIRED_PROFILE_FIELDS.every(
      (f) => user[f] !== null && user[f] !== undefined
    );
    if (allFilled) user.profileComplete = true;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        gender: user.gender,
        heightCm: user.heightCm,
        weight: user.weight,
        goalWeight: user.goalWeight,
        fitnessGoal: user.fitnessGoal,
        numberOfWorkoutDay: user.numberOfWorkoutDay,
        preferredVisitTime: user.preferredVisitTime,
        profileImage: user.profileImage,
        bannerImage: user.bannerImage,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    console.error("updateProfile error:", error.message);
    res.status(500).json({ message: "Failed to update profile." });
  }
};


/** PUT /users/push-token  (protected) */
const savePushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;
    if (!expoPushToken) {
      return res.status(400).json({ message: "expoPushToken is required" });
    }
    await User.findByIdAndUpdate(req.user, { expoPushToken });
    res.status(200).json({ message: "Push token saved" });
  } catch (error) {
    console.error("savePushToken error:", error.message);
    res.status(500).json({ message: "Failed to save push token." });
  }
};


/** PUT /users/change-password  (protected) */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ message: "New password must contain at least one number." });
    }

    // Fetch user WITH password field
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("changePassword error:", error.message);
    res.status(500).json({ message: "Failed to change password." });
  }
};


/** DELETE /users/account  (protected) */
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete your account." });
    }

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Verify password before deletion
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // ── Cascade-delete all user-related data ──────────────────────────────
    await Promise.all([
      Notification.deleteMany({ userId: req.user }),
      MembershipRequest.deleteMany({ userId: req.user }),
      Members.deleteMany({ userId: req.user }),
      WeightLog.deleteMany({ userId: req.user }),
      Streak.deleteMany({ userId: req.user }),
      GymSession.deleteMany({ userId: req.user }),
      Review.deleteMany({ userId: req.user }),
      Payment.deleteMany({ userId: req.user }),
    ]);

    // ── If owner, also delete gym and related gym data ─────────────────────
    if (user.role === "owner") {
      const gym = await Gym.findOne({ ownerId: req.user });
      if (gym) {
        await Promise.all([
          Plan.deleteMany({ gymId: gym._id }),
          Announcement.deleteMany({ gymId: gym._id }),
          GymClosure.deleteMany({ gymId: gym._id }),
          // Also clean up membership requests and sessions tied to this gym
          MembershipRequest.deleteMany({ gymId: gym._id }),
          GymSession.deleteMany({ gymId: gym._id }),
          Members.deleteMany({ gymId: gym._id }),
        ]);
        await Gym.findByIdAndDelete(gym._id);
      }
    }

    // ── Finally delete the user ────────────────────────────────────────────
    await User.findByIdAndDelete(req.user);

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("deleteAccount error:", error.message);
    res.status(500).json({ message: "Failed to delete account." });
  }
};


module.exports = {
  sendOtp,
  registerUser,
  getProfile,
  updateProfile,
  savePushToken,
  changePassword,
  deleteAccount,
};