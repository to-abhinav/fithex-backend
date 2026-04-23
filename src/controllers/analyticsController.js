const Payment = require("../models/Payment");
const Member = require("../models/Members");
const GymSession = require("../models/GymSession");
const Gym = require("../models/Gym");
const mongoose = require("mongoose");

// GET /analytics/dashboard
// Owner all key metrics
const getDashboard = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const gymId = gym._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // aggregations in parallel
    const [
      revenueData,
      memberCounts,
      newMembersThisMonth,
      churnedThisMonth,
      planBreakdown,
      peakHours,
    ] = await Promise.all([
      // 1. Revenue — this month + all-time
      Payment.aggregate([
        { $match: { gymId, status: "paid" } },
        {
          $group: {
            _id: null,
            allTimeRevenue: { $sum: "$amount" },
            thisMonthRevenue: {
              $sum: {
                $cond: [
                  { $gte: ["$createdAt", startOfMonth] },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Active
      Member.aggregate([
        { $match: { gymId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // New members this month
      Member.countDocuments({
        gymId,
        createdAt: { $gte: startOfMonth },
      }),

      // inactive this month
      Member.countDocuments({
        gymId,
        status: "inactive",
        updatedAt: { $gte: startOfMonth },
        createdAt: { $lt: startOfMonth },
      }),

      // plan-wise enrollment
      Member.aggregate([
        { $match: { gymId, status: "active" } },
        {
          $lookup: {
            from: "plans",
            localField: "subscriptionPlan",
            foreignField: "_id",
            as: "plan",
          },
        },
        { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$subscriptionPlan",
            planName: { $first: "$plan.name" },
            planCategory: { $first: "$plan.category" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Peak hours 
      GymSession.aggregate([
        {
          $match: {
            gymId,
            checkInTime: {
              $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $hour: "$checkInTime" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

   
    const activeMemberCount =
      memberCounts.find((m) => m._id === "active")?.count || 0;
    const inactiveMemberCount =
      memberCounts.find((m) => m._id === "inactive")?.count || 0;
    const totalMembers = activeMemberCount + inactiveMemberCount;

   
    const retentionRate =
      totalMembers > 0
        ? Math.round((activeMemberCount / totalMembers) * 100 * 10) / 10
        : 0;

    
    const allTimeRevenue = revenueData[0]
      ? Math.round(revenueData[0].allTimeRevenue / 100)
      : 0;
    const thisMonthRevenue = revenueData[0]
      ? Math.round(revenueData[0].thisMonthRevenue / 100)
      : 0;

    // Format peak hours
    const peakHoursFormatted = peakHours.map((h) => ({
      hour: `${h._id.toString().padStart(2, "0")}:00`,
      checkIns: h.count,
    }));

    res.status(200).json({
      gymName: gym.name,
      revenue: {
        thisMonth: thisMonthRevenue,
        allTime: allTimeRevenue,
        currency: "INR",
      },
      members: {
        active: activeMemberCount,
        inactive: inactiveMemberCount,
        total: totalMembers,
        retentionRate,
        newThisMonth: newMembersThisMonth,
        churnedThisMonth,
      },
      planBreakdown,
      peakHours: peakHoursFormatted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
};
