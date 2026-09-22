
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Media = require('../models/Media');
const auth = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// پسوندهای مجاز — تقریباً هر نوع فایل معمولی (تصویر، ویدیو، سند، فشرده، صوت)، به‌جز فایل‌های اجرایی/اسکریپتی خطرناک
const ALLOWED_EXT = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp', // تصویر
  '.mp4', '.webm', '.mov', '.ogg', '.avi', '.mkv', // ویدیو
  '.mp3', '.wav', '.m4a', // صوت
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', // سند
  '.zip', '.rar', '.7z', // فشرده
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : '';
    if (!safeExt) return cb(new Error('این نوع فایل مجاز نیست'));
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 60 * 1024 * 1024 }, // ۶۰ مگابایت
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return cb(new Error('این نوع فایل مجاز نیست'));
    cb(null, true);
  },
});

router.get('/', auth, async (req, res) => {
  try { const items = await Media.find().sort({ createdAt: -1 }); res.json(items); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, auth.requirePermission('media','create'), (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'فایلی ارسال نشده' });
    try {
      const media = await Media.create({
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        title: req.body.title || req.file.originalname,
      });
      res.status(201).json(media);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });
});

router.put('/:id', auth, auth.requirePermission('media','edit'), async (req, res) => {
  try {
    const { alt, title, caption } = req.body;
    const media = await Media.findByIdAndUpdate(req.params.id, { alt, title, caption }, { new: true });
    res.json(media);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('media','delete'), async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (media) {
      const filePath = path.join(uploadDir, media.filename);
      fs.unlink(filePath, () => {}); // اگه فایل نبود هم مشکلی نیست
      await media.deleteOne();
    }
    res.json({ success: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
