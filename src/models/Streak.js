const mongoose = require("mongoose");

const streakHistorySchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    length: {
      type: Number,
      required: true,
    },

    brokenBy: {
      type: String,
      enum: ["missed", "membership_expired", "manual_reset"],
      required: true,
    },
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },

    // Core streak counters
    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastActivityDate: {
      type: Date,
      default: null,
    },

    //  / protection
    graceDaysUsed: {
      type: Number,
      default: 0,
    },

    freezeUntil: {
      type: Date,
      default: null,
    },

    freezeReason: {
      type: String,
      enum: ["gym_closed", "user_request", "holiday", null],
      default: null,
    },

    
    streakHistory: {
      type: [streakHistorySchema],
      default: [],
    },

    
    totalCheckInDays: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Fast lookup by user
streakSchema.index({ userId: 1 }, { unique: true });

// Leaderboard 
streakSchema.index({ currentStreak: -1 });

// Leaderboard 
streakSchema.index({ gymId: 1, currentStreak: -1 });

module.exports = mongoose.model("Streak", streakSchema);
