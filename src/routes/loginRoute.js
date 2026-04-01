const express = require("express");
const User = require("../models/User");

const {loginUser} = require("../controllers/loginController");

const authMiddleware =require("../middleware/authMiddleware")
const router = express.Router();


router.post("/login", loginUser);

router.get("/profile", authMiddleware, async (req, res) => {
   try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }

});

module.exports = router;
