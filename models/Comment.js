
const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  postType: { type: String, enum: ['blog', 'project'], required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  text: { type: String, required: true },
  approved: { type: Boolean, default: false }, // تا وقتی ادمین تأیید نکنه، عمومی نمایش داده نمی‌شه
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Comment', commentSchema);
