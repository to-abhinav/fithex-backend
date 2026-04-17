
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isOwner, isMember } = require("../middleware/roleMiddleware");
const {
  createMember,
  getAllMembers,
  getMemberById,
  getMyMembership,
  renewMembership,
  deactivateMember,
  deleteMember,
  checkAndExpireMembers
} = require("../controllers/memberController");
const {
  validateCreateMember,
  validateRenewMembership,
  validateMemberId,
} = require("../validators/memberValidator");

router.post("/",                     authMiddleware, isOwner,  validateCreateMember,    createMember);
router.get("/",                      authMiddleware, isOwner,                           getAllMembers);
router.get("/me",                    authMiddleware, isMember,                          getMyMembership);
router.get("/:id",                   authMiddleware,           validateMemberId,         getMemberById);
router.put("/:id/renew",             authMiddleware, isOwner,  validateRenewMembership, renewMembership);
router.put("/:id/deactivate",        authMiddleware, isOwner,  validateMemberId,         deactivateMember);
router.delete("/:id",                authMiddleware, isOwner,  validateMemberId,         deleteMember);
router.put("/check-expiry",          authMiddleware, isOwner,                           checkAndExpireMembers);

module.exports = router;