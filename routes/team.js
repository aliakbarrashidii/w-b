
const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const auth = require('../middleware/auth');
const { cache, invalidate } = require('../middleware/cache');

router.get('/', cache(60), async (req, res) => {
  try {
    const members = await TeamMember.find({ published: true }).sort({ order: 1, createdAt: 1 });
    res.json(members);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// لیست کامل برای پنل ادمین (شامل غیرفعال‌ها هم)
router.get('/all', auth, auth.requirePermission('team', 'view'), async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json(members);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, auth.requirePermission('team', 'create'), async (req, res) => {
  try { const m = await TeamMember.create(req.body); invalidate('/api/team'); res.status(201).json(m); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, auth.requirePermission('team', 'edit'), async (req, res) => {
  try { const m = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true }); invalidate('/api/team'); res.json(m); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('team', 'delete'), async (req, res) => {
  try { await TeamMember.findByIdAndDelete(req.params.id); invalidate('/api/team'); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
