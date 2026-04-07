const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyStatus,
  getMyLogs,
  getGymLogs,
  getTodayAttendance,
} = require("../controllers/entryLogController");
const authMiddleware = require("../middleware/authMiddleware");
const { isMember, isOwner } = require("../middleware/roleMiddleware");

router.post("/checkin",     authMiddleware, isMember, checkIn);
router.post("/checkout",    authMiddleware, isMember, checkOut);
router.get("/my-status",    authMiddleware, isMember, getMyStatus);
router.get("/my-logs",      authMiddleware, isMember, getMyLogs);

router.get("/gym-logs",authMiddleware, isOwner, getGymLogs);
router.get("/attendance",   authMiddleware, isOwner, getTodayAttendance);

module.exports = router;