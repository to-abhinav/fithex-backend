const { cloudinary, uploadBanner } = require('../config/cloudinary');

router.patch('/banner-image', authMiddleware, uploadBanner.single('bannerImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided.' });

    const user = await User.findById(req.user.id);

    if (user.bannerImagePublicId) {
      await cloudinary.uploader.destroy(user.bannerImagePublicId);
    }

    user.bannerImage = req.file.path;
    user.bannerImagePublicId = req.file.filename;

    await user.save();
    res.json({ success: true, bannerImage: user.bannerImage });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});