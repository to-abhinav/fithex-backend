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
const {
  validateCreateGym,
  validateUpdateGym,
  validateUpdateGymImages,
  validateUpdateTimings,
  validateNearbyGyms,
  validateSearchGyms,
  validateGymId,
} = require("../validators/gymValidator");

router.get("/nearby",      validateNearbyGyms, getNearbyGyms);
router.get("/search",      validateSearchGyms, searchGyms);
router.get("/:id",         validateGymId,      getGymById);

router.post("/",                       authMiddleware, isOwner, validateCreateGym,      createGym);
router.get("/owner/mine",              authMiddleware, isOwner,                         getMyGym);
router.put("/:id",                     authMiddleware, isOwner, validateUpdateGym,       updateGym);
router.put("/:id/images",              authMiddleware, isOwner, validateUpdateGymImages, updateGymImages);
router.put("/:id/timings",             authMiddleware, isOwner, validateUpdateTimings,   updateTimings);
router.put("/:id/toggle-status",       authMiddleware, isOwner, validateGymId,           toggleGymStatus);
router.delete("/:id",                  authMiddleware, isOwner, validateGymId,           deleteGym);

module.exports = router;
