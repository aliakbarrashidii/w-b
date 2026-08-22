
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });

    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, username: user.username, name: user.name, role: user.role, permissions: user.permissions },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// اطلاعات کاربر فعلی (برای رفرش دسترسی‌ها در کلاینت بدون نیاز به لاگین مجدد)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.admin.userId);
    if (!user) return res.status(404).json({ message: 'یافت نشد' });
    res.json({ id: user._id, username: user.username, name: user.name, role: user.role, permissions: user.permissions });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
