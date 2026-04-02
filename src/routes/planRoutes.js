// src/routes/planRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner } = require("../middleware/roleMiddleware");
const {
  createPlan,
  getPlansByGym,
  getMyPlans,
  getPlanById,
  updatePlan,
  togglePlan,
  deletePlan
} = require("../controllers/planController");

// public routes
router.get("/gym/:gymId",   getPlansByGym);
router.get("/:id",          getPlanById);

// owner only routes
router.post("/",            authMiddleware, isOwner, createPlan);
router.get("/owner/mine",   authMiddleware, isOwner, getMyPlans);
router.put("/:id",          authMiddleware, isOwner, updatePlan);
router.put("/:id/toggle",   authMiddleware, isOwner, togglePlan);
router.delete("/:id",       authMiddleware, isOwner, deletePlan);

module.exports = router;