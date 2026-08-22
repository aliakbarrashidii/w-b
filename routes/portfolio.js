
const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');
const { cache, invalidate } = require('../middleware/cache');

router.get('/', cache(60), async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const items = await Portfolio.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, auth.requirePermission('portfolio','create'), async (req, res) => {
  try { const item = await Portfolio.create(req.body); invalidate('/api/portfolio'); res.status(201).json(item); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, auth.requirePermission('portfolio','edit'), async (req, res) => {
  try { const item = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true }); invalidate('/api/portfolio'); res.json(item); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('portfolio','delete'), async (req, res) => {
  try { await Portfolio.findByIdAndDelete(req.params.id); invalidate('/api/portfolio'); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
