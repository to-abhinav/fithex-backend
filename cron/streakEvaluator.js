const cron = require("node-cron");
const { evaluateStreaks } = require("../src/services/streakService");
const Streak = require("../src/models/Streak");
const notificationService = require("../src/services/notificationService");
const { NOTIFICATION_TYPES } = require("../src/constants/notificationTypes");


const runStreakEvaluation = async () => {
  // Snapshot active streak user IDs before evaluation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeBeforeEval = await Streak.find({
    currentStreak: { $gt: 0 },
    lastActivityDate: { $lt: today },
  }).select("userId currentStreak").lean();

  const beforeMap = {};
  for (const s of activeBeforeEval) {
    beforeMap[s.userId.toString()] = s.currentStreak;
  }

  const result = await evaluateStreaks();

  if (result.brokenCount > 0) {
    const brokenStreaks = await Streak.find({
      currentStreak: 0,
      userId: { $in: Object.keys(beforeMap).map((id) => id) },
    }).select("userId").lean();

    for (const s of brokenStreaks) {
      const uid = s.userId.toString();
      if (beforeMap[uid] && beforeMap[uid] > 0) {
        const dateStr = today.toISOString().slice(0, 10);
        await notificationService.send(
          s.userId,
          NOTIFICATION_TYPES.STREAK_BROKEN,
          "Streak Broken 💔",
          `Your ${beforeMap[uid]}-day streak has ended. Check in today to start a new one!`,
          { previousStreak: beforeMap[uid] },
          `streak_broken_${uid}_${dateStr}`
        );
      }
    }
  }

  return result;
};

const startStreakEvaluatorCron = () => {
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log("[StreakEvaluator] Running daily streak evaluation...");
      const result = await runStreakEvaluation();
      console.log("[StreakEvaluator] Result:", result);
    } catch (err) {
      console.error("[StreakEvaluator] Error:", err.message);
    }
  });

  console.log("[StreakEvaluator] Cron job started (daily at 1:00 AM)");
};

module.exports = { startStreakEvaluatorCron, evaluateStreaks };
