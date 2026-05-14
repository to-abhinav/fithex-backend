const { body, query, param } = require("express-validator");
const validate = require("./validate");

const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const VALID_AMENITIES = [
  "WiFi", "Parking", "Locker Room", "Shower", "AC",
  "Changing Room", "Cafeteria", "Steam Room", "Swimming Pool",
  "Sauna", "Cardio Zone", "Free Weights", "Personal Training",
  "Group Classes",
];
const VALID_GENDER_POLICY = ["Unisex", "Male Only", "Female Only"];
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;



const timingsValidator = body("timings")
  .optional()
  .isArray().withMessage("timings must be an array.")
  .custom((arr) => {
    for (const t of arr) {
      if (!VALID_DAYS.includes(t.day))
        throw new Error(`Invalid day: ${t.day}. Must be a full weekday name.`);
      if (!TIME_REGEX.test(t.openTime))
        throw new Error(`openTime for ${t.day} must be in HH:MM format.`);
      if (!TIME_REGEX.test(t.closeTime))
        throw new Error(`closeTime for ${t.day} must be in HH:MM format.`);
      if (typeof t.isClosed !== "undefined" && typeof t.isClosed !== "boolean")
        throw new Error(`isClosed for ${t.day} must be a boolean.`);
    }
    return true;
  });


const validateCreateGym = [
  body("name")
    .trim()
    .notEmpty().withMessage("Gym name is required.")
    .isLength({ max: 100 }).withMessage("Gym name must not exceed 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description must not exceed 1000 characters."),

  body("contactNumber")
    .trim()
    .notEmpty().withMessage("Contact number is required.")
    .matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid 10-digit Indian mobile number."),

  body("whatsappNumber")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage("WhatsApp number must be a valid 10-digit Indian mobile number."),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Gym email must be a valid email address.")
    .normalizeEmail(),

  body("website")
    .optional()
    .trim()
    .isURL().withMessage("Website must be a valid URL."),

  body("address.street")
    .trim()
    .notEmpty().withMessage("Street address is required."),

  body("address.city")
    .trim()
    .notEmpty().withMessage("City is required."),

  body("address.state")
    .trim()
    .notEmpty().withMessage("State is required."),

  body("address.pincode")
    .trim()
    .notEmpty().withMessage("Pincode is required.")
    .matches(/^[1-9][0-9]{5}$/).withMessage("Pincode must be a valid 6-digit Indian pincode."),

  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 }).withMessage("location.coordinates must be [longitude, latitude].")
    .custom(([lng, lat]) => {
      if (typeof lng !== "number" || lng < -180 || lng > 180)
        throw new Error("Longitude must be a number between -180 and 180.");
      if (typeof lat !== "number" || lat < -90 || lat > 90)
        throw new Error("Latitude must be a number between -90 and 90.");
      return true;
    }),

  body("amenities")
    .optional()
    .isArray().withMessage("Amenities must be an array.")
    .custom((arr) => {
      const invalid = arr.filter((a) => !VALID_AMENITIES.includes(a));
      if (invalid.length) throw new Error(`Invalid amenities: ${invalid.join(", ")}.`);
      return true;
    }),

  body("maxCapacity")
    .optional()
    .isInt({ min: 1 }).withMessage("maxCapacity must be a positive integer."),

  body("socialLinks.instagram")
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage("Instagram link must be a valid URL."),

  body("socialLinks.facebook")
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage("Facebook link must be a valid URL."),

  body("socialLinks.youtube")
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage("YouTube link must be a valid URL."),

  body("equipment")
    .optional()
    .isArray().withMessage("equipment must be an array of strings."),

  body("genderPolicy")
    .optional()
    .isIn(VALID_GENDER_POLICY)
    .withMessage(`genderPolicy must be one of: ${VALID_GENDER_POLICY.join(", ")}.`),

  body("minimumAge")
    .optional()
    .isInt({ min: 10, max: 100 }).withMessage("minimumAge must be an integer between 10 and 100."),

  timingsValidator,
  validate,
];


