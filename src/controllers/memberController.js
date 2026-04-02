const Member = require("../models/Members");
const Plan = require("../models/PlanSchema");
const User = require("../models/User");
const Gym = require("../models/Gym");



// HELPOER FUCTION TO CALCULATE EXPIRY DATE BASED ON START DATE AND PLAN DURATION
const calculateExpiry = (startDate, durationInMonths) => {
  const expiry = new Date(startDate);
  expiry.setMonth(expiry.getMonth() + durationInMonths);
  return expiry;
};


const createMember = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    console.log("here is the error in createmember");
    
    const user = await User.findById(userId);
    console.log("user found in create member", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const existing = await Member.findOne({
      userId,
      gymId: plan.gymId,
      status: "active"
    });
    if (existing) {
      return res.status(400).json({ message: "User is already an active member of this gym" });
    }

    const startDate = new Date();
    const expiryDate = calculateExpiry(startDate, plan.durationInMonths);

    const member = await Member.create({
      userId,
      gymId: plan.gymId,
      subscriptionPlan: plan._id,
      subscriptionMonths: plan.durationInMonths,
      startDate,
      expiryDate,
      status: "active"
    });

    await Plan.findByIdAndUpdate(planId, { $inc: { currentEnrolled: 1 } });

    const populated = await member.populate([
      { path: "userId", select: "name email" },
      { path: "subscriptionPlan", select: "name price durationInMonths" }
    ]);

    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /members
// Owner only
const getAllMembers = async (req, res) => {
  try {
    const { status, search } = req.query;

    // get the owner's gym using their userId from JWT
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const filter = { gymId: gym._id };  // ✅ now this has an actual value

    if (status) {
      filter.status = status;
    }

    let members = await Member.find(filter)
      .populate("userId", "name email phone")
      .populate("subscriptionPlan", "name price durationInMonths")
      .sort({ createdAt: -1 });

    if (search) {
      members = members.filter(m =>
        m.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.userId?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      total: members.length,
      members
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Single Member ─────────────────────────────────────────
// GET /members/:id
// Owner or the member themselves
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate("userId", "name email")
      .populate("gymId", "name address")
      .populate("subscriptionPlan", "name price features durationInMonths");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // days remaining calculation
    const today = new Date();
    const daysRemaining = Math.ceil(
      (new Date(member.expiryDate) - today) / (1000 * 60 * 60 * 24)
    );

    res.status(200).json({
      ...member.toObject(),
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get My Membership (Member's own profile) ──────────────────
// GET /members/me
// Member only — uses JWT to find their own membership
const getMyMembership = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user })
      .populate("gymId", "name address contactNumber")
      .populate("subscriptionPlan", "name price features durationInMonths");

    if (!member) {
      return res.status(404).json({ message: "No active membership found" });
    }

    const today = new Date();
    const daysRemaining = Math.ceil(
      (new Date(member.expiryDate) - today) / (1000 * 60 * 60 * 24)
    );

    res.status(200).json({
      ...member.toObject(),
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      isExpired: daysRemaining <= 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Renew Membership ──────────────────────────────────────────
// PUT /members/:id/renew
// Owner only
const renewMembership = async (req, res) => {
  try {
    const { planId } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // if renewing early, extend from today
    // if already expired, start fresh from today
    const baseDate = new Date();
    const newExpiry = calculateExpiry(baseDate, plan.durationInMonths);

    member.subscriptionPlan = plan._id;
    member.subscriptionMonths = plan.durationInMonths;
    member.startDate = baseDate;
    member.expiryDate = newExpiry;
    member.status = "active";

    await member.save();

    res.status(200).json({
      message: "Membership renewed successfully",
      member
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Deactivate Member ─────────────────────────────────────────
// PUT /members/:id/deactivate
// Owner only
const deactivateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({
      message: "Member deactivated",
      member
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete Member ─────────────────────────────────────────────
// DELETE /members/:id
// Owner only
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ message: "Member deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// PUT /members/check-expiry
// Can be called by a cron job or manually
const checkAndExpireMembers = async (req, res) => {
  try {
    const today = new Date();

    const result = await Member.updateMany(
      {
        status: "active",
        expiryDate: { $lt: today }
      },
      {
        status: "inactive"
      }
    );

    res.status(200).json({
      message: `${result.modifiedCount} memberships marked as expired`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  getMyMembership,
  renewMembership,
  deactivateMember,
  deleteMember,
  checkAndExpireMembers
};