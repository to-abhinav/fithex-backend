const crypto = require("crypto");
const GymSession = require("../models/GymSession");
const Member = require("../models/Members");
const Gym = require("../models/Gym");
const { recordActivity } = require("../services/streakService");
const notificationService = require("../services/notificationService");
const { NOTIFICATION_TYPES } = require("../constants/notificationTypes");
const { isWithinRadius, distanceBetween } = require("../utils/geoUtils");

const CHECKIN_RADIUS_METERS = 100;


const getActiveMember = async (userId) => {
  return Member.findOne({ userId, status: "active" });
};

const getOpenSession = async (userId, gymId) => {
  return GymSession.findOne({ userId, gymId, checkOutTime: null });
};


//qr Generation Owner
const generateQrSecret = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner." });
    }

    // 32byte hex
    const secret = crypto.randomBytes(32).toString("hex");

    gym.qrSecret = secret;
    await gym.save();

    
    const qrPayload = JSON.stringify({
      gymId: gym._id.toString(),
      secret,
    });

    res.status(200).json({
      message: "QR secret generated successfully.",
      qrPayload,
      hint: "Encode the qrPayload value into a QR code and display it at your gym.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const checkIn = async (req, res) => {
  try {
    const userId = req.user;
    const { qrPayload, latitude, longitude, note } = req.body;

    const member = await getActiveMember(userId);
    if (!member) {
      return res.status(403).json({
        message: "No active membership found. Cannot check in.",
      });
    }

    let qrData;
    try {
      qrData = JSON.parse(qrPayload);
    } catch {
      return res.status(400).json({
        message: "Invalid QR code. Please scan a valid gym QR code.",
      });
    }

    if (!qrData.gymId || !qrData.secret) {
      return res.status(400).json({
        message: "Malformed QR code. Missing gym identifier or secret.",
      });
    }

    if (qrData.gymId !== member.gymId.toString()) {
      return res.status(403).json({
        message: "This QR code belongs to a different gym. Please scan your gym's QR.",
      });
    }

    const gym = await Gym.findById(member.gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    if (!gym.qrSecret || gym.qrSecret !== qrData.secret) {
      return res.status(403).json({
        message: "QR code has expired or is invalid. Ask the gym to regenerate.",
      });
    }

    // ── 5. Geolocation check (100 m) ────────────────────────────────
    const [gymLat,gymLng] = gym.location.coordinates;
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    

    if (!isWithinRadius(userLat, userLng, gymLat, gymLng, CHECKIN_RADIUS_METERS)) {
      console.log("coordinates: "+userLat, userLng, gymLat, gymLng);
      const distance = distanceBetween(userLat, userLng, gymLat, gymLng);
      return res.status(403).json({
        message: `You are ${distance} m away from the gym. You must be within ${CHECKIN_RADIUS_METERS} m to check in.`,
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

    // ── 7. Capacity enforcement 
    if (gym.maxCapacity > 0 && gym.currentMembers >= gym.maxCapacity) {
      return res.status(403).json({
        message: "Gym is at full capacity. Please try again later.",
        currentOccupancy: gym.currentMembers,
        maxCapacity: gym.maxCapacity,
      });
    }

    //  8. Create session 
    const session = await GymSession.create({
      userId,
      gymId: member.gymId,
      ...(note && { note }),
    });

    Gym.findByIdAndUpdate(member.gymId, { $inc: { currentMembers: 1 } }).catch(
      (err) => console.error("[Occupancy] increment error:", err.message)
    );

  
    recordActivity(userId, member.gymId)
      .then((streak) => {
        if (!streak) return;
        // Streak milestone notifications
        if (streak.currentStreak === 1) {
          notificationService.send(
            userId,
            NOTIFICATION_TYPES.STREAK_STARTED,
            "Streak Started! ",
            "You've started a new streak. Keep it going!"
          );
        } else if (streak.currentStreak === 3) {
          notificationService.send(
            userId,
            NOTIFICATION_TYPES.STREAK_MILESTONE_3,
            "3-Day Streak! ",
            "You've hit 3 consecutive days. Consistency is key!"
          );
        } else if (streak.currentStreak === 7) {
          notificationService.send(
            userId,
            NOTIFICATION_TYPES.STREAK_MILESTONE_7,
            "7-Day Streak! ",
            "One full week of consistency — you're unstoppable!"
          );
        }
      })
      .catch((err) =>
        console.error("[Streak] Error recording activity:", err.message)
      );

    // Check-in notification 
    notificationService
      .send(userId, NOTIFICATION_TYPES.CHECKIN_CONFIRMED, "Checked In ", "Welcome to the gym! Have a great workout.")
      .catch((err) => console.error("[Notification] checkin error:", err.message));

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

    Gym.findByIdAndUpdate(member.gymId, {
      $inc: { currentMembers: -1 },
    }).catch((err) =>
      console.error("[Occupancy] decrement error:", err.message)
    );

    notificationService
      .send(
        userId,
        NOTIFICATION_TYPES.CHECKOUT_CONFIRMED,
        "Checked Out 👋",
        `Session complete — ${durationMinutes} minutes. Great job!`
      )
      .catch((err) => console.error("[Notification] checkout error:", err.message));

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

const getLiveOccupancy = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId).select(
      "name currentMembers maxCapacity"
    );
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    const occupancyPercent =
      gym.maxCapacity > 0
        ? Math.round((gym.currentMembers / gym.maxCapacity) * 100)
        : 0;

    res.status(200).json({
      gymName: gym.name,
      currentOccupancy: gym.currentMembers,
      maxCapacity: gym.maxCapacity,
      occupancyPercent,
      isFull: gym.currentMembers >= gym.maxCapacity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyGymLocation = async (req, res) => {
  try {
    const userId = req.user;

    const member = await getActiveMember(userId);
    if (!member) {
      return res.status(404).json({ message: "No active membership found." });
    }

    const gym = await Gym.findById(member.gymId).select("name location");
    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    res.status(200).json({
      gymName: gym.name,
      coordinates: gym.location.coordinates, 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateQrSecret,
  checkIn,
  checkOut,
  getMyStatus,
  getMyLogs,
  getGymLogs,
  getTodayAttendance,
  getLiveOccupancy,
  getMyGymLocation,
};