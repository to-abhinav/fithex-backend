const cron = require("node-cron");
const GymSession = require("../src/models/GymSession");
const notificationService = require("../src/services/notificationService");
const { NOTIFICATION_TYPES } = require("../src/constants/notificationTypes");

const DURATION_ALERT_MS = 2.5 * 60 * 60 * 1000; // 2.5 hours in ms


const runSessionSweeper = async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const cutoff = new Date(now.getTime() - DURATION_ALERT_MS);

  const longSessions = await GymSession.find({
    checkOutTime: null,
    checkInTime: { $lte: cutoff },
  });

  let durationAlerts = 0;
  for (const session of longSessions) {
    const durationMin = Math.round((now - new Date(session.checkInTime)) / 60000);
    await notificationService.send(
      session.userId,
      NOTIFICATION_TYPES.SESSION_DURATION_ALERT,
      "Long Session Alert ⏰",
      `You've been checked in for ${durationMin} minutes. Don't forget to check out!`,
      { sessionId: session._id, durationMinutes: durationMin },
      `duration_${session._id}`
    );
    durationAlerts++;
  }

  let forgotCount = 0;
  if (currentHour === 23) {
    const allOpen = await GymSession.find({ checkOutTime: null });

    for (const session of allOpen) {
      const checkOutTime = new Date();
      const durationMinutes = Math.round(
        (checkOutTime - new Date(session.checkInTime)) / 60000
      );

      session.checkOutTime = checkOutTime;
      session.autoCheckedOut = true;
      session.durationMinutes = durationMinutes;
      await session.save();

      await notificationService.send(
        session.userId,
        NOTIFICATION_TYPES.FORGOT_CHECKOUT,
        "Forgot to Check Out? 🤔",
        `We auto-closed your session after ${durationMinutes} minutes. Remember to check out next time!`,
        { sessionId: session._id, durationMinutes },
        `forgot_${session._id}`
      );
      forgotCount++;
    }
  }

  if (durationAlerts > 0 || forgotCount > 0) {
    console.log(
      `[SessionSweeper] Duration alerts: ${durationAlerts}, forgot checkout: ${forgotCount}`
    );
  }
};

const startSessionSweeperCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      await runSessionSweeper();
    } catch (err) {
      console.error("[SessionSweeper] Error:", err.message);
    }
  });

  console.log("[SessionSweeper] Cron job started (every hour)");
};

module.exports = { startSessionSweeperCron, runSessionSweeper };
