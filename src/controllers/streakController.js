const {
  getStreakInfo,
  getGymLeaderboard,
  freezeStreak,
  unfreezeStreak,
} = require("../services/streakService");
const Gym = require("../models/Gym");


const getMyStreak = async (req, res) => {
  try {
    const streak = await getStreakInfo(req.user);

    if (!streak) {
      return res.status(200).json({
        message: "No streak data yet. Check in to start your streak!",
        currentStreak: 0,
        longestStreak: 0,
        totalCheckInDays: 0,
      });
    }

    res.status(200).json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
      totalCheckInDays: streak.totalCheckInDays,
      graceDaysUsed: streak.graceDaysUsed,
      isFrozen: !!(streak.freezeUntil && streak.freezeUntil >= new Date()),
      freezeUntil: streak.freezeUntil,
      freezeReason: streak.freezeReason,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getStreakHistory = async (req, res) => {
  try {
    const streak = await getStreakInfo(req.user);

    if (!streak || streak.streakHistory.length === 0) {
      return res.status(200).json({
        message: "No streak history yet.",
        history: [],
      });
    }

    res.status(200).json({
      history: streak.streakHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const freezeMyStreak = async (req, res) => {
  try {
    const { reason, days } = req.body;

    const streak = await freezeStreak(req.user, reason, days);

    if (!streak) {
      return res.status(404).json({
        message: "No streak found. Check in to start your streak first.",
      });
    }

    res.status(200).json({
      message: `Streak frozen until ${streak.freezeUntil.toDateString()}`,
      freezeUntil: streak.freezeUntil,
      freezeReason: streak.freezeReason,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const unfreezeMyStreak = async (req, res) => {
  try {
    const streak = await unfreezeStreak(req.user);

    if (!streak) {
      return res.status(404).json({
        message: "No streak found.",
      });
    }

    res.status(200).json({
      message: "Streak unfrozen. You're back on track!",
      currentStreak: streak.currentStreak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getGymLeaderboardHandler = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found." });
    }

    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await getGymLeaderboard(gym._id, limit);

    res.status(200).json({
      gymName: gym.name,
      leaderboard: leaderboard.map((entry) => ({
        user: entry.userId,
        currentStreak: entry.currentStreak,
        longestStreak: entry.longestStreak,
        totalCheckInDays: entry.totalCheckInDays,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyStreak,
  getStreakHistory,
  freezeMyStreak,
  unfreezeMyStreak,
  getGymLeaderboard: getGymLeaderboardHandler,
};
