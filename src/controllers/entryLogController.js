const GymSession = require("../models/GymSession");
const Member = require("../models/Members");
const Gym = require("../models/Gym");


const getActiveMember = async (userId) => {
  return Member.findOne({ userId, status: "active" });
};

const getOpenSession = async (userId, gymId) => {
  return GymSession.findOne({ userId, gymId, checkOutTime: null });
};


const checkIn = async (req, res) => {
  try {
    const userId = req.user;

    const member = await getActiveMember(userId);
    if (!member) {
      return res.status(403).json({
        message: "No active membership found. Cannot check in.",
      });
    }

    // Prevent double check-in
    const openSession = await getOpenSession(userId, member.gymId);
    if (openSession) {
      return res.status(400).json({
        message: "You are already checked in. Please check out first.",
        checkInTime: openSession.checkInTime,
      });
    }

    const session = await GymSession.create({
      userId,
      gymId: member.gymId,
    });

    res.status(201).json({
      message: "Checked in successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const checkOut = async (req, res) => {
  try {
    const userId = req.user;

    const member = await getActiveMember(userId);
    if (!member) {
      return res.status(403).json({ message: "No active membership found." });
    }

    const openSession = await getOpenSession(userId, member.gymId);
    if (!openSession) {
      return res.status(400).json({ message: "You are not checked in." });
    }

    const checkOutTime = new Date();
    const durationMinutes = Math.round(
      (checkOutTime - new Date(openSession.checkInTime)) / (1000 * 60)
    );

    const session = await GymSession.findByIdAndUpdate(
      openSession._id,
      {
        checkOutTime,
        durationMinutes,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Checked out successfully",
      durationMinutes,
      session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyStatus = async (req, res) => {
  try {
    const userId = req.user;

    const member = await getActiveMember(userId);
    if (!member) {
      return res.status(404).json({ message: "No active membership found." });
    }

    const openSession = await getOpenSession(userId, member.gymId);

    res.status(200).json({
      isInsideGym: !!openSession,
      checkInTime: openSession ? openSession.checkInTime : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyLogs = async (req, res) => {
  try {
    const userId = req.user;

    const member = await getActiveMember(userId);
    if (!member) {
      return res.status(404).json({ message: "No active membership found." });
    }

    const sessions = await GymSession.find({ userId, gymId: member.gymId })
      .sort({ checkInTime: -1 });

    const completedSessions = sessions.filter((s) => s.checkOutTime !== null);
    const openSession = sessions.find((s) => s.checkOutTime === null) || null;

    res.status(200).json({
      totalVisits: completedSessions.length,
      isInsideGym: !!openSession,
      currentSession: openSession,
      sessions,
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
      filter.checkInTime = { $gte: start, $lte: end };
    }

    const sessions = await GymSession.find(filter)
      .populate("userId", "name email")
      .sort({ checkInTime: -1 });

    res.status(200).json({
      total: sessions.length,
      sessions,
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

    const sessions = await GymSession.find({
      gymId: gym._id,
      checkInTime: { $gte: start, $lte: end },
    }).populate("userId", "name email");

   
    const currentlyInside = sessions.filter((s) => s.checkOutTime === null);

    
    const uniqueVisitors = [
      ...new Set(sessions.map((s) => s.userId?._id?.toString())),
    ];

    res.status(200).json({
      date: new Date().toDateString(),
      totalVisitsToday: uniqueVisitors.length,
      currentlyInsideCount: currentlyInside.length,
      currentlyInside,   
      sessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyStatus,
  getMyLogs,
  getGymLogs,
  getTodayAttendance,
};