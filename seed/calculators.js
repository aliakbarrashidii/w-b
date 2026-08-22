
// این فایل seed اولیه‌ی ماشین‌حساب‌هاست (نسخه‌ی سرور، معادل client/src/data/calculator.js)
// بعد از اولین اجرا، مقادیر واقعی از دیتابیس (که در پنل ادمین ویرایش می‌شن) خونده می‌شن، نه از این فایل.

const CALCULATORS = {
  'web-design': {
    title: 'ماشین حساب طراحی سایت',
    basePrice: 10000000,
    basePriceLabel: '۱۰,۰۰۰,۰۰۰',
    options: [
      {
        id: 'siteType', label: 'نوع سایت', type: 'select', required: true,
        hint: 'نوع سایت مورد نیاز خود را انتخاب کنید',
        choices: [
          { label: 'سایت شرکتی', price: 0 },
          { label: 'فروشگاه اینترنتی', price: 8000000 },
          { label: 'سایت شخصی/پورتفولیو', price: -2000000 },
          { label: 'سایت خبری/مجله', price: 5000000 },
          { label: 'سایت آموزشی', price: 6000000 },
        ]
      },
      {
        id: 'uiux', label: 'طراحی رابط کاربری (UI/UX)', type: 'toggle', defaultVal: false,
        hint: 'طراحی اختصاصی رابط کاربری بر اساس برند شما',
        freeLabel: null, price: 5000000
      },
      {
        id: 'banners', label: 'طراحی بنرهای گرافیکی', type: 'range',
        hint: 'تعداد بنرهای گرافیکی که نیاز دارید',
        min: 1, max: 50, defaultVal: 0, pricePerUnit: 200000, freeLabel: null
      },
      {
        id: 'features', label: 'بررسی امکانات ضروری', type: 'toggle', defaultVal: true,
        hint: 'بررسی و پیشنهاد قابلیت‌های بهینه', freeLabel: 'رایگان', price: 0
      },
      {
        id: 'seoBase', label: 'طراحی سئو محور اولیه', type: 'toggle', defaultVal: true,
        hint: 'طراحی اولیه با تمرکز بر رتبه بهتر در گوگل', freeLabel: 'رایگان', price: 0
      },
      {
        id: 'domain', label: 'دامنه خودتون را انتخاب کنید', type: 'select', required: false,
        hint: 'نوع دامنه مورد نیاز را انتخاب کنید',
        choices: [
          { label: 'دامنه ندارم (.ir)', price: 500000 },
          { label: 'دامنه ندارم (.com)', price: 1200000 },
          { label: 'دامنه دارم', price: 0 },
        ]
      },
      {
        id: 'hosting', label: 'پشتیبانی چند ماهه نیاز دارید', type: 'range',
        hint: 'تعداد ماه‌های پشتیبانی مورد نیاز',
        min: 1, max: 12, defaultVal: 3, pricePerUnit: 500000, freeLabel: null
      },
      {
        id: 'videoTraining', label: 'آموزش مدیریت وب‌سایت', type: 'toggle', defaultVal: true,
        hint: 'آموزش از طریق ویدیوهای آموزشی', freeLabel: 'رایگان', price: 0
      },
      {
        id: 'enamad', label: 'اخذ مجوز اینماد', type: 'toggle', defaultVal: false,
        hint: 'اخذ مجوزهای قانونی جهت اعتماد سازی کاربران', freeLabel: null, price: 1500000
      },
      {
        id: 'speedOpt', label: 'بهینه سازی سرعت سایت', type: 'select', required: false,
        hint: 'سطح بهینه‌سازی سرعت مورد نیاز',
        choices: [
          { label: 'پایه (رایگان)', price: 0 },
          { label: 'حرفه‌ای', price: 2000000 },
          { label: 'فوق حرفه‌ای', price: 4000000 },
        ]
      },
      {
        id: 'extraPages', label: 'طراحی صفحات اضافی', type: 'range',
        hint: 'تعداد صفحات اضافی (بیش از ۵ صفحه پایه)',
        min: 1, max: 250, defaultVal: 0, pricePerUnit: 300000, freeLabel: null
      },
      {
        id: 'multiLang', label: 'سایت چند زبانه', type: 'toggle', defaultVal: false,
        hint: 'پشتیبانی از چند زبان', freeLabel: null, price: 3000000
      },
      {
        id: 'security', label: 'پکیج امنیتی (وردپرس)', type: 'toggle', defaultVal: false,
        hint: 'امنیت بالا و حفاظت از سایت', freeLabel: null, price: 2000000
      },
    ]
  },
  'seo': {
    title: 'ماشین حساب سئو',
    basePrice: 4000000,
    basePriceLabel: '۴,۰۰۰,۰۰۰',
    options: [
      {
        id: 'keywords', label: 'تعداد کلمات کلیدی', type: 'range',
        hint: 'تعداد کلمات کلیدی برای بهینه‌سازی',
        min: 5, max: 100, defaultVal: 10, pricePerUnit: 150000, freeLabel: null
      },
      {
        id: 'content', label: 'تولید محتوا', type: 'toggle', defaultVal: false,
        hint: 'تولید محتوای بهینه برای کلمات کلیدی', freeLabel: null, price: 3000000
      },
      {
        id: 'linkBuilding', label: 'لینک‌سازی خارجی', type: 'toggle', defaultVal: false,
        hint: 'ساخت بک‌لینک‌های با کیفیت', freeLabel: null, price: 2500000
      },
      {
        id: 'report', label: 'گزارش‌دهی ماهانه', type: 'toggle', defaultVal: true,
        hint: 'گزارش کامل عملکرد سئو', freeLabel: 'رایگان', price: 0
      },
      {
        id: 'duration', label: 'مدت قرارداد (ماه)', type: 'range',
        hint: 'مدت زمان همکاری در ماه',
        min: 1, max: 12, defaultVal: 3, pricePerUnit: 1000000, freeLabel: null
      },
    ]
  },
  'graphic': {
    title: 'ماشین حساب گرافیک و برندبوک',
    basePrice: 3000000,
    basePriceLabel: '۳,۰۰۰,۰۰۰',
    options: [
      {
        id: 'logoType', label: 'نوع لوگو', type: 'select', required: true,
        hint: 'نوع لوگوی مورد نیاز را انتخاب کنید',
        choices: [
          { label: 'لوگو تایپ', price: 0 },
          { label: 'لوگو ترکیبی', price: 1000000 },
          { label: 'لوگو آیکونیک', price: 2000000 },
        ]
      },
      {
        id: 'brandbook', label: 'برندبوک کامل', type: 'toggle', defaultVal: false,
        hint: 'راهنمای کامل هویت بصری برند', freeLabel: null, price: 5000000
      },
      {
        id: 'concepts', label: 'تعداد کانسپت', type: 'range',
        hint: 'تعداد طرح‌های پیشنهادی',
        min: 1, max: 10, defaultVal: 3, pricePerUnit: 500000, freeLabel: null
      },
      {
        id: 'revision', label: 'تعداد ویرایش', type: 'range',
        hint: 'تعداد دور ویرایش مجاز',
        min: 1, max: 5, defaultVal: 2, pricePerUnit: 300000, freeLabel: null
      },
    ]
  }
};

module.exports = Object.entries(CALCULATORS).map(([serviceId, c]) => ({ serviceId, ...c }));
