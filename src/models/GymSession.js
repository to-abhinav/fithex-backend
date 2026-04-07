const mongoose = require("mongoose");

const gymSessionSchema = new mongoose.Schema(
  {
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

    checkInTime: {
      type: Date,
      default: Date.now,
      required: true,
    },

    checkOutTime: {
      type: Date,
      default: null, 
    },

    durationMinutes: {
      type: Number,
      default: null, 
    },

    autoCheckedOut: {
      type: Boolean,
      default: false, 
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

gymSessionSchema.index({ userId: 1, gymId: 1, checkInTime: -1 });

gymSessionSchema.index({ gymId: 1, checkInTime: -1 });

gymSessionSchema.index({ checkOutTime: 1 });

module.exports = mongoose.model("GymSession", gymSessionSchema);