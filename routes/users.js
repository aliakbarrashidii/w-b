
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// فقط owner اجازه‌ی مدیریت کاربران رو داره
function ownerOnly(req, res, next) {
  if (req.admin?.role !== 'owner') return res.status(403).json({ message: 'فقط مالک اصلی سایت به این بخش دسترسی دارد' });
  next();
}

router.get('/', auth, ownerOnly, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, ownerOnly, async (req, res) => {
  try {
    const { username, password, name, permissions } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است' });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'این نام کاربری قبلاً استفاده شده' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, name, role: 'staff', permissions });
    const { passwordHash: _, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const { password, name, permissions } = req.body;
    const update = { name, permissions };
    if (password) update.passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'یافت نشد' });
    res.json(user);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'یافت نشد' });
    if (target.role === 'owner') return res.status(400).json({ message: 'حذف مالک اصلی امکان‌پذیر نیست' });
    if (String(target._id) === String(req.admin.userId)) return res.status(400).json({ message: 'نمی‌توانید خودتان را حذف کنید' });
    await target.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
