const mongoose = require("mongoose");
const { NOTIFICATION_TYPE_VALUES } = require("../constants/notificationTypes");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    
    refId: {
      type: String,
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast user feed query (newest first)
notificationSchema.index({ userId: 1, createdAt: -1 });

// Prevent duplicate notifications for the same event
notificationSchema.index(
  { refId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
