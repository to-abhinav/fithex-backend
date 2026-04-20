const { cloudinary, uploadProfile } = require('../config/cloudinary');
const AVATARS = require('./avatars');

router.patch('/profile-image', authMiddleware, uploadProfile.single('profileImage'), async (req, res) => {
  try {
    const { avatarId } = req.body;
    const uploadedFile  = req.file;

    if (!avatarId && !uploadedFile) {
      return res.status(400).json({ message: 'Provide avatarId or an image file.' });
    }

    const user = await User.findById(req.user.id);

    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    if (avatarId) {
      const avatar = AVATARS.find(a => a.id === avatarId);
      if (!avatar) return res.status(400).json({ message: 'Invalid avatarId.' });

      user.profileImage = avatar.url;
      user.profileImagePublicId = null; 

    } else {
      // File uploaded — multer-cloudinary already handled the upload
      user.profileImage = uploadedFile.path;          // secure URL
      user.profileImagePublicId = uploadedFile.filename; // public_id for future deletion
    }

    await user.save();
    res.json({ success: true, profileImage: user.profileImage });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});