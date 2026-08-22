
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const submitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

// ثبت کامنت جدید (عمومی) — تا تأیید ادمین نمایش داده نمی‌شه
router.post('/', submitLimiter, async (req, res) => {
  try {
    const { postType, postId, name, email, text } = req.body;
    if (!postType || !postId || !name || !text) return res.status(400).json({ message: 'اطلاعات ناقص است' });
    const comment = await Comment.create({ postType, postId, name, email, text });
    res.status(201).json({ success: true, message: 'نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.', comment });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// دریافت کامنت‌های تأییدشده‌ی یک پست خاص (عمومی)
router.get('/post/:postType/:postId', async (req, res) => {
  try {
    const { postType, postId } = req.params;
    const comments = await Comment.find({ postType, postId, approved: true }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// لیست کامل (پنل ادمین) — شامل تأییدنشده‌ها هم
router.get('/', auth, auth.requirePermission('comments', 'view'), async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', auth, auth.requirePermission('comments', 'edit'), async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { new: true });
    res.json(comment);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('comments', 'delete'), async (req, res) => {
  try { await Comment.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
