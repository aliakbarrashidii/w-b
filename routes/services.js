
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const { cache, invalidate } = require('../middleware/cache');

router.get('/', cache(60), async (req, res) => {
  try { const services = await Service.find(); res.json(services); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, auth.requirePermission('services','create'), async (req, res) => {
  try {
    if (!req.body.id) return res.status(400).json({ message: 'id سرویس الزامی است (مثلاً web-design)' });
    const exists = await Service.findOne({ id: req.body.id });
    if (exists) return res.status(400).json({ message: 'سرویسی با این شناسه از قبل وجود دارد' });
    const s = await Service.create(req.body);
    invalidate('/api/services');
    res.status(201).json(s);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, auth.requirePermission('services','edit'), async (req, res) => {
  try {
    const s = await Service.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, upsert: true });
    invalidate('/api/services');
    res.json(s);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('services','delete'), async (req, res) => {
  try {
    await Service.findOneAndDelete({ id: req.params.id });
    invalidate('/api/services');
    res.json({ success: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
