const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner } = require("../middleware/roleMiddleware");
const {
  createGym, getMyGym, getGymById,
  getNearbyGyms, searchGyms, updateGym,
  updateGymImages, updateTimings,
  toggleGymStatus, deleteGym
} = require("../controllers/gymController");

// public routes — no auth needed
router.get("/nearby",      getNearbyGyms);
router.get("/search",      searchGyms);
router.get("/:id",         getGymById);

// owner only routes
router.post("/",                       authMiddleware, isOwner, createGym);
router.get("/owner/mine",              authMiddleware, isOwner, getMyGym);
router.put("/:id",                     authMiddleware, isOwner, updateGym);
router.put("/:id/images",              authMiddleware, isOwner, updateGymImages);
router.put("/:id/timings",             authMiddleware, isOwner, updateTimings);
router.put("/:id/toggle-status",       authMiddleware, isOwner, toggleGymStatus);
router.delete("/:id",                  authMiddleware, isOwner, deleteGym);

module.exports = router;