const validateUpdateGym = [
  param("id")
    .isMongoId().withMessage("Invalid gym ID."),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("Gym name must be between 1 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description must not exceed 1000 characters."),

  body("contactNumber")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid 10-digit Indian mobile number."),

  body("whatsappNumber")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage("WhatsApp number must be a valid 10-digit Indian mobile number."),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Gym email must be a valid email address.")
    .normalizeEmail(),

  body("website")
    .optional()
    .trim()
    .isURL().withMessage("Website must be a valid URL."),

  body("address.street").optional().trim().notEmpty().withMessage("Street cannot be empty."),
  body("address.city").optional().trim().notEmpty().withMessage("City cannot be empty."),
  body("address.state").optional().trim().notEmpty().withMessage("State cannot be empty."),
  body("address.pincode")
    .optional()
    .trim()
    .matches(/^[1-9][0-9]{5}$/).withMessage("Pincode must be a valid 6-digit Indian pincode."),

  body("amenities")
    .optional()
    .isArray().withMessage("Amenities must be an array.")
    .custom((arr) => {
      const invalid = arr.filter((a) => !VALID_AMENITIES.includes(a));
      if (invalid.length) throw new Error(`Invalid amenities: ${invalid.join(", ")}.`);
      return true;
    }),

  body("maxCapacity")
    .optional()
    .isInt({ min: 1 }).withMessage("maxCapacity must be a positive integer."),

  body("socialLinks.instagram")
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage("Instagram link must be a valid URL."),

  body("socialLinks.facebook")
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage("Facebook link must be a valid URL."),

  body("socialLinks.youtube")
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage("YouTube link must be a valid URL."),

  body("equipment")
    .optional()
    .isArray().withMessage("equipment must be an array of strings."),

  body("genderPolicy")
    .optional()
    .isIn(VALID_GENDER_POLICY)
    .withMessage(`genderPolicy must be one of: ${VALID_GENDER_POLICY.join(", ")}.`),

  body("minimumAge")
    .optional()
    .isInt({ min: 10, max: 100 }).withMessage("minimumAge must be an integer between 10 and 100."),

  timingsValidator,
  validate,
];


const validateUpdateGymImages = [
  param("id").isMongoId().withMessage("Invalid gym ID."),

  body("images.profile")
    .optional()
    .trim()
    .isURL().withMessage("Profile image must be a valid URL."),

  body("images.cover")
    .optional()
    .trim()
    .isURL().withMessage("Cover image must be a valid URL."),

  body("images.gallery")
    .optional()
    .isArray({ max: 15 }).withMessage("Gallery can have at most 15 images.")
    .custom((arr) => {
      const urlRegex = /^https?:\/\/.+/;
      const invalid = arr.filter((u) => !urlRegex.test(u));
      if (invalid.length) throw new Error("All gallery entries must be valid URLs.");
      return true;
    }),

  validate,
];


const validateUpdateTimings = [
  param("id").isMongoId().withMessage("Invalid gym ID."),

  body("timings")
    .isArray({ min: 1 }).withMessage("timings must be a non-empty array.")
    .custom((arr) => {
      for (const t of arr) {
        if (!VALID_DAYS.includes(t.day))
          throw new Error(`Invalid day: ${t.day}.`);
        if (!TIME_REGEX.test(t.openTime))
          throw new Error(`openTime for ${t.day} must be HH:MM.`);
        if (!TIME_REGEX.test(t.closeTime))
          throw new Error(`closeTime for ${t.day} must be HH:MM.`);
      }
      return true;
    }),

  validate,
];

const validateNearbyGyms = [
  query("latitude")
    .notEmpty().withMessage("latitude is required.")
    .isFloat({ min: -90, max: 90 }).withMessage("latitude must be a valid latitude (-90 to 90)."),

  query("longitude")
    .notEmpty().withMessage("longitude is required.")
    .isFloat({ min: -180, max: 180 }).withMessage("longitude must be a valid longitude (-180 to 180)."),

  query("radius")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("radius must be between 1 and 100 km."),

  validate,
];

const validateSearchGyms = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Search query must be between 2 and 100 characters."),

  query("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("City must be between 2 and 100 characters."),

  validate,
];

const validateGymId = [
  param("id").isMongoId().withMessage("Invalid gym ID."),
  validate,
];

module.exports = {
  validateCreateGym,
  validateUpdateGym,
  validateUpdateGymImages,
  validateUpdateTimings,
  validateNearbyGyms,
  validateSearchGyms,
  validateGymId,
};
