
const mongoose = require('mongoose');
const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientRole: { type: String, default: '' }, // مثلاً "مدیرعامل فروشگاه X"
  text: { type: String, required: true },
  resultLabel: { type: String, default: '' }, // یک آمار واقعی، مثلاً "۴۰٪ افزایش فروش" — اختیاری
  relatedType: { type: String, enum: ['portfolio', 'project', null], default: null },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Testimonial', testimonialSchema);
