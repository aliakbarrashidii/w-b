
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // برای لینک‌های خوانا مثل /blog/عنوان-پست
  content: { type: String, required: true }, // متن ساده (نسخه‌ی قدیمی / fallback برای پیش‌نمایش و جستجو)
  blocks: { type: mongoose.Schema.Types.Mixed, default: null }, // محتوای بلوک‌محور (ادیتور شبیه المنتور)
  tag: String,
  coverImage: String,
  metaTitle: String,
  metaDescription: String,
  focusKeyword: String,
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

blogSchema.pre('save', async function(next){
  this.updatedAt = new Date();
  if (!this.slug && this.title) {
    let base = slugify(this.title) || 'post';
    let candidate = base;
    let i = 2;
    while (await this.constructor.findOne({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${i}`;
      i++;
    }
    this.slug = candidate;
  }
  next();
});
blogSchema.pre('findOneAndUpdate', function(next){ this.set({ updatedAt: new Date() }); next(); });
module.exports = mongoose.model('Blog', blogSchema);
