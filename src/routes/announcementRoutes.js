const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner } = require("../middleware/roleMiddleware");
const {
  createAnnouncement,
  getMyAnnouncements,
  getGymAnnouncements,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const {
  validateCreateAnnouncement,
  validateAnnouncementId,
  validateAnnouncementGymId,
} = require("../validators/announcementValidator");

router.post("/",          authMiddleware, isOwner, validateCreateAnnouncement, createAnnouncement);
router.get("/",           authMiddleware, isOwner,                             getMyAnnouncements);
router.delete("/:id",     authMiddleware, isOwner, validateAnnouncementId,     deleteAnnouncement);

router.get("/gym/:gymId", authMiddleware, validateAnnouncementGymId, getGymAnnouncements);

module.exports = router;
