const express = require("express");
const router = express.Router();
const {
  getMyStreak,
  getStreakHistory,
  freezeMyStreak,
  unfreezeMyStreak,
  getGymLeaderboard,
} = require("../controllers/streakController");
const authMiddleware = require("../middleware/authMiddleware");
const { isMember, isOwner } = require("../middleware/roleMiddleware");
const { validateFreeze, validateLeaderboard } = require("../validators/streakValidator");

// Member routes
router.get("/me",           authMiddleware, isMember, getMyStreak);
router.get("/me/history",   authMiddleware, isMember, getStreakHistory);
router.post("/me/freeze",   authMiddleware, isMember, validateFreeze, freezeMyStreak);
router.post("/me/unfreeze", authMiddleware, isMember, unfreezeMyStreak);

// Owner routes
router.get("/gym/leaderboard", authMiddleware, isOwner, validateLeaderboard, getGymLeaderboard);

module.exports = router;
