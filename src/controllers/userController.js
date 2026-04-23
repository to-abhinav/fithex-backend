const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOtp, sendOtpEmail } = require("../services/otpService");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const otp = generateOtp();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully. Check your email." });
  } catch (error) {
    console.error("sendOtp error:", error.message);
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


module.exports = {
  sendOtp,
  registerUser,
  getProfile,
  updateProfile,
};