
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

router.post("/",                     authMiddleware, isOwner,  createMember);
router.get("/",                      authMiddleware, isOwner,  getAllMembers);
router.get("/me",                    authMiddleware, isMember, getMyMembership);
router.get("/:id",                   authMiddleware,           getMemberById);
router.put("/:id/renew",             authMiddleware, isOwner,  renewMembership);
router.put("/:id/deactivate",        authMiddleware, isOwner,  deactivateMember);
router.delete("/:id",                authMiddleware, isOwner,  deleteMember);
router.put("/check-expiry",          authMiddleware, isOwner,  checkAndExpireMembers);

module.exports = router;