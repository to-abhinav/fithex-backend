const mongoose = require("mongoose");
const Gym = require("../models/Gym");
const User = require("../models/User");
const { uploadToCloudinary } = require("../config/cloudinary");


// POST /gyms
const createGym = async (req, res) => {
  try {
    // check if owner already has a gym
    const existing = await Gym.findOne({ ownerId: req.user });
    if (existing) {
      return res.status(400).json({ message: "You already have a registered gym" });
    }

    const {
      name, description, contactNumber, whatsappNumber,
      email, website, address, location,
      amenities, timings, maxCapacity,
      socialLinks, equipment, genderPolicy, minimumAge
    } = req.body;

    const gym = await Gym.create({
      ownerId: req.user,
      name, description, contactNumber, whatsappNumber,
      email, website, address, location,
      amenities, timings, maxCapacity,
      socialLinks, equipment, genderPolicy, minimumAge
    });

    res.status(201).json(gym);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get My Gym 
// GET /gyms/mine
const getMyGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({ ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "No gym found. Please create one first." });
    }

    res.status(200).json(gym);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /gyms/:id
const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
      .populate("ownerId", "name email phone profileImage createdAt");

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    if (!gym.isActive) {
      return res.status(403).json({ message: "This gym is currently inactive" });
    }

    res.status(200).json(gym);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get Nearby Gyms 
//GET /gyms/nearby?longitude=75.8&latitude=30.9&radius=10
//used on the map/discover screen
const getNearbyGyms = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: "longitude and latitude are required" });
    }

    const radiusInMeters = parseFloat(radius) * 1000; // km to meters

    let gyms = await Gym.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).select("name address images.cover images.profile rating contactNumber amenities location currentMembers maxCapacity timings isVerified isFeatured");

    if (gyms.length === 0) {
      gyms = await Gym.find({ isActive: true })
        .select("name address images.cover images.profile rating contactNumber amenities location currentMembers maxCapacity timings isVerified isFeatured")
        .limit(20);
    }

    res.status(200).json({
      total: gyms.length,
      gyms
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Public text search by name or city
const searchGyms = async (req, res) => {
  try {
    const { q, city } = req.query;

    if (!q && !city) {
      return res.status(400).json({ message: "Provide a Gym name or city" });
    }

    const filter = { isActive: true };

  
    if (q) {
      filter.$text = { $search: q };
    }

    if (city) {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    const gyms = await Gym.find(filter)
      .select("name address images.cover rating amenities contactNumber location")
      .limit(20);

    res.status(200).json({
      total: gyms.length,
      gyms
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Gym 
// PUT /gyms/:id
// Owner only — update gym info
const updateGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.id, ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found or unauthorized" });
    }

    // fields owner is allowed to update
    const allowed = [
      "name", "description", "contactNumber", "whatsappNumber",
      "email", "website", "address", "amenities",
      "timings", "maxCapacity", "isActive",
      "socialLinks", "equipment", "genderPolicy", "minimumAge",
      "images",
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        gym[field] = req.body[field];
      }
    });

    await gym.save();
    res.status(200).json(gym);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /gyms/:id/images
const updateGymImages = async (req, res) => {
  try {
    // Validate ID (since we removed express-validator for this route)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid gym ID." });
    }

    const gym = await Gym.findOne({ _id: req.params.id, ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found or unauthorized" });
    }

    if (!gym.images) gym.images = {};

    if (req.files?.profileImage?.[0]) {
      const file = req.files.profileImage[0];
      const result = await uploadToCloudinary(file.buffer, {
        folder: `fithex/gyms/${gym._id}/profile`,
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      });
      gym.images.profile = result.secure_url;
    }

    if (req.files?.bannerImage?.[0]) {
      const file = req.files.bannerImage[0];
      const result = await uploadToCloudinary(file.buffer, {
        folder: `fithex/gyms/${gym._id}/cover`,
        transformation: [{ width: 1200, height: 675, crop: "fill" }],
      });
      gym.images.cover = result.secure_url;
    }

    // Gallery Images 
    if (req.files?.galleryImages?.length) {
      if ((gym.images.gallery?.length || 0) + req.files.galleryImages.length > 15) {
        return res.status(400).json({ message: "Max 15 gallery images allowed" });
      }

      const uploads = await Promise.all(
        req.files.galleryImages.map((file) =>
          uploadToCloudinary(file.buffer, {
            folder: `fithex/gyms/${gym._id}/gallery`,
          })
        )
      );

      const newUrls = uploads.map((r) => r.secure_url);
      gym.images.gallery = [...(gym.images.gallery || []), ...newUrls];
    }

    await gym.save();
    res.status(200).json({ message: "Images updated", images: gym.images });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Timings
// PUT /gyms/:id/timings
// Owner only — set open/close times per day
const updateTimings = async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.id, ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found or unauthorized" });
    }

    const { timings } = req.body;
    if (!Array.isArray(timings)) {
      return res.status(400).json({ message: "timings must be an array" });
    }

    gym.timings = timings;
    await gym.save();

    res.status(200).json({ message: "Timings updated", timings: gym.timings });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Gym Active Status
// PUT /gyms/:id/toggle-status
//temporarily close or reopen the gym
const toggleGymStatus = async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.id, ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found or unauthorized" });
    }

    gym.isActive = !gym.isActive;
    await gym.save();

    res.status(200).json({
      message: `Gym is now ${gym.isActive ? "active" : "inactive"}`,
      isActive: gym.isActive
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findOneAndDelete({ _id: req.params.id, ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found or unauthorized" });
    }

    res.status(200).json({ message: "Gym deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGym,
  getMyGym,
  getGymById,
  getNearbyGyms,
  searchGyms,
  updateGym,
  updateGymImages,
  updateTimings,
  toggleGymStatus,
  deleteGym
};