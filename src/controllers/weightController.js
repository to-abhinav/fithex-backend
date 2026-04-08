const WeightLog = require("../models/WeightLog");
const User = require("../models/User");

const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: "Underweight", color: "blue" };
  if (bmi < 25)   return { label: "Normal",      color: "green" };
  if (bmi < 30)   return { label: "Overweight",  color: "amber" };
  return                  { label: "Obese",       color: "red" };
};


const logWeight = async (req, res) => {
  try {
    const { weight, goalWeight, date, note } = req.body;

    if (!weight) {
      return res.status(400).json({ message: "Weight is required" });
    }

    const entry = new WeightLog({
      userId: req.user,
      weight,
      goalWeight: goalWeight || null,
      date: date || Date.now(),
      note,
    });

    await entry.save(); 

    res.status(201).json({
      message: "Weight logged successfully",
      entry: {
        ...entry.toObject(),
        bmiCategory: getBMICategory(entry.bmi),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getMyWeightHistory = async (req, res) => {
  try {
    const entries = await WeightLog.find({ userId: req.user })
      .sort({ date: -1 })
      .lean();

    const enriched = entries.map((e) => ({
      ...e,
      bmiCategory: getBMICategory(e.bmi),
    }));

    res.json({ count: enriched.length, entries: enriched });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getLatestWeight = async (req, res) => {
  try {
    const entry = await WeightLog.findOne({ userId: req.user })
      .sort({ date: -1 })
      .lean();

    if (!entry) {
      return res.status(404).json({ message: "No weight entries found" });
    }

    res.json({
      ...entry,
      bmiCategory: getBMICategory(entry.bmi),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getWeightStats = async (req, res) => {
  try {
    
    const entries = await WeightLog.find({ userId: req.user })
      .sort({ date: -1 })
      .limit(14)
      .lean();

    if (!entries.length) {
      return res.status(404).json({ message: "No weight entries found" });
    }

    const latest = entries[0];
    const previous = entries.length > 1 ? entries[1] : null;

 
    const weekAgo = entries.find((e) => {
      const diffDays =
        (new Date(latest.date) - new Date(e.date)) / (1000 * 60 * 60 * 24);
      return diffDays >= 6;
    });

    const weekDelta = weekAgo
      ? parseFloat((latest.weight - weekAgo.weight).toFixed(1))
      : null;

    const goalGap =
      latest.goalWeight
        ? parseFloat((latest.weight - latest.goalWeight).toFixed(1))
        : null;

    res.json({
      currentWeight:  latest.weight,
      bmi:            latest.bmi,
      bmiCategory:    getBMICategory(latest.bmi),
      goalWeight:     latest.goalWeight,
      goalGap,                         
      weekDelta,                     
      previousWeight: previous?.weight || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const getWeeklyAverage = async (req, res) => {
  try {
    const data = await WeightLog.aggregate([
      { $match: { userId: req.user } },
      {
        $group: {
          _id: {
            year:  { $isoWeekYear: "$date" },
            week:  { $isoWeek: "$date" },
          },
          avgWeight: { $avg: "$weight" },
          count:     { $sum: 1 },
          weekStart: { $min: "$date" },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      {
        $project: {
          _id: 0,
          year:      "$_id.year",
          week:      "$_id.week",
          weekStart: 1,
          avgWeight: { $round: ["$avgWeight", 1] },
          count:     1,
        },
      },
    ]);

    res.json({ weeks: data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const updateWeightEntry = async (req, res) => {
  try {
    const entry = await WeightLog.findOne({
      _id: req.params.id,
      userId: req.user,
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const { weight, goalWeight, date, note } = req.body;
    if (weight !== undefined) entry.weight = weight;
    if (goalWeight !== undefined) entry.goalWeight = goalWeight;
    if (date !== undefined) entry.date = date;
    if (note !== undefined) entry.note = note;

    await entry.save(); 

    res.json({
      message: "Entry updated",
      entry: {
        ...entry.toObject(),
        bmiCategory: getBMICategory(entry.bmi),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteWeightEntry = async (req, res) => {
  try {
    const entry = await WeightLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  logWeight,
  getMyWeightHistory,
  getLatestWeight,
  getWeightStats,
  getWeeklyAverage,
  updateWeightEntry,
  deleteWeightEntry,
};