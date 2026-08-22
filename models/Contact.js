
const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
  name: String, phone: String, business: String,
  subject: String, message: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Contact', contactSchema);
