
const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { cache, invalidate } = require('../middleware/cache');

async function withRelated(items) {
  const out = [];
  for (const t of items) {
    const obj = t.toObject ? t.toObject() : t;
    if (obj.relatedType === 'portfolio' && obj.relatedId) {
      const p = await Portfolio.findById(obj.relatedId).select('title category imageUrl');
      obj.related = p || null;
    } else if (obj.relatedType === 'project' && obj.relatedId) {
      const p = await Project.findById(obj.relatedId).select('title tag coverImage');
      obj.related = p || null;
    }
    out.push(obj);
  }
  return out;
}

router.get('/', cache(60), async (req, res) => {
  try {
    const items = await Testimonial.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json(await withRelated(items));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/all', auth, auth.requirePermission('testimonials', 'view'), async (req, res) => {
  try {
    const items = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(await withRelated(items));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, auth.requirePermission('testimonials', 'create'), async (req, res) => {
  try { const t = await Testimonial.create(req.body); invalidate('/api/testimonials'); res.status(201).json(t); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, auth.requirePermission('testimonials', 'edit'), async (req, res) => {
  try { const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true }); invalidate('/api/testimonials'); res.json(t); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('testimonials', 'delete'), async (req, res) => {
  try { await Testimonial.findByIdAndDelete(req.params.id); invalidate('/api/testimonials'); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
