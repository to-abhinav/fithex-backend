const Streak = require("../models/Streak");
const Gym = require("../models/Gym");

const MAX_GRACE_DAYS_PER_WEEK = 1;

/**
 * Strips time from a Date and returns start-of-day (local midnight).
 */
const toDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};


//day name ("Monday",  …)
const getDayName = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

/**
 * Called after a successful check-in.
 * Increments the streak if it's a new calendar day, updates longestStreak.
 */
const recordActivity = async (userId, gymId) => {
  const today = toDateOnly(new Date());

  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = await Streak.create({
      userId,
      gymId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
      totalCheckInDays: 1,
    });
    return streak;
  }

  // if gym changed reset streak
  if (streak.gymId.toString() !== gymId.toString()) {
    if (streak.currentStreak > 0) {
      streak.streakHistory.push({
        startDate: _streakStartDate(streak),
        endDate: streak.lastActivityDate,
        length: streak.currentStreak,
        brokenBy: "manual_reset",
      });
    }
    streak.gymId = gymId;
    streak.currentStreak = 1;
    streak.lastActivityDate = today;
    streak.totalCheckInDays += 1;
    streak.graceDaysUsed = 0;
    streak.freezeUntil = null;
    streak.freezeReason = null;
    await streak.save();
    return streak;
  }

  const lastDate = streak.lastActivityDate
    ? toDateOnly(streak.lastActivityDate)
    : null;

  // Already checked in
  if (lastDate && lastDate.getTime() === today.getTime()) {
    return streak;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate && lastDate.getTime() === yesterday.getTime()) {
    // Consecutive day — extend streak
    streak.currentStreak += 1;
  } else {
    // Gap detected — but evaluateStreaks() handles breaking;
    // if user checks in after a gap that wasn't caught by cron yet, start fresh
    if (streak.currentStreak > 0 && lastDate && lastDate.getTime() < yesterday.getTime()) {
      streak.streakHistory.push({
        startDate: _streakStartDate(streak),
        endDate: streak.lastActivityDate,
        length: streak.currentStreak,
        brokenBy: "missed",
      });
    }
    streak.currentStreak = 1;
  }

  streak.lastActivityDate = today;
  streak.totalCheckInDays += 1;

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }


  if (streak.freezeUntil) {
    streak.freezeUntil = null;
    streak.freezeReason = null;
  }

  await streak.save();
  return streak;
};


const evaluateStreaks = async () => {
  const today = toDateOnly(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayName = getDayName(yesterday);

  
  if (getDayName(today) === "Monday") {
    await Streak.updateMany(
      { currentStreak: { $gt: 0 } },
      { $set: { graceDaysUsed: 0 } }
    );
    console.log("[StreakEvaluator] Grace days reset (Monday)");
  }

  
  const activeStreaks = await Streak.find({
    currentStreak: { $gt: 0 },
    lastActivityDate: { $lt: today },
  });

  let brokenCount = 0;
  let skippedFrozen = 0;
  let skippedClosed = 0;
  let gracedCount = 0;

  for (const streak of activeStreaks) {
   
    if (streak.freezeUntil && streak.freezeUntil >= today) {
      skippedFrozen++;
      continue;
    }

    
    if (streak.freezeUntil && streak.freezeUntil < today) {
      streak.freezeUntil = null;
      streak.freezeReason = null;
    }

    
    try {
      const gym = await Gym.findById(streak.gymId);
      if (gym && gym.timings && gym.timings.length > 0) {
        const dayTiming = gym.timings.find((t) => t.day === dayName);
        if (dayTiming && dayTiming.isClosed) {
          skippedClosed++;
          continue; // Gym was closed — no penalty
        }
      }
    } catch (err) {
      console.error(
        `[StreakEvaluator] Error fetching gym ${streak.gymId}:`,
        err.message
      );
    }

    if (streak.graceDaysUsed < MAX_GRACE_DAYS_PER_WEEK) {
      streak.graceDaysUsed += 1;
      gracedCount++;
      await streak.save();
      continue;
    }

    streak.streakHistory.push({
      startDate: _streakStartDate(streak),
      endDate: streak.lastActivityDate,
      length: streak.currentStreak,
      brokenBy: "missed",
    });

    streak.currentStreak = 0;
    streak.graceDaysUsed = 0;
    brokenCount++;
    await streak.save();
  }

  console.log(
    `[StreakEvaluator] Done — broken: ${brokenCount}, frozen-skip: ${skippedFrozen}, ` +
      `closed-skip: ${skippedClosed}, graced: ${gracedCount}`
  );

  return { brokenCount, skippedFrozen, skippedClosed, gracedCount };
};


const freezeStreak = async (userId, reason, days) => {
  const streak = await Streak.findOne({ userId });
  if (!streak) {
    return null;
  }

  const freezeUntil = new Date();
  freezeUntil.setDate(freezeUntil.getDate() + days);

  streak.freezeUntil = freezeUntil;
  streak.freezeReason = reason;
  await streak.save();
  return streak;
};


const unfreezeStreak = async (userId) => {
  const streak = await Streak.findOne({ userId });
  if (!streak) {
    return null;
  }

  streak.freezeUntil = null;
  streak.freezeReason = null;
  await streak.save();
  return streak;
};

const getStreakInfo = async (userId) => {
  const streak = await Streak.findOne({ userId });
  return streak;
};


const getGymLeaderboard = async (gymId, limit = 10) => {
  const leaderboard = await Streak.find({
    gymId,
    currentStreak: { $gt: 0 },
  })
    .sort({ currentStreak: -1 })
    .limit(limit)
    .populate("userId", "name email");

  return leaderboard;
};


const _streakStartDate = (streak) => {
  const start = new Date(streak.lastActivityDate);
  start.setDate(start.getDate() - (streak.currentStreak - 1));
  return start;
};

module.exports = {
  recordActivity,
  evaluateStreaks,
  freezeStreak,
  unfreezeStreak,
  getStreakInfo,
  getGymLeaderboard,
};
