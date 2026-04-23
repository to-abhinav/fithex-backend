const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isMember, isOwner } = require("../middleware/roleMiddleware");
const {
  createReview,
  updateReview,
  deleteReview,
  getGymReviews,
  getMyReview,
  replyToReview,
} = require("../controllers/reviewController");
const {
  validateCreateReview,
  validateUpdateReview,
  validateGetReviews,
  validateReviewGymId,
  validateReplyToReview,
} = require("../validators/reviewValidator");

router.get("/:id/reviews", validateGetReviews, getGymReviews);

router.get("/:id/reviews/mine", authMiddleware, isMember, validateReviewGymId, getMyReview);

router.post("/:id/reviews", authMiddleware, isMember, validateCreateReview, createReview);

router.put("/:id/reviews", authMiddleware, isMember, validateUpdateReview, updateReview);

router.delete("/:id/reviews", authMiddleware, isMember, validateReviewGymId, deleteReview);

router.post("/:id/reviews/:reviewId/reply", authMiddleware, isOwner, validateReplyToReview, replyToReview);

module.exports = router;
