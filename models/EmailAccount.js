
const mongoose = require('mongoose');
const emailAccountSchema = new mongoose.Schema({
  label: { type: String, default: '' },     // نام نمایشی، مثل "پشتیبانی"
  email: { type: String, required: true },  // مثل info@wizel.ir
  passwordEnc: { type: String, required: true }, // رمز عبور به‌صورت رمزنگاری‌شده

  smtpHost: { type: String, required: true },
  smtpPort: { type: Number, default: 587 },
  smtpSecure: { type: Boolean, default: false },

  imapHost: { type: String, required: true },
  imapPort: { type: Number, default: 993 },

  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('EmailAccount', emailAccountSchema);
