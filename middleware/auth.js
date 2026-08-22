
const jwt = require('jsonwebtoken');
const config = require('../config');

// بررسی می‌کنه که توکن معتبره؛ اطلاعات پایه‌ی توکن (userId, username, role) رو در req.admin می‌ذاره.
// این فقط لاگین‌بودن رو تضمین می‌کنه، نه دسترسی به یک قابلیت خاص — برای اون از requirePermission استفاده کن.
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'دسترسی غیرمجاز' });
  try {
    const decoded = jwt.verify(header.slice(7), config.jwtSecret);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'توکن نامعتبر' });
  }
}

// نسخه‌ی اختیاری: اگه توکن معتبر بود req.isAdmin=true می‌شه، وگرنه رد نمی‌کنه
// (برای مسیرهای عمومی که می‌خوان پیش‌نویس‌ها رو فقط به ادمین نشون بدن)
auth.optional = function (req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { const decoded = jwt.verify(header.slice(7), config.jwtSecret); req.isAdmin = true; req.admin = decoded; }
    catch { req.isAdmin = false; }
  } else {
    req.isAdmin = false;
  }
  next();
};

// بررسی دسترسی دقیق به یک قابلیت خاص (مثلاً بلاگ → ویرایش).
// همیشه از دیتابیس تازه می‌خونه (نه از payload توکن) تا تغییر دسترسی توسط owner فوراً اثر بذاره.
// owner همیشه به همه‌چیز دسترسی داره، صرف‌نظر از این ماتریس.
auth.requirePermission = function (moduleName, action) {
  return async (req, res, next) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.admin.userId);
      if (!user) return res.status(401).json({ message: 'کاربر یافت نشد' });
      if (user.role === 'owner') { req.currentUser = user; return next(); }
      const allowed = user.permissions?.[moduleName]?.[action];
      if (!allowed) return res.status(403).json({ message: 'شما دسترسی لازم برای این عملیات را ندارید' });
      req.currentUser = user;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
};

module.exports = auth;
