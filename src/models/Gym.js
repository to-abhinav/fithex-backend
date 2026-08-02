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
        default: [0, 0],
      },
    },

    images: {
      profile: {
        type: String,
        default: "",
      },
      profilePublicId: {
        type: String,
        default: null,
      },
      cover: {
        type: String,
        default: "",
      },
      coverPublicId: {
        type: String,
        default: null,
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
        "WiFi",
        "Parking",
        "Locker Room",
        "Shower",
        "AC",
        "Changing Room",
        "Cafeteria",
        "Steam Room",
        "Swimming Pool",
        "Sauna",
        "Cardio Zone",
        "Free Weights",
        "Personal Training",
        "Group Classes",
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

    socialLinks: {
      instagram: { type: String, default: "" },
      facebook:  { type: String, default: "" },
      youtube:   { type: String, default: "" },
    },

    equipment: {
      type: [String],
      default: [],
    },

    genderPolicy: {
      type: String,
      enum: ["Unisex", "Male Only", "Female Only"],
      default: "Unisex",
    },

    minimumAge: {
      type: Number,
      default: 16,
    },

    qrSecret: {
      type: String,
      default: "",   
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    razorpayKeyId: {
      type: String,
      default: "",  
    },

    razorpayKeySecret: {
      type: String,
      default: "",    
    },

    // Razorpay Route 
    razorpayLinkedAccountId: {
      type: String,
      default: "",   
    },

    pan: {
      type: String,
      default: "",
    },

    gst: {
      type: String,
      default: "",   // optional
    },

    platformFeePercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    isRouteEnabled: {
      type: Boolean,
      default: false,
    },

    razorpayStakeholderId: {
      type: String,
      default: "",
    },

    razorpayProductConfigId: {
      type: String,
      default: "",
    },

        onboardingStep: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },

    needsAttention: {
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
