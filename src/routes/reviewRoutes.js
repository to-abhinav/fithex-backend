const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isMember } = require("../middleware/roleMiddleware");
const {
  createReview,
  updateReview,
  deleteReview,
  getGymReviews,
  getMyReview,
} = require("../controllers/reviewController");
const {
  validateCreateReview,
  validateUpdateReview,
  validateGetReviews,
  validateReviewGymId,
} = require("../validators/reviewValidator");
//   paginated list gymreview
router.get("/:id/reviews", validateGetReviews, getGymReviews);

//member-get own review 
router.get("/:id/reviews/mine", authMiddleware, isMember, validateReviewGymId, getMyReview);

//member-create a review
router.post("/:id/reviews", authMiddleware, isMember, validateCreateReview, createReview);

//member-update own review
router.put("/:id/reviews", authMiddleware, isMember, validateUpdateReview, updateReview);

//member-delete own review
router.delete("/:id/reviews", authMiddleware, isMember, validateReviewGymId, deleteReview);

module.exports = router;
