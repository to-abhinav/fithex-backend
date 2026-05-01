const { cloudinary, uploadProfile, uploadToCloudinary } = require('../config/cloudinary');
const AVATARS = require('../constants/avatars');

router.patch('/profile-image', authMiddleware, uploadProfile.single('profileImage'), async (req, res) => {
  try {
    const { avatarId } = req.body;
    const uploadedFile = req.file;

    if (!avatarId && !uploadedFile) {
      return res.status(400).json({ message: 'Provide avatarId or an image file.' });
    }

    const user = await User.findById(req.user.id);

    // Delete old custom image from Cloudinary
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    if (avatarId) {
      const avatar = AVATARS.find(a => a.id === avatarId);
      if (!avatar) return res.status(400).json({ message: 'Invalid avatarId.' });

      user.profileImage = avatar.url;
      user.profileImagePublicId = null;

    } else {
      // Actually upload the buffer to Cloudinary
      const result = await uploadToCloudinary(uploadedFile.buffer, {
        folder: 'fithex/profiles',
        public_id: `user_${req.user.id}`,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
      });

      user.profileImage = result.secure_url;
      user.profileImagePublicId = result.public_id;
    }

    await user.save();
    res.json({ success: true, profileImage: user.profileImage });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});