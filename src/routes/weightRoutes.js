const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isMember } = require("../middleware/roleMiddleware");
const {
  logWeight,
  getMyWeightHistory,
  getLatestWeight,
  getWeightStats,
  getWeeklyAverage,
  updateWeightEntry,
  deleteWeightEntry,
} = require("../controllers/weightController");
const {
  validateLogWeight,
  validateUpdateWeight,
  validateWeightId,
} = require("../validators/weightValidator");

router.use(authMiddleware, isMember);

router.post("/",              validateLogWeight,    logWeight);
router.get("/mine",                                 getMyWeightHistory);
router.get("/latest",                               getLatestWeight);
router.get("/stats",                                getWeightStats);
router.get("/weekly-avg",                           getWeeklyAverage);
router.put("/:id",            validateUpdateWeight, updateWeightEntry);
router.delete("/:id",         validateWeightId,     deleteWeightEntry);

module.exports = router;