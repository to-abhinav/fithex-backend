const Razorpay    = require("razorpay");
const Gym         = require("../models/Gym");
const TransferLog = require("../models/TransferLog");


const getPlatformRazorpay = () => {
  const keyId     = process.env.RAZORPAY_PLATFORM_KEY_ID;
  const keySecret = process.env.RAZORPAY_PLATFORM_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Platform Razorpay credentials are not configured in .env");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// create linked account 
const createLinkedAccount = async (req, res) => {
  try {
    const { gst } = req.body;

    // fetch the gym owned by this user
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found. Create your gym first." });
    }

    if (gym.razorpayLinkedAccountId) {
      return res.status(200).json({
        message:         "Linked account already exists",
        linkedAccountId: gym.razorpayLinkedAccountId,
        onboardingStep:  gym.onboardingStep,
        isRouteEnabled:  gym.isRouteEnabled,
      });
    }

    const razorpay = getPlatformRazorpay();

   
    const accountPayload = {
      email:               gym.email || `gym+${gym._id}@fithex.app`,
      profile: {
        category:    "healthcare",
        subcategory: "fitness",
        addresses: {
          registered: {
            street1:     gym.address.street,
            city:        gym.address.city,
            state:       gym.address.state,
            postal_code: gym.address.pincode,
            country:     "IN",
          },
        },
      },
      legal_business_name: gym.name,
      business_type:       "individual",
      contact_name:        gym.name,
      //gst optional
      ...(gst ? { legal_info: { gst } } : {}),
    };

    let account;
    try {
      account = await razorpay.accounts.create(accountPayload);
    } catch (rzpErr) {
      const desc = rzpErr?.error?.description || rzpErr?.message || "Razorpay account creation failed";
      if (rzpErr?.error?.code === "BAD_REQUEST_ERROR" && desc.includes("already")) {
        return res.status(409).json({ message: desc, code: "DUPLICATE_ACCOUNT" });
      }
      return res.status(400).json({ message: desc, code: "RAZORPAY_ERROR" });
    }

    gym.razorpayLinkedAccountId = account.id;
    if (gst) gym.gst = gst;
    gym.onboardingStep = 1;
    // isRouteEnabled stays false until account.activated webhook fires
    await gym.save();

    res.status(201).json({
      message:         "Linked account created. Proceed to Step 2: Stakeholder KYC.",
      linkedAccountId: account.id,
      onboardingStep:  1,
      isRouteEnabled:  false,
    });
  } catch (error) {
    console.error("[createLinkedAccount] error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const createStakeholder = async (req, res) => {
  try {
    const { pan, ownerName } = req.body;

    if (!pan) {
      return res.status(400).json({ message: "PAN number is required" });
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return res.status(400).json({ message: "Invalid PAN format. Example: ABCDE1234F" });
    }
    if (!ownerName || !ownerName.trim()) {
      return res.status(400).json({ message: "Owner name is required" });
    }

    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    if (!gym.razorpayLinkedAccountId) {
      return res.status(400).json({
        message: "Complete Step 1 (Create Linked Account) first",
        code: "STEP_ORDER_VIOLATION",
      });
    }

    if (gym.razorpayStakeholderId) {
      return res.status(200).json({
        message:        "Stakeholder already created",
        stakeholderId:  gym.razorpayStakeholderId,
        onboardingStep: gym.onboardingStep,
      });
    }

    const razorpay = getPlatformRazorpay();

    let stakeholder;
    try {
      stakeholder = await razorpay.stakeholders.create(
        gym.razorpayLinkedAccountId,
        {
          name: ownerName.trim(),
          kyc:  { pan },
        }
      );
    } catch (rzpErr) {
      const desc = rzpErr?.error?.description || rzpErr?.message || "Stakeholder creation failed";
      return res.status(400).json({ message: desc, code: "RAZORPAY_ERROR" });
    }

    gym.razorpayStakeholderId = stakeholder.id;
    gym.pan            = pan;
    gym.onboardingStep = 2;
    await gym.save();

    res.status(201).json({
      message:        "Stakeholder created. Proceed to Step 3: Activate Route.",
      stakeholderId:  stakeholder.id,
      onboardingStep: 2,
    });
  } catch (error) {
    console.error("[createStakeholder] error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /gyms/request-product-config
// Owner only — Step 1.1.3: requests the Route product configuration.
const requestProductConfig = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    if (gym.onboardingStep < 2) {
      return res.status(400).json({
        message: "Complete Step 2 (Stakeholder KYC) first",
        code: "STEP_ORDER_VIOLATION",
      });
    }

    if (gym.onboardingStep >= 3) {
      return res.status(200).json({
        message:        "Product configuration already requested",
        onboardingStep: gym.onboardingStep,
      });
    }

    const razorpay = getPlatformRazorpay();

    let productConfig;
    try {
      productConfig = await razorpay.accounts.requestProductConfiguration(
        gym.razorpayLinkedAccountId,
        { product_name: "route" }
      );
    } catch (rzpErr) {
      const desc = rzpErr?.error?.description || rzpErr?.message || "Product config request failed";
      return res.status(400).json({ message: desc, code: "RAZORPAY_ERROR" });
    }

    if (productConfig?.id) gym.razorpayProductConfigId = productConfig.id;
    gym.onboardingStep = 3;
    await gym.save();

    res.status(200).json({
      message:          "Route product configuration requested. Proceed to Step 4: Add Bank Account.",
      productConfigId:  productConfig?.id || null,
      activationStatus: productConfig?.activation_status || null,
      onboardingStep:   3,
    });
  } catch (error) {
    console.error("[requestProductConfig] error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProductConfig = async (req, res) => {
  try {
    const { ifsc_code, account_number, beneficiary_name } = req.body;

    if (!ifsc_code || !account_number || !beneficiary_name) {
      return res.status(400).json({
        message: "ifsc_code, account_number and beneficiary_name are all required",
      });
    }

    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    if (gym.onboardingStep < 3) {
      return res.status(400).json({
        message: "Complete Step 3 (Activate Route) first",
        code: "STEP_ORDER_VIOLATION",
      });
    }

    const razorpay = getPlatformRazorpay();

    let updatedConfig;
    try {
      updatedConfig = await razorpay.accounts.updateProductConfiguration(
        gym.razorpayLinkedAccountId,
        {
          settlements: {
            bank_account: { ifsc_code, account_number, beneficiary_name },
          },
          tos_accepted: true,
        }
      );
    } catch (rzpErr) {
      const desc = rzpErr?.error?.description || rzpErr?.message || "Product config update failed";
      // surface needs_clarification requirements to the caller
      if (rzpErr?.error?.code === "BAD_REQUEST_ERROR") {
        return res.status(400).json({
          message: desc,
          code: "NEEDS_CLARIFICATION",
          requirements: rzpErr?.error?.details || [],
        });
      }
      return res.status(400).json({ message: desc, code: "RAZORPAY_ERROR" });
    }

    gym.onboardingStep = 4;
    await gym.save();

    // isRouteEnabled to true when Razorpay account.activated webhook
    res.status(200).json({
      message:          "Bank account submitted. Awaiting Razorpay activation (account.activated webhook).",
      activationStatus: updatedConfig?.activation_status || null,
      onboardingStep:   4,
    });
  } catch (error) {
    console.error("[updateProductConfig] error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getTransfers = async (req, res) => {
  try {
    const { gymId, status, from, to } = req.query;

    const filter = {};

    if (gymId)  filter.gymId  = gymId;
    if (status) filter.status = status;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    const logs = await TransferLog.find(filter)
      .populate("gymId",    "name email address")
      .populate("memberId", "name email")
      .populate("planId",   "name price")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ total: logs.length, transfers: logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getRouteStatus = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId).lean();
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    if (!gym.razorpayLinkedAccountId) {
      return res.json({
        gymId:          gym._id,
        gymName:        gym.name,
        isRouteEnabled: false,
        linkedAccountId: null,
        razorpayStatus:  null,
      });
    }

    //  live status from Razorpay
    let razorpayAccount = null;
    try {
      const razorpay = getPlatformRazorpay();
      razorpayAccount = await razorpay.accounts.fetch(gym.razorpayLinkedAccountId);
    } catch (rzpErr) {
      console.error("[getRouteStatus] Razorpay fetch error:", rzpErr.message);
    }

    res.json({
      gymId:           gym._id,
      gymName:         gym.name,
      isRouteEnabled:  gym.isRouteEnabled,
      needsAttention:  gym.needsAttention,
      linkedAccountId: gym.razorpayLinkedAccountId,
      platformFeePercent: gym.platformFeePercent,
      razorpayStatus:  razorpayAccount?.profile?.status || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const retryTransfer = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { transferLogId } = req.body;

    if (!transferLogId) {
      return res.status(400).json({ message: "transferLogId is required" });
    }

    const log = await TransferLog.findOne({ _id: transferLogId, gymId, status: "failed" });
    if (!log) {
      return res.status(404).json({ message: "Failed TransferLog not found for this gym" });
    }

    const gym = await Gym.findById(gymId);
    if (!gym || !gym.razorpayLinkedAccountId) {
      return res.status(400).json({ message: "Gym has no linked Razorpay account" });
    }

    const razorpay = getPlatformRazorpay();

   
    let newTransfer;
    try {
      newTransfer = await razorpay.payments.transfer(log.razorpayPaymentId || log.razorpayOrderId, {
        transfers: [
          {
            account:  gym.razorpayLinkedAccountId,
            amount:   log.gymAmount,
            currency: "INR",
            notes:    { retried: true, originalTransferLogId: log._id.toString() },
            on_hold:  0,
          },
        ],
      });
    } catch (rzpErr) {
      const desc = rzpErr?.error?.description || rzpErr?.message || "Retry failed";
      return res.status(400).json({ message: desc, code: "RAZORPAY_RETRY_ERROR" });
    }

    log.razorpayTransferId = newTransfer?.items?.[0]?.id || log.razorpayTransferId;
    log.status             = "pending";   // will flip to 'processed' via webhook
    log.failureReason      = "";
    await log.save();

    await Gym.findByIdAndUpdate(gymId, { needsAttention: false });

    res.json({
      message:        "Retry initiated. Status will update via webhook.",
      transferLogId:  log._id,
      newTransferId:  log.razorpayTransferId,
    });
  } catch (error) {
    console.error("[retryTransfer] error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createLinkedAccount,
  createStakeholder,
  requestProductConfig,
  updateProductConfig,
  getTransfers,
  getRouteStatus,
  retryTransfer,
};
