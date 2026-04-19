const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "owner"],
      default: "member",
    },

    // ── Fitness Profile ──────────────────────────────────────────────────
    age: {
      type: Number,
      min: 10,
      max: 100,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    heightCm: {
      type: Number,          // e.g. 175 cm  (used by WeightLog for BMI)
      min: 50,
      max: 250,
      default: null,
    },
    weight: {
      type: Number,          // current weight in kg (starting weight)
      min: 20,
      max: 500,
      default: null,
    },
    goalWeight: {
      type: Number,          // target weight in kg
      min: 20,
      max: 500,
      default: null,
    },
    fitnessGoal: {
      type: String,
      enum: [
        "lose_weight",
        "gain_muscle",
        "maintain_fitness",
        "improve_endurance",
        "increase_flexibility",
        null,
      ],
      default: null,
    },
    activityLevel: {
      type: String,
      enum: [
        "sedentary",        
        "lightly_active",   
        "moderately_active",
        "very_active",      
        "extra_active",     
        null,
      ],
      default: null,
    },

    profileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
