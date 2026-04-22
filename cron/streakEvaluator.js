const cron = require("node-cron");
const { evaluateStreaks } = require("../src/services/streakService");

// Runs daily at 1:00 AM IST
const startStreakEvaluatorCron = () => {
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log("[StreakEvaluator] Running daily streak evaluation...");
      const result = await evaluateStreaks();
      console.log("[StreakEvaluator] Result:", result);
    } catch (err) {
      console.error("[StreakEvaluator] Error:", err.message);
    }
  });

  console.log("[StreakEvaluator] Cron job started (daily at 1:00 AM)");
};

module.exports = { startStreakEvaluatorCron, evaluateStreaks };
