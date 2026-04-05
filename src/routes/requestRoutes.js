// src/routes/requestRoutes.js
const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner, isMember } = require("../middleware/roleMiddleware");
const {
  applyToGym,
  getMyRequests,
  getGymRequests,
  approveRequest,
  rejectRequest,
  cancelRequest
} = require("../controllers/requestController");

router.post("/",                   authMiddleware, isMember, applyToGym);
router.get("/mine",                authMiddleware, isMember, getMyRequests);
router.get("/gym",                 authMiddleware, isOwner,  getGymRequests);
router.put("/:id/approve",         authMiddleware, isOwner,  approveRequest);
router.put("/:id/reject",          authMiddleware, isOwner,  rejectRequest);
router.put("/:id/cancel",          authMiddleware, isMember, cancelRequest);

module.exports = router;