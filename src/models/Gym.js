const mongoose = require("mongoose");

const timingSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },

    openTime: {
      type: String, // "06:00"
      required: true,
    },

    closeTime: {
      type: String, // "22:00"
      required: true,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const gymSchema = new mongoose.Schema(
  {
    //  Owner
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    contactNumber: {
      type: String,
      required: true,
    },

    whatsappNumber: {
      type: String,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    website: {
      type: String,
    },

    address: {
      street: { type: String, required: true },

      city: { type: String, required: true },

      state: { type: String, required: true },

      pincode: {
        type: String,
        required: true,
        match: /^[1-9][0-9]{5}$/, // Indian pincode validation
      },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    images: {
      profile: {
        type: String,
        default: "",
      },
      cover: {
        type: String,
        default: "",
      },

      gallery: {
        type: [String],
        default: [],
        validate: {
          validator: (v) => v.length <= 15,
          message: "Max 15 images allowed",
        },
      },
    },

    amenities: {
      type: [String],

      enum: [
        "AC",
        "Parking",
        "Locker",
        "Shower",
        "Steam",
        "Sauna",
        "Cardio",
        "Crossfit",
        "Yoga",
        "Zumba",
        "Personal Trainer",
        "WiFi",
        "Protein Bar",
        "Cafe",
      ],

      default: [],
    },

    timings: {
      type: [timingSchema],
      default: [],
    },

    maxCapacity: {
      type: Number,
      default: 100,
    },

    currentMembers: {
      type: Number,
      default: 0,
    },

    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },

      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// geo search
gymSchema.index({ location: "2dsphere" });

// search optimisation
gymSchema.index({
  name: "text",
  "address.city": "text",
});

module.exports = mongoose.model("Gym", gymSchema);
