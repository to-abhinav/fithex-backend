const mongoose = require("mongoose");
const RequestSchema = new mongoose.Schema(
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
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    note: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

RequestSchema.index(
  { userId: 1, gymId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "Pending" } }
);
module.exports = mongoose.model("Request", RequestSchema);
