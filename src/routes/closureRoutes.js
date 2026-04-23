const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner } = require("../middleware/roleMiddleware");
const {
  createClosure,
  getClosures,
  getGymClosures,
  deleteClosure,
} = require("../controllers/closureController");
const {
  validateCreateClosure,
  validateClosureDate,
  validateClosureGymId,
} = require("../validators/closureValidator");

router.post("/",          authMiddleware, isOwner, validateCreateClosure, createClosure);
router.get("/",           authMiddleware, isOwner,                        getClosures);
router.delete("/:date",   authMiddleware, isOwner, validateClosureDate,   deleteClosure);

router.get("/gym/:gymId", validateClosureGymId, getGymClosures);

module.exports = router;
