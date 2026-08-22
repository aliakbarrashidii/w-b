// تنظیمات مرکزی سرور — همه‌چیز از .env خونده می‌شه.
// برای هاست جدید فقط .env رو عوض کن؛ هیچ فایل دیگه‌ای نیاز به تغییر نداره.

require('dotenv').config();

function required(name, fallbackForDev) {
  const val = process.env[name];
  if (val) return val;
  if (process.env.NODE_ENV !== 'production' && fallbackForDev !== undefined) return fallbackForDev;
  console.error(`❌ متغیر محیطی ضروری تعریف نشده: ${name} (در فایل .env قرار بده)`);
  process.exit(1);
}

// CLIENT_URL می‌تونه چند آدرس با کاما جدا شده باشه (مثلاً دامنه با/بدون www یا محیط staging)
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

module.exports = {
  port: parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongoUri: required('MONGODB_URI', 'mongodb://localhost:27017/wizel'),
  jwtSecret: required('JWT_SECRET', 'dev_only_secret_change_me'),

  clientUrls,

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD,
  },

  email: {
    host: (process.env.EMAIL_HOST || 'smtp.gmail.com').trim(),
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: (process.env.EMAIL_USER || '').trim(),
    // App Password گوگل معمولاً با فاصله نمایش داده می‌شه (مثل "abcd efgh ijkl mnop")؛
    // این‌جا فاصله‌ها حذف می‌شن تا اگه کاربر با فاصله کپی کرده باشه هم مشکلی پیش نیاد.
    pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
    to: (process.env.EMAIL_TO || process.env.EMAIL_USER || '').trim(),
  },

  siteName: process.env.SITE_NAME || 'ویزل',
  siteUrl: (process.env.SITE_URL || clientUrls[0] || 'http://localhost:5173').replace(/\/+$/, ''),
};
