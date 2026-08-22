
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const PageSeo = require('../models/PageSeo');
const auth = require('../middleware/auth');

async function getOrCreateSettings() {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
}

// تنظیمات سراسری سئو
router.get('/', async (req, res) => {
  try { res.json(await getOrCreateSettings()); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/', auth, auth.requirePermission('seo','edit'), async (req, res) => {
  try {
    const s = await getOrCreateSettings();
    Object.assign(s, req.body);
    await s.save();
    res.json(s);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// سئوی اختصاصی هر صفحه‌ی ثابت
router.get('/pages', async (req, res) => {
  try { res.json(await PageSeo.find()); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/pages', auth, auth.requirePermission('seo','edit'), async (req, res) => {
  try {
    const { path: p, ...rest } = req.body;
    if (!p) return res.status(400).json({ message: 'path الزامی است' });
    const doc = await PageSeo.findOneAndUpdate({ path: p }, { path: p, ...rest }, { new: true, upsert: true });
    res.json(doc);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/pages/:id', auth, auth.requirePermission('seo','delete'), async (req, res) => {
  try { await PageSeo.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
