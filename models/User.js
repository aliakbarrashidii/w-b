
const mongoose = require('mongoose');

const modulePermission = {
  view: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
};

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'staff'], default: 'staff' }, // owner = دسترسی کامل به همه‌چیز، همیشه
  name: { type: String, default: '' },
  permissions: {
    blog: modulePermission,
    projects: modulePermission,
    portfolio: modulePermission,
    services: modulePermission,
    team: modulePermission,      // مدیریت اعضای تیم
    testimonials: modulePermission, // مدیریت نظرات مشتریان
    categories: modulePermission,
    media: modulePermission,
    seo: modulePermission,
    contact: modulePermission,   // مشاهده‌ی پیام‌های تماس
    comments: modulePermission,  // مدیریت و تأیید کامنت‌ها
    email: modulePermission,     // دسترسی به صندوق ایمیل سایت
    users: modulePermission,     // مدیریت کاربران دیگر (معمولاً فقط owner)
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
