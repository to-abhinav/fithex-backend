const cron = require("node-cron");
const Member = require("../src/models/Members");
const notificationService = require("../src/services/notificationService");
const { NOTIFICATION_TYPES } = require("../src/constants/notificationTypes");


const runMembershipNotifier = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  //  3day warning
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);
  const in3DaysEnd = new Date(in3Days);
  in3DaysEnd.setHours(23, 59, 59, 999);

  const expiring3d = await Member.find({
    status: "active",
    expiryDate: { $gte: in3Days, $lte: in3DaysEnd },
  });

  for (const m of expiring3d) {
    await notificationService.send(
      m.userId,
      NOTIFICATION_TYPES.MEMBERSHIP_EXPIRING_3D,
      "Membership Expiring Soon ⏳",
      "Your gym membership expires in 3 days. Renew now to keep your streak alive!",
      { memberId: m._id, expiryDate: m.expiryDate },
      `membership_exp3d_${m._id}`
    );
  }

  // 1day 
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const expiring1d = await Member.find({
    status: "active",
    expiryDate: { $gte: tomorrow, $lte: tomorrowEnd },
  });

  for (const m of expiring1d) {
    await notificationService.send(
      m.userId,
      NOTIFICATION_TYPES.MEMBERSHIP_EXPIRING_1D,
      "Membership Expires Tomorrow! ⚠️",
      "Your gym membership expires tomorrow. Renew to avoid losing access.",
      { memberId: m._id, expiryDate: m.expiryDate },
      `membership_exp1d_${m._id}`
    );
  }

  //
  const yesterdayEnd = new Date(today);
  yesterdayEnd.setMilliseconds(-1); // end of yesterday

  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const expiredMembers = await Member.find({
    status: "active",
    expiryDate: { $gte: yesterdayStart, $lte: yesterdayEnd },
  });

  for (const m of expiredMembers) {
    m.status = "inactive";
    await m.save();

    await notificationService.send(
      m.userId,
      NOTIFICATION_TYPES.MEMBERSHIP_EXPIRED,
      "Membership Expired 🚫",
      "Your gym membership has expired. Renew your plan to continue working out.",
      { memberId: m._id, expiryDate: m.expiryDate },
      `membership_expired_${m._id}`
    );
  }

  const total = expiring3d.length + expiring1d.length + expiredMembers.length;
  if (total > 0) {
    console.log(
      `[MembershipNotifier] 3d: ${expiring3d.length}, 1d: ${expiring1d.length}, expired: ${expiredMembers.length}`
    );
  }
};

// Runs every day at midnight
const startMembershipNotifierCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await runMembershipNotifier();
    } catch (err) {
      console.error("[MembershipNotifier] Error:", err.message);
    }
  });

  console.log("[MembershipNotifier] Cron job started (daily at 00:00)");
};

module.exports = { startMembershipNotifierCron, runMembershipNotifier };
