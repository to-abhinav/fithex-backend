
const REQUIRED = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RAZORPAY_PLATFORM_KEY_ID",
  "RAZORPAY_PLATFORM_KEY_SECRET",
  "RAZORPAY_ENCRYPTION_KEY",
  "RAZORPAY_WEBHOOK_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
];

const OPTIONAL = [
  "PORT",               
  "JWT_EXPIRES_IN",     
  "EMAIL_SERVICE",    
  "ALLOWED_ORIGINS",   
  "NODE_ENV",
];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("  FATAL: Missing required environment variables:");
    missing.forEach((key) => console.error(`    ✗  ${key}`));
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit(1);
  }

  const unset = OPTIONAL.filter((key) => !process.env[key]);
  if (unset.length > 0) {
    console.warn("[env] Optional vars not set (using defaults):", unset.join(", "));
  }
}

module.exports = validateEnv;
