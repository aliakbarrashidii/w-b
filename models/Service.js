
const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  num: String,
  title: String,
  short: String,
  desc: String,
  color: String,
  gradient: String,
  image: String, // آیکون/تصویر SVG یا هر تصویر دیگه‌ی این سرویس
  tags: [String],
  startPrice: String,
  video: String, // آدرس ویدیوی معرفی این سرویس (فایل مستقیم mp4 یا لینک یوتیوب/آپارات)
  packages: [{
    name: String, price: String, popular: Boolean,
    features: [String]
  }]
});
module.exports = mongoose.model('Service', serviceSchema);
