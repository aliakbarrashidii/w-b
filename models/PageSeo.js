
const mongoose = require('mongoose');
const pageSeoSchema = new mongoose.Schema({
  path: { type: String, required: true, unique: true }, // مثل '/', '/about', '/services'
  label: { type: String, default: '' },                  // نام نمایشی در پنل ادمین
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  focusKeyword: { type: String, default: '' },
  noindex: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});
pageSeoSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('PageSeo', pageSeoSchema);
