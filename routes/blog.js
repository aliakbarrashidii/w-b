
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
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
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', auth.optional, cache(60), async (req, res) => {
  try {
    const blog = await findByIdOrSlug(Blog, req.params.id);
    if (!blog || (!blog.published && !req.isAdmin)) return res.status(404).json({ message: 'مطلب یافت نشد' });
    res.json(blog);
  } catch (e) { res.status(404).json({ message: 'مطلب یافت نشد' }); }
});

router.post('/', auth, auth.requirePermission('blog','create'), async (req, res) => {
  try { const blog = await Blog.create(req.body); invalidate('/api/blog'); res.status(201).json(blog); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, auth.requirePermission('blog','edit'), async (req, res) => {
  try {
    const existing = await findByIdOrSlug(Blog, req.params.id);
    if (!existing) return res.status(404).json({ message: 'مطلب یافت نشد' });
    const update = { ...req.body };
    // پست‌های قدیمی که هنوز اسلاگ ندارن، همین‌جا یکی می‌سازیم؛ اگه دارن، دست‌نخورده می‌مونه (لینک قدیمی نشکنه)
    if (!existing.slug && !update.slug) {
      let base = slugify(update.title || existing.title) || 'post';
      let candidate = base, i = 2;
      while (await Blog.findOne({ slug: candidate, _id: { $ne: existing._id } })) { candidate = `${base}-${i}`; i++; }
      update.slug = candidate;
    }
    const blog = await Blog.findByIdAndUpdate(existing._id, update, { new: true });
    invalidate('/api/blog');
    res.json(blog);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('blog','delete'), async (req, res) => {
  try {
    const existing = await findByIdOrSlug(Blog, req.params.id);
    if (existing) await existing.deleteOne();
    invalidate('/api/blog');
    res.json({ success: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
