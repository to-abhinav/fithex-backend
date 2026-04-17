const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const { generateOtp, sendOtpEmail } = require("../services/otpService");


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
    const { name, email, password, role, otp } = req.body;

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
      role,
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error.message);
    res.status(500).json({ message: "Cannot register user." });
  }
};

module.exports = {
  sendOtp,
  registerUser,
};