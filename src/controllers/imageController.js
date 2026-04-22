const User = require("../models/User");
const { cloudinary, uploadToCloudinary } = require("../config/cloudinary");
const AVATARS = require("../constants/avatars");


const updateProfileImage = async (req, res) => {
  try {
    const { avatarId } = req.body;
    const uploadedFile = req.file;

    if (!avatarId && !uploadedFile) {
      return res.status(400).json({ message: "Provide avatarId or an image file." });
    }

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Delete old custom image 
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    if (avatarId) {
      const avatar = AVATARS.find((a) => a.id === avatarId);
      if (!avatar) return res.status(400).json({ message: "Invalid avatarId." });

      user.profileImage = avatar.url;
      user.profileImagePublicId = null; 
    } else {
      
      const result = await uploadToCloudinary(uploadedFile.buffer, {
        folder: "fithex/profiles",
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      });

      user.profileImage = result.secure_url;
      user.profileImagePublicId = result.public_id;
    }

    await user.save();
    res.json({ success: true, profileImage: user.profileImage });
  } catch (err) {
    console.error("updateProfileImage error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


const updateBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image provided." });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.bannerImagePublicId) {
      await cloudinary.uploader.destroy(user.bannerImagePublicId);
    }

    
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "fithex/banners",
      transformation: [{ width: 1200, height: 400, crop: "fill" }],
    });

    user.bannerImage = result.secure_url;
    user.bannerImagePublicId = result.public_id;

    await user.save();
    res.json({ success: true, bannerImage: user.bannerImage });
  } catch (err) {
    console.error("updateBannerImage error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


const getAvatars = (req, res) => {
  res.json({ avatars: AVATARS });
};

module.exports = {
  updateProfileImage,
  updateBannerImage,
  getAvatars,
};
