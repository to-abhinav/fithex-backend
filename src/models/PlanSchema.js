const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
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
  },
  durationInMonths:{
    type: Number,
    required: true,
    min: 1
  },
  currentEnrolledMembers:{
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
    }

},{ timestamps: true   });

module.exports = mongoose.model("Plan", planSchema);


