const mongoose = require("mongoose");

const entryLogSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gym",
    required: true,
  },

  type: {
    type: String,
    enum: ["CheckIn", "CheckOut"],
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  note: {
    type: String,
    default: ""
  }

}, { timestamps: true });

entryLogSchema.index({ userId: 1, gymId: 1 });
entryLogSchema.index({ gymId: 1, timestamp: -1 });

module.exports = mongoose.model("EntryLog", entryLogSchema);