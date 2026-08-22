
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try { const cats = await Category.find().sort({ name: 1 }); res.json(cats); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, auth.requirePermission('categories','create'), async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'نام دسته‌بندی الزامی است' });
    let cat = await Category.findOne({ name });
    if (!cat) cat = await Category.create({ name });
    res.status(201).json(cat);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('categories','delete'), async (req, res) => {
  try { await Category.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
