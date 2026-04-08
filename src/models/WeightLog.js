const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 20,
      max: 500,
    },
    goalWeight: {
      type: Number,
      min: 20,
      max: 500,
      default: null,
    },
    bmi: {
      type: Number,
      default: null, 
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);


weightLogSchema.pre("save", async function (next) {
  if (this.isModified("weight")) {
    const User = mongoose.model("User");
    const user = await User.findById(this.userId).select("heightCm");
    if (user && user.heightCm) {
      const heightM = user.heightCm / 100;
      this.bmi = parseFloat((this.weight / (heightM * heightM)).toFixed(1));
    }
  }
  next();
});

weightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("WeightLog", weightLogSchema);