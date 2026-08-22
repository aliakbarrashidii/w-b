
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // برای لینک‌های خوانا مثل /projects/عنوان-پروژه
  summary: { type: String, default: '' }, // خلاصه‌ی کوتاه برای کارت‌ها
  content: { type: String, default: '' }, // متن ساده (fallback)
  blocks: { type: mongoose.Schema.Types.Mixed, default: null }, // محتوای بلوک‌محور
  tag: String,          // مثلاً: اپلیکیشن، وب‌سایت، ابزار داخلی
  coverImage: String,
  link: String,         // آدرس واقعی سایت/اپ (اختیاری)
  metaTitle: String,
  metaDescription: String,
  focusKeyword: String,
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
projectSchema.pre('save', async function(next){
  this.updatedAt = new Date();
  if (!this.slug && this.title) {
    let base = slugify(this.title) || 'project';
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
projectSchema.pre('findOneAndUpdate', function(next){ this.set({ updatedAt: new Date() }); next(); });
module.exports = mongoose.model('Project', projectSchema);
