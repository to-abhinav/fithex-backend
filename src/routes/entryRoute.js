const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyStatus,
  getMyLogs,
  getGymLogs,
  getTodayAttendance,
  getLiveOccupancy,
} = require("../controllers/entryLogController");
const authMiddleware = require("../middleware/authMiddleware");
const { isMember, isOwner } = require("../middleware/roleMiddleware");
const { validateCheckIn, validateCheckOut } = require("../validators/entryValidator");

router.post("/checkin",     authMiddleware, isMember, validateCheckIn,  checkIn);
router.post("/checkout",    authMiddleware, isMember, validateCheckOut, checkOut);
router.get("/my-status",    authMiddleware, isMember, getMyStatus);
router.get("/my-logs",      authMiddleware, isMember, getMyLogs);

router.get("/gym-logs",     authMiddleware, isOwner, getGymLogs);
router.get("/attendance",   authMiddleware, isOwner, getTodayAttendance);

router.get("/live-count/:gymId", authMiddleware, getLiveOccupancy);

module.exports = router;
