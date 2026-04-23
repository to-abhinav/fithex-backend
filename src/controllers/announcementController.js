const Announcement = require("../models/Announcement");
const Gym = require("../models/Gym");
const Member = require("../models/Members");
const notificationService = require("../services/notificationService");
const { NOTIFICATION_TYPES } = require("../constants/notificationTypes");

// POST /announcements
// Owner create announcement
const createAnnouncement = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const { title, message, category } = req.body;

    const announcement = await Announcement.create({
      gymId: gym._id,
      ownerId: req.user,
      title,
      message,
      category: category || "general",
    });

    // Fan out to all active members (fire-and-forget)
    Member.find({ gymId: gym._id, status: "active" })
      .select("userId")
      .lean()
      .then((members) => {
        members.forEach((m) => {
          notificationService
            .send(
              m.userId,
              NOTIFICATION_TYPES.ANNOUNCEMENT,
              title,
              message,
              { announcementId: announcement._id, category },
              `announcement_${announcement._id}_${m.userId}`
            )
            .catch((err) =>
              console.error("[Notification] announcement error:", err.message)
            );
        });
      })
      .catch((err) =>
        console.error("[Announcement] fan-out error:", err.message)
      );

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /announcements
const getMyAnnouncements = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      Announcement.find({ gymId: gym._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments({ gymId: gym._id }),
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      announcements,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /announcements/gym/:gymId
const getGymAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      Announcement.find({ gymId: req.params.gymId, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments({ gymId: req.params.gymId, isActive: true }),
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      announcements,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found for this owner" });
    }

    const announcement = await Announcement.findOneAndUpdate(
      { _id: req.params.id, gymId: gym._id },
      { isActive: false },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement deleted", announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getMyAnnouncements,
  getGymAnnouncements,
  deleteAnnouncement,
};
