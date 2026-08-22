
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const slugify = require('../utils/slugify');
const auth = require('../middleware/auth');
const { cache, invalidate } = require('../middleware/cache');

function findByIdOrSlug(Model, idOrSlug) {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    return Model.findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
  }
  return Model.findOne({ slug: idOrSlug });
}

router.get('/', auth.optional, cache(60), async (req, res) => {
  try {
    const filter = req.isAdmin ? {} : { published: true };
    const items = await Project.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', auth.optional, cache(60), async (req, res) => {
  try {
    const item = await findByIdOrSlug(Project, req.params.id);
    if (!item || (!item.published && !req.isAdmin)) return res.status(404).json({ message: 'یافت نشد' });
    res.json(item);
  } catch (e) { res.status(404).json({ message: 'یافت نشد' }); }
});

router.post('/', auth, auth.requirePermission('projects','create'), async (req, res) => {
  try { const item = await Project.create(req.body); invalidate('/api/projects'); res.status(201).json(item); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, auth.requirePermission('projects','edit'), async (req, res) => {
  try {
    const existing = await findByIdOrSlug(Project, req.params.id);
    if (!existing) return res.status(404).json({ message: 'یافت نشد' });
    const update = { ...req.body };
    if (!existing.slug && !update.slug) {
      let base = slugify(update.title || existing.title) || 'project';
      let candidate = base, i = 2;
      while (await Project.findOne({ slug: candidate, _id: { $ne: existing._id } })) { candidate = `${base}-${i}`; i++; }
      update.slug = candidate;
    }
    const item = await Project.findByIdAndUpdate(existing._id, update, { new: true });
    invalidate('/api/projects');
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('projects','delete'), async (req, res) => {
  try {
    const existing = await findByIdOrSlug(Project, req.params.id);
    if (existing) await existing.deleteOne();
    invalidate('/api/projects');
    res.json({ success: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
