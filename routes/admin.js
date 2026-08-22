
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Project = require('../models/Project');
const Portfolio = require('../models/Portfolio');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const [blogs, projects, portfolios, contacts] = await Promise.all([
      Blog.countDocuments(), Project.countDocuments(), Portfolio.countDocuments(), Contact.countDocuments()
    ]);
    res.json({ blogs, projects, portfolios, services: 6, contacts });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
