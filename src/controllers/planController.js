const Plan = require("../models/PlanSchema");
const Gym = require("../models/Gym");

// ─── Create Plan ───────────────────────────────────────────────
// POST /plans
// Owner only
const createPlan = async (req, res) => {
  try {
    const {
      name, category, description, features,
      price, originalPrice, discountPercent, taxPercent,
      durationInMonths, maxMembers,
      offerLabel, offerExpiresAt
    } = req.body;

    // get the owner's gym
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found. Create a gym first." });
    }

    // prevent duplicate plan name for the same gym
    const existing = await Plan.findOne({ gymId: gym._id, name });
    if (existing) {
      return res.status(400).json({
        message: `A ${name} plan already exists for your gym`
      });
    }

    const plan = await Plan.create({
      gymId: gym._id,
      name,
      category,
      description,
      features,
      price,
      originalPrice,
      discountPercent,
      taxPercent,
      durationInMonths,
      maxMembers,
      offerLabel,
      offerExpiresAt,
    });

    res.status(201).json(plan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /plans/gym/:gymId
// Public — shown on gym profile page to users
const getPlansByGym = async (req, res) => {
  try {
    const plans = await Plan.find({
      gymId: req.params.gymId,
      isActive: true
    }).sort({ price: 1 }); // cheapest first

    res.status(200).json({
      total: plans.length,
      plans
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /plans/mine
// Owner only
const getMyPlans = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found." });
    }

    const plans = await Plan.find({ gymId: gym._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: plans.length,
      plans
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /plans/:id
// Public
const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate("gymId", "name address contactNumber");

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json(plan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Plan ───────────────────────────────────────────────
// PUT /plans/:id
// Owner only
const updatePlan = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found." });
    }

    // make sure this plan belongs to the owner's gym
    const plan = await Plan.findOne({ _id: req.params.id, gymId: gym._id });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found or unauthorized" });
    }

    const allowed = [
      "name", "category", "description", "features",
      "price", "originalPrice", "discountPercent", "taxPercent",
      "durationInMonths", "maxMembers", "isActive",
      "offerLabel", "offerExpiresAt",
    ];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });

    await plan.save();
    res.status(200).json(plan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /plans/:id/toggle
// Owner only — disable a plan without deleting it
const togglePlan = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found." });
    }

    const plan = await Plan.findOne({ _id: req.params.id, gymId: gym._id });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found or unauthorized" });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({
      message: `Plan is now ${plan.isActive ? "active" : "inactive"}`,
      isActive: plan.isActive
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /plans/:id
// Owner only
const deletePlan = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found." });
    }

    // only delete if it belongs to this owner's gym
    const plan = await Plan.findOneAndDelete({
      _id: req.params.id,
      gymId: gym._id
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found or unauthorized" });
    }

    res.status(200).json({ message: "Plan deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPlan,
  getPlansByGym,
  getMyPlans,
  getPlanById,
  updatePlan,
  togglePlan,
  deletePlan
};