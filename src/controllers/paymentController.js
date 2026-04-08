const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Payment  = require("../models/Payment");
const Plan     = require("../models/PlanSchema");
const Member   = require("../models/Member");
const MembershipRequest = require("../models/MembershipRequest");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const calculateExpiry = (startDate, durationInMonths) => {
  const expiry = new Date(startDate);
  expiry.setMonth(expiry.getMonth() + durationInMonths);
  return expiry;
};

// Create an order when a member is ready to pay
// This happens right before we show them the payment modal
const createOrder = async (req, res) => {
  try {
    const { planId, gymId } = req.body;

    if (!planId || !gymId) {
      return res.status(400).json({ message: "planId and gymId are required" });
    }

    // Make sure the plan they're trying to buy actually exists and is active
    const plan = await Plan.findOne({ _id: planId, gymId, isActive: true });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found or inactive" });
    }

    // Stop them if they're already a paying member here
    const existing = await Member.findOne({
      userId: req.user,
      gymId,
      status: "active",
    });
    if (existing) {
      return res.status(400).json({ message: "You already have an active membership at this gym" });
    }

    // Request Razorpay to create an order (the amount is in paise, not rupees)
    const order = await razorpay.orders.create({
      amount:   plan.price * 100,
      currency: "INR",
      receipt:  `fithex_${req.user}_${Date.now()}`,
      notes: {
        userId: req.user.toString(),
        gymId:  gymId.toString(),
        planId: planId.toString(),
      },
    });

    // Keep track of this payment in our database right away
    const payment = await Payment.create({
      userId:          req.user,
      gymId,
      planId,
      razorpayOrderId: order.id,
      amount:          plan.price * 100,
      status:          "created",
    });

    res.status(201).json({
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      paymentId: payment._id,
      // Share the public key with the frontend, but keep the secret safe on the server
      keyId:     process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// Verify the payment when Razorpay confirms it went through
// We'll check the signature, save the payment details, and set up their membership
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // First, verify this payment actually came from Razorpay
    // They sign the order and payment IDs together using a secret key we share
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Log this as a failed payment so we have a record of it
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Look up the payment we created earlier
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status === "paid") {
      return res.status(400).json({ message: "Payment already processed" });
    }

    // Get the plan details so we know how long the membership should last
    const plan = await Plan.findById(payment.planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan no longer exists" });
    }

    // Set up their membership with a start date and expiration date
    const startDate  = new Date();
    const expiryDate = calculateExpiry(startDate, plan.durationInMonths);

    const member = await Member.create({
      userId:             req.user,
      gymId:              payment.gymId,
      subscriptionPlan:   payment.planId,
      subscriptionMonths: plan.durationInMonths,
      startDate,
      expiryDate,
      status: "active",
    });

    // Update the payment record to mark it as completed
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status            = "paid";
    payment.memberId          = member._id;
    await payment.save();

    // Create a membership request record so the gym owner has a complete history
    // This keeps everything consistent and auditable
    await MembershipRequest.create({
      userId:      req.user,
      gymId:       payment.gymId,
      planId:      payment.planId,
      paymentMode: "Online",
      status:      "Approved",
      note:        "Auto-approved via Razorpay payment",
    });

    // Bump up the enrollment count for this plan
    await Plan.findByIdAndUpdate(payment.planId, {
      $inc: { currentEnrolledMembers: 1 },
    });

    res.json({
      message:    "Payment verified. Membership activated.",
      memberId:   member._id,
      expiryDate: member.expiryDate,
    });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// Listen for payment updates directly from Razorpay
// This is our backup in case a member closes the app and never calls /verify
const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    // Double-check this webhook actually came from Razorpay
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSig !== webhookSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;

    if (event.event === "payment.captured") {
      const { order_id, id: payment_id } = event.payload.payment.entity;

      const payment = await Payment.findOne({ razorpayOrderId: order_id });

      // Only process this if we haven't already finalized it through the earlier verification
      if (payment && payment.status !== "paid") {
        const plan = await Plan.findById(payment.planId);
        if (plan) {
          const startDate  = new Date();
          const expiryDate = calculateExpiry(startDate, plan.durationInMonths);

          const member = await Member.create({
            userId:             payment.userId,
            gymId:              payment.gymId,
            subscriptionPlan:   payment.planId,
            subscriptionMonths: plan.durationInMonths,
            startDate,
            expiryDate,
            status: "active",
          });

          payment.razorpayPaymentId = payment_id;
          payment.status            = "paid";
          payment.memberId          = member._id;
          await payment.save();

          await Plan.findByIdAndUpdate(payment.planId, {
            $inc: { currentEnrolledMembers: 1 },
          });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: "Webhook error", error: error.message });
  }
};

// Get all the payments a member has made
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user })
      .populate("gymId", "name")
      .populate("planId", "name price")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Show a gym owner all the payments that came in for their gym
const getGymPayments = async (req, res) => {
  try {
    const Gym = require("../models/Gym");
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    const payments = await Payment.find({ gymId: gym._id })
      .populate("userId", "name email")
      .populate("planId", "name price")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getMyPayments,
  getGymPayments,
};