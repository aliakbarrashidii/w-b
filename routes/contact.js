
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const config = require('../config');
const { emailTemplate } = require('../utils/emailTemplate');

router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    // ارسال ایمیل اطلاع‌رسانی — اگه این بخش fail بشه، نباید کل درخواست کاربر fail بشه
    // (پیام کاربر همین الان با موفقیت ذخیره شد؛ خطای ایمیل فقط لاگ می‌شه)
    if (config.email.user && config.email.pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: false,
          auth: { user: config.email.user, pass: config.email.pass }
        });
        const rows = [
          ['نام', req.body.name],
          ['تلفن', req.body.phone],
          ['کسب‌وکار', req.body.business || '-'],
          ['موضوع', req.body.subject || '-'],
          ['توضیحات', (req.body.message || '-').replace(/\n/g, '<br/>')],
        ];
        const bodyHtml = `
          <table style="border-collapse:collapse;width:100%;">
            ${rows.map(([k, v]) => `<tr><td style="padding:9px 12px;border:1px solid #e4ebf5;background:#f7fafd;font-weight:bold;width:110px;">${k}</td><td style="padding:9px 12px;border:1px solid #e4ebf5;">${v}</td></tr>`).join('')}
          </table>`;
        await transporter.sendMail({
          from: `"${config.siteName}" <${config.email.user}>`,
          to: config.email.to,
          subject: `درخواست مشاوره جدید از ${req.body.name}`,
          html: emailTemplate({ title: 'درخواست مشاوره جدید', bodyHtml, footerNote: 'این پیام از فرم تماس با ما ارسال شده است.' }),
        });
      } catch (emailErr) {
        console.error('⚠️ ارسال ایمیل اطلاع‌رسانی فرم تماس ناموفق بود (پیام مشتری با این حال ذخیره شد):', emailErr.message);
      }
    }

    res.status(201).json({ success: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/', auth, auth.requirePermission('contact', 'view'), async (req, res) => {
  try { const contacts = await Contact.find().sort({ createdAt: -1 }); res.json(contacts); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', auth, auth.requirePermission('contact', 'delete'), async (req, res) => {
  try { await Contact.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
