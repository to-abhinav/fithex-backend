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
    phone:{
      type: Number,
      required: true,
      trim: true,
    },
    profileImage: { type: String, default: null },
    profileImagePublicId: { type: String, default: null },

    bannerImage: { type: String, default: null },
    bannerImagePublicId: { type: String, default: null },
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
      type: Number, 
      max: 250,
      default: null,
    },
    weight: {
      type: Number, 
      min: 20,
      max: 500,
      default: null,
    },
    goalWeight: {
      type: Number, 
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
    numberOfWorkoutDay: {
      type: Number,
      min: 0,
      max: 7,
      default: null,
    },

    preferredVisitTime: {
      type: Number,
      min: 0,
      max: 23,
      default: null,
    },

    profileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
