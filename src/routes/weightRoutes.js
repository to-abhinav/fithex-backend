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

router.use(authMiddleware, isMember);

router.post("/",              logWeight);
router.get("/mine",           getMyWeightHistory);
router.get("/latest",         getLatestWeight);
router.get("/stats",          getWeightStats);       
router.get("/weekly-avg",     getWeeklyAverage);     
router.put("/:id",            updateWeightEntry);
router.delete("/:id",         deleteWeightEntry);

module.exports = router;