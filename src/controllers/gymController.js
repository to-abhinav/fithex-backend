const Gym = require("../models/Gym");
const User = require("../models/User");


// POST /gyms
// Owner only — one owner can only create one gym
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
      amenities, timings, maxCapacity
    } = req.body;

    const gym = await Gym.create({
      ownerId: req.user,
      name, description, contactNumber, whatsappNumber,
      email, website, address, location,
      amenities, timings, maxCapacity
    });

    res.status(201).json(gym);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get My Gym 
// GET /gyms/mine
// Owner only — owner sees their own gym dashboard
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
// Public anyone can veiw gym details
const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
      .populate("ownerId", "name email");

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

    const gyms = await Gym.find({
      isActive: true,
      isVerified: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).select("name address images.cover images.profile rating contactNumber amenities location currentMembers maxCapacity");

    res.status(200).json({
      total: gyms.length,
      gyms
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Public — text search by name or city
const searchGyms = async (req, res) => {
  try {
    const { q, city } = req.query;

    if (!q && !city) {
      return res.status(400).json({ message: "Provide a Gym name or city" });
    }

    const filter = { isActive: true, isVerified: true };

    // text search on name + city index
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
      "timings", "maxCapacity", "isActive"
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

// Update Gym Images
// PUT /gyms/:id/images
// Owner only — update profile, cover, gallery separately
const updateGymImages = async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.id, ownerId: req.user });
    if (!gym) {
      return res.status(404).json({ message: "Gym not found or unauthorized" });
    }

    const { profile, cover, gallery } = req.body;

    if (profile !== undefined) gym.images.profile = profile;
    if (cover !== undefined)   gym.images.cover = cover;
    if (gallery !== undefined) {
      if (gallery.length > 15) {
        return res.status(400).json({ message: "Max 15 gallery images allowed" });
      }
      gym.images.gallery = gallery;
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