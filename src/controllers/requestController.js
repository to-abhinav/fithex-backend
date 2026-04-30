const Request = require("../models/MembershipRequest");
const Member = require("../models/Members");
const Plan = require("../models/PlanSchema");
const Gym = require("../models/Gym");

const calculateExpiry = (startDate, durationInMonths) => {
  const expiry = new Date(startDate);
  expiry.setMonth(expiry.getMonth() + durationInMonths);
  return expiry;
};

// POST /requests
// Member only
const applyToGym = async (req, res) => {
  try {
    const { gymId, planId, paymentMode, note } = req.body;
    const userId = req.user;

    // check gym exists and is active
    const gym = await Gym.findById(gymId);
    if (!gym || !gym.isActive) {
      return res.status(404).json({ message: "Gym not found or inactive" });
    }

    const plan = await Plan.findOne({ _id: planId, isActive: true });
    console.log(" plan in request --", plan);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found or inactive" });
    }
    if (plan.gymId.toString() !== gymId) {
      return res.status(400).json({ message: "Plan does not belong to this gym" });
    }

    // check user isn't already an active member of this gym
    const activeMember = await Member.findOne({
      userId,
      gymId,
      status: "active",
    });
    if (activeMember) {
      return res
        .status(400)
        .json({ message: "You are already an active member of this gym" });
    }

    // check user doesn't already have a pending request for this gym
    const pendingRequest = await Request.findOne({
      userId,
      gymId,
      status: "Pending",
    });
    if (pendingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending request for this gym" });
    }

    const request = await Request.create({
      userId,
      gymId,
      planId,
      paymentMode,
      note: note || "",
      status: "Pending",
    });

    const populated = await request.populate([
      { path: "gymId", select: "name address" },
      { path: "planId", select: "name price durationInMonths" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already have a pending request for this gym" });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /requests/mine
// Member only — user sees all their own requests
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user })
      .populate("gymId", "name address images.profile")
      .populate("planId", "name price durationInMonths")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /requests/gym
// Owner only — see all requests for their gym
const getGymRequests = async (req, res) => {
  try {
    const { status } = req.query;

    // get owner's gym
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found" });
    }

    const filter = { gymId: gym._id };

    // optional filter by status
    if (status) {
      filter.status = status;
    }

    const requests = await Request.find(filter)
      .populate("userId", "name email")
      .populate("planId", "name price durationInMonths")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /requests/:id/approve
// Owner only — auto creates Member on approval
const approveRequest = async (req, res) => {
  try {
    // get owner's gym
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found" });
    }

    // find request and make sure it belongs to this gym
    const request = await Request.findOne({
      _id: req.params.id,
      gymId: gym._id,
    });
    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found or unauthorized" });
    }

    // only pending requests can be approved
    if (request.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot approve a request that is already ${request.status}`,
      });
    }

    // get plan details for expiry calculation
    const plan = await Plan.findById(request.planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // check if member already exists (edge case)
    const existingMember = await Member.findOne({
      userId: request.userId,
      gymId: gym._id,
      status: "active",
    });
    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already an active member" });
    }

    // create member
    const startDate = new Date();
    const expiryDate = calculateExpiry(startDate, plan.durationInMonths);

    const member = await Member.create({
      userId: request.userId,
      gymId: gym._id,
      subscriptionPlan: plan._id,
      subscriptionMonths: plan.durationInMonths,
      startDate,
      expiryDate,
      status: "active",
    });

    // update request status
    request.status = "Approved";
    await request.save();

    // increment gym currentMembers
    await Gym.findByIdAndUpdate(gym._id, { $inc: { currentMembers: 1 } });

    // increment plan currentEnrolledMembers
    await Plan.findByIdAndUpdate(plan._id, {
      $inc: { currentEnrolledMembers: 1 },
    });

    const populatedMember = await member.populate([
      { path: "userId", select: "name email" },
      { path: "subscriptionPlan", select: "name price durationInMonths" },
    ]);

    res.status(200).json({
      message: "Request approved. Member created successfully.",
      member: populatedMember,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /requests/:id/reject
// Owner only
const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found" });
    }

    const request = await Request.findOne({
      _id: req.params.id,
      gymId: gym._id,
    });
    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found or unauthorized" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot reject a request that is already ${request.status}`,
      });
    }

    request.status = "Rejected";
    request.rejectionReason = rejectionReason || "";
    await request.save();

    res.status(200).json({
      message: "Request rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /requests/:id/cancel
// Member only — user cancels their own pending request
const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      userId: req.user,
    });
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot cancel a request that is already ${request.status}`,
      });
    }

    request.status = "Cancelled";
    await request.save();

    res.status(200).json({
      message: "Request cancelled",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyToGym,
  getMyRequests,
  getGymRequests,
  approveRequest,
  rejectRequest,
  cancelRequest,
};
