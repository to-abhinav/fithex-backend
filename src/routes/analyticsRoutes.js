const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner } = require("../middleware/roleMiddleware");
const { getDashboard } = require("../controllers/analyticsController");

router.get("/dashboard", authMiddleware, isOwner, getDashboard);

module.exports = router;
