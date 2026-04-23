const mongoose = require("mongoose");

const gymClosureSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    type: {
      type: String,
      enum: ["holiday", "maintenance", "event", "other"],
      default: "holiday",
    },
  },
  { timestamps: true }
);

gymClosureSchema.index({ gymId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("GymClosure", gymClosureSchema);
