const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gymId:           { type: mongoose.Schema.Types.ObjectId, ref: "Gym",  required: true },
    planId:          { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    memberId:        { type: mongoose.Schema.Types.ObjectId, ref: "Member", default: null },

    razorpayOrderId:   { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    amount:   { type: Number, required: true },
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

paymentSchema.index({ gymId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);