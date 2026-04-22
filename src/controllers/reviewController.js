const Review = require("../models/Review");
const Gym = require("../models/Gym");
const Member = require("../models/Members");




// * member of a gym (active or inactive).

const checkVerifiedMember = async (userId, gymId) => {
  const membership = await Member.findOne({ userId, gymId }).lean();
  return !!membership;
};


 // Recalculate and update the gym's aggregate ratin

const recalculateGymRating = async (gymId) => {
  const result = await Review.aggregate([
    { $match: { gymId: gymId } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Gym.findByIdAndUpdate(gymId, {
      "rating.average": Math.round(result[0].average * 10) / 10,
      "rating.totalReviews": result[0].totalReviews,
    });
  } else {
    // No reviews left — reset
    await Gym.findByIdAndUpdate(gymId, {
      "rating.average": 0,
      "rating.totalReviews": 0,
    });
  }
};




// posg /gyms/:id/reviews
// create a review for a gym
const createReview = async (req, res) => {
  try {
    const gymId = req.params.id;
    const userId = req.user;

    // Verify gym
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }
    if (!gym.isActive) {
      return res.status(403).json({ message: "Cannot review an inactive gym" });
    }

    // if review exits
    const existing = await Review.findOne({ userId, gymId });
    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this gym. Use PUT to update." });
    }

    const { rating, title, comment } = req.body;

    // Check verified 
    const isVerifiedMember = await checkVerifiedMember(userId, gymId);

    const review = await Review.create({
      userId,
      gymId,
      rating,
      title,
      comment,
      isVerifiedMember,
    });

  
    await recalculateGymRating(gym._id);

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already reviewed this gym." });
    }
    res.status(500).json({ message: error.message });
  }
};



//update own review
const updateReview = async (req, res) => {
  try {
    const gymId = req.params.id;
    const userId = req.user;

    const review = await Review.findOne({ userId, gymId });
    if (!review) {
      return res.status(404).json({ message: "You have not reviewed this gym yet" });
    }

    const { rating, title, comment } = req.body;

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;

    review.isVerifiedMember = await checkVerifiedMember(userId, gymId);

    await review.save();

    await recalculateGymRating(review.gymId);

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//delete own review
const deleteReview = async (req, res) => {
  try {
    const gymId = req.params.id;
    const userId = req.user;

    const review = await Review.findOneAndDelete({ userId, gymId });
    if (!review) {
      return res.status(404).json({ message: "You have not reviewed this gym yet" });
    }

    await recalculateGymRating(review.gymId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /gyms/:id/reviews
// paginated list
const getGymReviews = async (req, res) => {
  try {
    const gymId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "newest";

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    let sortOption;
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "highest":
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ gymId })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name profileImage")
        .lean(),
      Review.countDocuments({ gymId }),
    ]);

    res.status(200).json({
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyReview = async (req, res) => {
  try {
    const gymId = req.params.id;
    const userId = req.user;

    const review = await Review.findOne({ userId, gymId })
      .populate("userId", "name profileImage")
      .lean();

    if (!review) {
      return res.status(404).json({ message: "You have not reviewed this gym yet" });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getGymReviews,
  getMyReview,
};
