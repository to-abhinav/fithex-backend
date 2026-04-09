const cron = require("node-cron");
const GymSession = require("../src/models/GymSession");

const AUTO_CHECKOUT_SECONDS = process.env.AUTO_CHECKOUT_SECONDS || 2 * 60 * 60;

const runAutoCheckout = async () => {
  const cutoff = new Date(
    Date.now() - AUTO_CHECKOUT_SECONDS * 1000
  );

  const sessions = await GymSession.find({
    checkOutTime: null,
    checkInTime: { $lt: cutoff },
  });

  let modifiedCount = 0;
  for (const session of sessions) {
    session.checkOutTime = new Date();
    session.autoCheckedOut = true;
    session.durationMinutes = Math.floor((session.checkOutTime - session.checkInTime) / 60000);
    await session.save();
    modifiedCount++;
  }

  if (modifiedCount > 0) {
    console.log(`[AutoCheckout] Closed ${modifiedCount} stale session(s)`);
  }
};

// Runs every 60 minutes
const startAutoCheckoutCron = () => {
  cron.schedule("*/60 * * * *", async () => {
    try {
      await runAutoCheckout();
    } catch (err) {
      console.error("[AutoCheckout] Error:", err.message);
    }
  });

  console.log("[AutoCheckout] Cron job started (every 30 min)");
};

module.exports = { startAutoCheckoutCron, runAutoCheckout };