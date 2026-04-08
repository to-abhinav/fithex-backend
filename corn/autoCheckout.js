const cron = require("node-cron");
const GymSession = require("../models/GymSession");

const AUTO_CHECKOUT_HOURS = 2;

const runAutoCheckout = async () => {
  const cutoff = new Date(
    Date.now() - AUTO_CHECKOUT_HOURS * 60 * 60 * 1000
  );

  const result = await GymSession.updateMany(
    {
      checkOutTime: null,
      checkInTime: { $lt: cutoff },
    },
    [
      {
        $set: {
          checkOutTime: new Date(),
          autoCheckedOut: true,
          durationMinutes: {
            $round: [
              {
                $divide: [
                  { $subtract: [new Date(), "$checkInTime"] },
                  60000,
                ],
              },
              0,
            ],
          },
        },
      },
    ]
  );

  if (result.modifiedCount > 0) {
    console.log(`[AutoCheckout] Closed ${result.modifiedCount} stale session(s)`);
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

module.exports = { startAutoCheckoutCron };