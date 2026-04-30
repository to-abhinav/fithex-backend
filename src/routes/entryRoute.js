const express = require("express");
const router = express.Router();
const {
  generateQrSecret,
  checkIn,
  checkOut,
  getMyStatus,
  getMyLogs,
  getGymLogs,
  getTodayAttendance,
  getLiveOccupancy,
  getMyGymLocation,
} = require("../controllers/entryLogController");
const authMiddleware = require("../middleware/authMiddleware");
const { isMember, isOwner } = require("../middleware/roleMiddleware");
const { validateCheckIn, validateCheckOut } = require("../validators/entryValidator");

// ── Owner: generate / regenerate QR secret ──
router.post("/generate-qr", authMiddleware, isOwner, generateQrSecret);

// ── Member: check-in / check-out ──
router.post("/checkin",     authMiddleware, isMember, validateCheckIn,  checkIn);
router.post("/checkout",    authMiddleware, isMember, validateCheckOut, checkOut);
router.get("/my-status",    authMiddleware, isMember, getMyStatus);
router.get("/my-logs",      authMiddleware, isMember, getMyLogs);
router.get("/my-gym-location", authMiddleware, isMember, getMyGymLocation);

// ── Owner: logs & attendance ──
router.get("/gym-logs",     authMiddleware, isOwner, getGymLogs);
router.get("/attendance",   authMiddleware, isOwner, getTodayAttendance);

// ── Public (auth only) ──
router.get("/live-count/:gymId", authMiddleware, getLiveOccupancy);

module.exports = router;

