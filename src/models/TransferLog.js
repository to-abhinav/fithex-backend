const mongoose = require("mongoose");

//traansferLog
const transferLogSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
      index: true,
    },

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },

    // razorpay identifiers
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpayTransferId: {
      type: String,
      default: "",   
      index: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    platformFee: {
      type: Number,
      required: true,
    },

    gymAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
      index: true,
    },

    failureReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TransferLog", transferLogSchema);
