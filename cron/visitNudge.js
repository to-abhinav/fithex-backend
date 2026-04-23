const cron = require("node-cron");
const GymSession = require("../src/models/GymSession");
const User = require("../src/models/User");
const Member = require("../src/models/Members");
const notificationService = require("../src/services/notificationService");
const { NOTIFICATION_TYPES } = require("../src/constants/notificationTypes");


const runWeeklyAggregator = async () => {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  // Aggregate check-in hours per user
  const results = await GymSession.aggregate([
    { $match: { checkInTime: { $gte: fourWeeksAgo } } },
    {
      $group: {
        _id: {
          userId: "$userId",
          hour: { $hour: "$checkInTime" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.userId": 1, count: -1 } },
  ]);

  // Group by user and pick the hour with the highest count
  const userHourMap = {};
  for (const r of results) {
    const uid = r._id.userId.toString();
    if (!userHourMap[uid]) {
      userHourMap[uid] = { hour: r._id.hour, count: r.count };
    }
    // Since sorted by count desc, first entry per user is the most frequent
  }

  let updatedCount = 0;
  for (const [userId, { hour }] of Object.entries(userHourMap)) {
    await User.findByIdAndUpdate(userId, { preferredVisitTime: hour });
    updatedCount++;
  }

  console.log(`[VisitNudge] Aggregated preferred visit times for ${updatedCount} users`);
};


const runHourlyNudge = async () => {
  const now = new Date();
  const targetHour = (now.getHours() + 1) % 24;

  const users = await User.find({ preferredVisitTime: targetHour }).lean();
  if (users.length === 0) return;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const dateStr = todayStart.toISOString().slice(0, 10); // "2026-04-22"

  let nudgeCount = 0;
  for (const user of users) {
    const member = await Member.findOne({ userId: user._id, status: "active" });
    if (!member) continue;

    const sessionToday = await GymSession.findOne({
      userId: user._id,
      checkInTime: { $gte: todayStart, $lte: todayEnd },
    });

    if (!sessionToday) {
      await notificationService.send(
        user._id,
        NOTIFICATION_TYPES.SMART_VISIT_NUDGE,
        "Time to Hit the Gym! 💪",
        "Your usual workout time is coming up. Don't break the habit!",
        { preferredHour: targetHour },
        `nudge_${user._id}_${dateStr}`
      );
      nudgeCount++;
    }
  }

  if (nudgeCount > 0) {
    console.log(`[VisitNudge] Sent ${nudgeCount} nudge(s) for hour ${targetHour}`);
  }
};


const startVisitNudgeCron = () => {
  cron.schedule("0 2 * * 0", async () => {
    try {
      await runWeeklyAggregator();
    } catch (err) {
      console.error("[VisitNudge] Aggregator error:", err.message);
    }
  });

  // Hourly nudge check
  cron.schedule("0 * * * *", async () => {
    try {
      await runHourlyNudge();
    } catch (err) {
      console.error("[VisitNudge] Nudge error:", err.message);
    }
  });

  console.log("[VisitNudge] Cron jobs started (weekly aggregator + hourly nudge)");
};

module.exports = { startVisitNudgeCron, runWeeklyAggregator, runHourlyNudge };
