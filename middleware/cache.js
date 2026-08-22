// کش سبک در حافظه برای مسیرهای GET عمومی (بلاگ، پروژه‌ها، نمونه‌کار، خدمات).
// هدف: کاهش فشار روی دیتابیس و پاسخ‌دهی سریع‌تر، شبیه اثر LiteSpeed Cache ولی در سطح اپلیکیشن.
// TTL پیش‌فرض ۶۰ ثانیه‌ست؛ یعنی حداکثر تا ۱ دقیقه ممکنه تغییرات جدید کمی دیرتر دیده بشن.

const store = new Map(); // key -> { body, expires }

function cache(ttlSeconds = 60) {
  const ttlMs = ttlSeconds * 1000;
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.isAdmin) return next(); // درخواست‌های ادمین (شامل پیش‌نویس‌ها) هیچ‌وقت کش نمی‌شن که به کاربر عمومی درز نکنن
    const key = req.originalUrl;
    const hit = store.get(key);
    if (hit && hit.expires > Date.now()) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
      return res.json(hit.body);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, { body, expires: Date.now() + ttlMs });
      }
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
      return originalJson(body);
    };
    next();
  };
}

// وقتی محتوایی اضافه/ویرایش/حذف می‌شه، باید کش همون مسیر خالی بشه تا کاربر بلافاصله تغییر رو ببینه
function invalidate(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { cache, invalidate };
