/**
 * Notification type constants for the MVP notification system.
 */

const NOTIFICATION_TYPES = Object.freeze({
  MEMBERSHIP_EXPIRING_3D: "membership_expiring_3d",
  MEMBERSHIP_EXPIRING_1D: "membership_expiring_1d",
  MEMBERSHIP_EXPIRED: "membership_expired",
  MEMBERSHIP_ACTIVATED: "membership_activated",

  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
  CHECKIN_CONFIRMED: "checkin_confirmed",
  CHECKOUT_CONFIRMED: "checkout_confirmed",
  SESSION_DURATION_ALERT: "session_duration_alert",
  FORGOT_CHECKOUT: "forgot_checkout",
  

  STREAK_STARTED: "streak_started",
  STREAK_MILESTONE_3: "streak_milestone_3",
  STREAK_MILESTONE_7: "streak_milestone_7",
  STREAK_BROKEN: "streak_broken",

  SMART_VISIT_NUDGE: "smart_visit_nudge",

  ANNOUNCEMENT: "announcement",

});

const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPES);

module.exports = { NOTIFICATION_TYPES, NOTIFICATION_TYPE_VALUES };
