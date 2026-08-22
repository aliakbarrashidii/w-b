
const mongoose = require('mongoose');
const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },   // نام فایل روی دیسک
  url: { type: String, required: true },         // آدرس عمومی (/uploads/xxx.jpg)
  originalName: String,
  mimetype: String,
  size: Number,
  alt: { type: String, default: '' },     // متن جایگزین — برای سئوی تصویر
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Media', mediaSchema);
