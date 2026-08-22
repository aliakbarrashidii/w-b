
const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
  // سئوی سراسری — پیش‌فرض برای صفحاتی که خودشون تنظیم اختصاصی ندارن
  defaultMetaTitle: { type: String, default: '' },
  defaultMetaDescription: { type: String, default: '' },
  defaultOgImage: { type: String, default: '' },
  titleTemplate: { type: String, default: '%s | {site}' }, // %s جای عنوان صفحه، {site} جای نام سایت

  // تأیید مالکیت در ابزارهای وبمستر
  googleSiteVerification: { type: String, default: '' },
  bingSiteVerification: { type: String, default: '' },

  // آنالیتیکس
  googleAnalyticsId: { type: String, default: '' }, // مثل G-XXXXXXX

  // کنترل سراسری ایندکس شدن (برای سایت‌های در حال توسعه)
  siteIndexable: { type: Boolean, default: true },

  updatedAt: { type: Date, default: Date.now }
});
settingsSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('Settings', settingsSchema);
