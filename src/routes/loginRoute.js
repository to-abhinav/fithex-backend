const express = require("express");

const {loginUser} = require("../controllers/loginController");

const authMiddleware =require("../middleware/authMiddleware")
const router = express.Router();


router.post("/login", loginUser);

router.get("/profile", authMiddleware, (req, res) => {

  res.json({
    message: "Access granted",
    userId: req.user
  });

});

module.exports = router;
