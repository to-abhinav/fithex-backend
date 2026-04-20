const AVATARS = require('../constants/avatars');

router.get('/avatars', (req, res) => {
  res.json({ avatars: AVATARS });
});