const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/userController");
const { validateRegister } = require("../validators/userValidator");

router.post("/register", validateRegister, registerUser);

module.exports = router;