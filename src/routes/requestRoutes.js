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
const {
  validateApplyToGym,
  validateRejectRequest,
  validateRequestId,
} = require("../validators/requestValidator");

router.post("/",                   authMiddleware, isMember, validateApplyToGym,    applyToGym);
router.get("/mine",                authMiddleware, isMember,                        getMyRequests);
router.get("/gym",                 authMiddleware, isOwner,                         getGymRequests);
router.put("/:id/approve",         authMiddleware, isOwner,  validateRequestId,     approveRequest);
router.put("/:id/reject",          authMiddleware, isOwner,  validateRejectRequest, rejectRequest);
router.put("/:id/cancel",          authMiddleware, isMember, validateRequestId,     cancelRequest);

module.exports = router;
