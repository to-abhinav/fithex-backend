const EntryLog = require("../models/EntryLog");
const Member = require("../models/Member");
const Gym = require("../models/Gym");


const checkIn = async (req, res) => {
  try {
    const userId = req.user;

    const member = await Member.findOne({ userId, status: "active" });
    if (!member) {
      return res.status(403).json({ message: "No active membership found. Cannot check in." });
    }

    const lastLog = await EntryLog.findOne({ userId, gymId: member.gymId })
      .sort({ timestamp: -1 });

    if (lastLog && lastLog.type === "CheckIn") {
      return res.status(400).json({ message: "You are already checked in. Please check out first." });
    }

    const log = await EntryLog.create({
      userId,
      gymId: member.gymId,
      type: "CheckIn",
    });

    res.status(201).json({
      message: "Checked in successfully",
      log
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const checkOut = async (req, res) => {
  try {
    const userId = req.user;

    const member = await Member.findOne({ userId, status: "active" });
    if (!member) {
      return res.status(403).json({ message: "No active membership found." });
    }

    const lastLog = await EntryLog.findOne({ userId, gymId: member.gymId })
      .sort({ timestamp: -1 });

    if (!lastLog || lastLog.type === "CheckOut") {
      return res.status(400).json({ message: "You are not checked in." });
    }

    const checkInTime = new Date(lastLog.timestamp);
    const checkOutTime = new Date();
    const minutesSpent = Math.round((checkOutTime - checkInTime) / (1000 * 60));

    const log = await EntryLog.create({
      userId,
      gymId: member.gymId,
      type: "CheckOut",
      timestamp: checkOutTime
    });

    res.status(201).json({
      message: "Checked out successfully",
      minutesSpent,
      log
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyLogs = async (req, res) => {
  try {
    const userId = req.user;

    const member = await Member.findOne({ userId, status: "active" });
    if (!member) {
      return res.status(404).json({ message: "No active membership found." });
    }

    const logs = await EntryLog.find({ userId, gymId: member.gymId })
      .sort({ timestamp: -1 });

    const sessions = [];
    let openCheckIn = null;

    const ordered = [...logs].reverse();

    ordered.forEach(log => {
      if (log.type === "CheckIn") {
        openCheckIn = log;
      } else if (log.type === "CheckOut" && openCheckIn) {
        const duration = Math.round(
          (new Date(log.timestamp) - new Date(openCheckIn.timestamp)) / (1000 * 60)
        );
        sessions.push({
          checkIn:  openCheckIn.timestamp,
          checkOut: log.timestamp,
          durationMinutes: duration
        });
        openCheckIn = null;
      }
    });

    if (openCheckIn) {
      sessions.push({
        checkIn:  openCheckIn.timestamp,
        checkOut: null,
        durationMinutes: null,
        status: "Currently inside"
      });
    }

    res.status(200).json({
      totalVisits: sessions.filter(s => s.checkOut).length,
      currentlyInGym: openCheckIn !== null,
      sessions: sessions.reverse(), // newest first
      logs
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyStatus = async (req, res) => {
  try {
    const userId = req.user;

    const member = await Member.findOne({ userId, status: "active" });
    if (!member) {
      return res.status(404).json({ message: "No active membership found." });
    }

    const lastLog = await EntryLog.findOne({ userId, gymId: member.gymId })
      .sort({ timestamp: -1 });

    const isInsideGym = lastLog && lastLog.type === "CheckIn";

    res.status(200).json({
      isInsideGym,
      lastAction: lastLog ? lastLog.type : null,
      lastTimestamp: lastLog ? lastLog.timestamp : null
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGymLogs = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found." });
    }

    const { date } = req.query;
    const filter = { gymId: gym._id };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.timestamp = { $gte: start, $lte: end };
    }

    const logs = await EntryLog.find(filter)
      .populate("userId", "name email")
      .sort({ timestamp: -1 });

    res.status(200).json({
      total: logs.length,
      logs
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getTodayAttendance = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found." });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const logs = await EntryLog.find({
      gymId: gym._id,
      timestamp: { $gte: start, $lte: end }
    }).populate("userId", "name email");

    const uniqueUserIds = [...new Set(logs.map(l => l.userId?._id?.toString()))];

    const currentlyInside = [];
    for (const uid of uniqueUserIds) {
      const lastLog = await EntryLog.findOne({
        userId: uid,
        gymId: gym._id
      }).sort({ timestamp: -1 });

      if (lastLog && lastLog.type === "CheckIn") {
        currentlyInside.push(uid);
      }
    }

    res.status(200).json({
      date: new Date().toDateString(),
      totalVisitsToday: uniqueUserIds.length,
      currentlyInsideCount: currentlyInside.length,
      logs
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyLogs,
  getMyStatus,
  getGymLogs,
  getTodayAttendance
};