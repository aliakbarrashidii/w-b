
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const app = express();
const PORT = config.port;

// Middleware
app.use(compression()); // فشرده‌سازی gzip پاسخ‌ها — کاهش حجم انتقال و افزایش سرعت (مشابه اثر LiteSpeed Cache)
app.use(cors({
  origin: (origin, cb) => {
    // درخواست‌های بدون origin (مثل Postman یا سرور به سرور) مجاز هستن
    if (!origin || config.clientUrls.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '10mb' }));

// فایل‌های آپلودی (کتابخانه‌ی رسانه) — به‌صورت استاتیک در دسترس هستن
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '30d' }));

// سایت‌مپ و robots.txt — همیشه زنده از دیتابیس ساخته می‌شن (مستقل از build، مستقل از هاست)
app.use('/', require('./routes/sitemap'));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/contact', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/services', require('./routes/services'));
app.use('/api/team', require('./routes/team'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/calculators', require('./routes/calculators'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/email', require('./routes/email'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/media', require('./routes/media'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// حالت دیپلوی یکپارچه: اگه client رو build کرده باشی (npm run build داخل پوشه‌ی client)،
// همین سرور خودش کل سایت رو هم serve می‌کنه — یعنی با یک پروسه‌ی Node، هم API هم سایت هم سایت‌مپ روی یک دامنه بالا میان.
// این ساده‌ترین و مطمئن‌ترین راه برای اجرا روی هر هاستیه (VPS، cPanel Node app، Railway، Render و...).
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '7d', index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt') return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('📦 حالت دیپلوی یکپارچه فعال است: کلاینت از client/dist سرو می‌شود.');
}

// MongoDB
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
mongoose.connect(config.mongoUri)
  .then(async () => {
    console.log('✅ MongoDB connected');
    try {
      const Service = require('./models/Service');
      if (await Service.countDocuments() === 0) {
        await Service.insertMany(require('./seed/services'));
        console.log('🌱 داده‌ی اولیه‌ی خدمات ساخته شد');
      }
    } catch (e) { console.error('⚠️ خطا در seed کردن خدمات:', e.message); }

    try {
      const Calculator = require('./models/Calculator');
      if (await Calculator.countDocuments() === 0) {
        await Calculator.insertMany(require('./seed/calculators'));
        console.log('🌱 داده‌ی اولیه‌ی ماشین‌حساب‌ها ساخته شد');
      }
    } catch (e) { console.error('⚠️ خطا در seed کردن ماشین‌حساب‌ها:', e.message); }

    try {
      const TeamMember = require('./models/TeamMember');
      if (await TeamMember.countDocuments() === 0) {
        await TeamMember.insertMany(require('./seed/team'));
        console.log('🌱 داده‌ی اولیه‌ی تیم ساخته شد');
      }
    } catch (e) { console.error('⚠️ خطا در seed کردن تیم:', e.message); }

    try {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      if (await User.countDocuments() === 0) {
        const fullAccess = { view: true, create: true, edit: true, delete: true };
        await User.create({
          username: config.admin.username,
          passwordHash: await bcrypt.hash(config.admin.password || 'change_me', 10),
          name: 'مالک سایت',
          role: 'owner',
          permissions: {
            blog: fullAccess, projects: fullAccess, portfolio: fullAccess, services: fullAccess,
            team: fullAccess, categories: fullAccess, media: fullAccess, seo: fullAccess, contact: fullAccess,
            comments: fullAccess, email: fullAccess, users: fullAccess, testimonials: fullAccess,
          },
        });
        console.log(`🌱 کاربر مالک اصلی ساخته شد (نام کاربری: ${config.admin.username})`);
      }
    } catch (e) { console.error('⚠️ خطا در seed کردن کاربر مالک:', e.message); }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(e => { console.error('❌ MongoDB error:', e.message); process.exit(1); });

