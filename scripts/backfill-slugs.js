// یک‌بار اجرا کن تا به پست‌های بلاگ و پروژه‌های قدیمی (بدون اسلاگ) لینک خوانا بده
// اجرا: cd server && node scripts/backfill-slugs.js
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const Blog = require('../models/Blog');
const Project = require('../models/Project');
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
async function run() {
  await mongoose.connect(config.mongoUri);
  let n = 0;
  for (const Model of [Blog, Project]) {
    const items = await Model.find({ $or: [{ slug: null }, { slug: { $exists: false } }] });
    for (const doc of items) { await doc.save(); n++; console.log(`✅ ${doc.title} -> /${doc.slug}`); }
  }
  console.log(`\n${n} مورد اسلاگ گرفت.`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
