
const express = require('express');
const router = express.Router();
const Calculator = require('../models/Calculator');
const auth = require('../middleware/auth');
const { cache, invalidate } = require('../middleware/cache');

router.get('/', cache(60), async (req, res) => {
  try { const list = await Calculator.find(); res.json(list); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:serviceId', cache(60), async (req, res) => {
  try {
    const calc = await Calculator.findOne({ serviceId: req.params.serviceId });
    if (!calc) return res.status(404).json({ message: 'یافت نشد' });
    res.json(calc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:serviceId', auth, auth.requirePermission('services', 'edit'), async (req, res) => {
  try {
    const calc = await Calculator.findOneAndUpdate(
      { serviceId: req.params.serviceId },
      { ...req.body, serviceId: req.params.serviceId },
      { new: true, upsert: true }
    );
    invalidate('/api/calculators');
    res.json(calc);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:serviceId', auth, auth.requirePermission('services', 'delete'), async (req, res) => {
  try { await Calculator.findOneAndDelete({ serviceId: req.params.serviceId }); invalidate('/api/calculators'); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
