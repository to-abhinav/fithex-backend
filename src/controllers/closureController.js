const GymClosure = require("../models/GymClosure");
const Gym = require("../models/Gym");
const Member = require("../models/Members");
const notificationService = require("../services/notificationService");
const { NOTIFICATION_TYPES } = require("../constants/notificationTypes");

// POST /closures
const createClosure = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const { date, reason, type } = req.body;

    const closureDate = new Date(date);
    closureDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (closureDate < today) {
      return res.status(400).json({ message: "Cannot create closure for a past date" });
    }

    const closure = await GymClosure.create({
      gymId: gym._id,
      date: closureDate,
      reason: reason || "",
      type: type || "holiday",
    });

    // Notify all active members about the closure (fire-and-forget)
    Member.find({ gymId: gym._id, status: "active" })
      .select("userId")
      .lean()
      .then((members) => {
        const dateStr = closureDate.toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        members.forEach((m) => {
          notificationService
            .send(
              m.userId,
              NOTIFICATION_TYPES.ANNOUNCEMENT,
              `Gym Closed — ${dateStr}`,
              reason || `${gym.name} will be closed on ${dateStr}.`,
              null,
              `closure_${gym._id}_${closureDate.toISOString()}`
            )
            .catch((err) =>
              console.error("[Notification] closure notify error:", err.message)
            );
        });
      })
      .catch((err) =>
        console.error("[Closure] member notify error:", err.message)
      );

    res.status(201).json(closure);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Closure already exists for this date" });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /closures
// Owner only — view upcoming closures
const getClosures = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const closures = await GymClosure.find({
      gymId: gym._id,
      date: { $gte: today },
    }).sort({ date: 1 });

    res.status(200).json({
      total: closures.length,
      closures,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /closures/gym/:gymId
const getGymClosures = async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const closures = await GymClosure.find({
      gymId: req.params.gymId,
      date: { $gte: today },
    }).sort({ date: 1 });

    res.status(200).json({
      total: closures.length,
      closures,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /closures/:date
const deleteClosure = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const closureDate = new Date(req.params.date);
    closureDate.setUTCHours(0, 0, 0, 0);

    const closure = await GymClosure.findOneAndDelete({
      gymId: gym._id,
      date: closureDate,
    });

    if (!closure) {
      return res.status(404).json({ message: "No closure found for this date" });
    }

    res.status(200).json({ message: "Closure removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClosure,
  getClosures,
  getGymClosures,
  deleteClosure,
};
