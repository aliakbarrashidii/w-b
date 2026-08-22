
const mongoose = require('mongoose');
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  dept: { type: String, default: '' },
  image: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [String],
  social: {
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  order: { type: Number, default: 0 }, // ترتیب نمایش
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('TeamMember', teamMemberSchema);
