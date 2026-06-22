const express    = require("express");
const router     = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin }   = require("../middleware/roleMiddleware");
const {
  getTransfers,
  getRouteStatus,
  retryTransfer,
} = require("../controllers/routeController");

// admin authorization required 

// get transfer logs  filtering
router.get("/transfers", authMiddleware, isAdmin, getTransfers);

// get live Razorpay status for a gym
router.get("/gym/:gymId/route-status", authMiddleware, isAdmin, getRouteStatus);

// retry a failed transfer
router.post("/gym/:gymId/retry-transfer", authMiddleware, isAdmin, retryTransfer);

module.exports = router;
