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
const {
  validateCreatePlan,
  validateUpdatePlan,
  validatePlanId,
  validateGymIdParam,
} = require("../validators/planValidator");

// public routes
router.get("/gym/:gymId",   validateGymIdParam, getPlansByGym);
router.get("/:id",          validatePlanId,     getPlanById);

// owner only routes
router.post("/",            authMiddleware, isOwner, validateCreatePlan, createPlan);
router.get("/owner/mine",   authMiddleware, isOwner,                     getMyPlans);
router.put("/:id",          authMiddleware, isOwner, validateUpdatePlan, updatePlan);
router.put("/:id/toggle",   authMiddleware, isOwner, validatePlanId,     togglePlan);
router.delete("/:id",       authMiddleware, isOwner, validatePlanId,     deletePlan);

module.exports = router;
