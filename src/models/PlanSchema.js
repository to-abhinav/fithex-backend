const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
      index: true,
    },
    name: {
      type: String,
      enum: ["Monthly", "Quarterly", "Half-Yearly", "Yearly", "Custom"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Strength", "Cardio", "Yoga"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    features: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 20,
        message: "Max 20 features allowed",
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    
    originalPrice: {
      type: Number,
      min: 0,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    taxPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 18,
    },

    offerLabel: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    offerExpiresAt: {
      type: Date,
      default: null,
    },

    maxMembers: {
      type: Number,
      min: 1,
      default: null,
    },
    currentEnrolledMembers: {
      type: Number,
      default: 0,
      min: 0,
    },

    durationInMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

planSchema.index({ gymId: 1, isActive: 1 });
planSchema.index({ offerExpiresAt: 1 }, { sparse: true }); // fast expiry queries


planSchema.virtual("effectivePrice").get(function () {
  if (this.discountPercent && this.originalPrice) {
    return +(this.originalPrice * (1 - this.discountPercent / 100)).toFixed(2);
  }
  return this.price;
});


planSchema.virtual("priceWithTax").get(function () {
  const base = this.effectivePrice;
  return +(base * (1 + this.taxPercent / 100)).toFixed(2);
});

planSchema.virtual("isOfferActive").get(function () {
  if (!this.offerLabel) return false;
  if (!this.offerExpiresAt) return true;
  return this.offerExpiresAt > new Date();
});


planSchema.virtual("isFull").get(function () {
  if (this.maxMembers == null) return false;
  return this.currentEnrolledMembers >= this.maxMembers;
});

module.exports = mongoose.model("Plan", planSchema);



