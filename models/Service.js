
const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  num: String,
  title: String,
  short: String,
  desc: String,
  color: String,
  gradient: String,
  image: String, // آیکون/تصویر SVG یا هر تصویر دیگه‌ی این سرویس (فقط تو صفحه‌ی خدمات)
  catalogIcon: String,  // آیکون آماده برای کارت نمونه‌کارها/پکیج‌ها (مستقل از تصویر بالا)
  catalogImage: String, // یا یک تصویر آپلودی برای همون کارت‌ها — اگه ست بشه، به‌جای آیکون کل مربع رو پر می‌کنه
  tags: [String],
  startPrice: String,
  video: String, // آدرس ویدیوی معرفی این سرویس (فایل مستقیم mp4 یا لینک یوتیوب/آپارات)
  packages: [{
    name: String, price: String, popular: Boolean,
    image: String, // آیکون/تصویر اختصاصی این پکیج
    features: [String]
  }]
});
module.exports = mongoose.model('Service', serviceSchema);
