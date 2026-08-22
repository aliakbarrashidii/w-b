
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const EmailAccount = require('../models/EmailAccount');
const auth = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto');
const { emailTemplate } = require('../utils/emailTemplate');
const { fetchInboxList, fetchMessage } = require('../utils/imapClient');

function safe(account) {
  const { passwordEnc, ...rest } = account.toObject ? account.toObject() : account;
  return rest;
}

// ---- مدیریت حساب‌های ایمیل ----
router.get('/accounts', auth, auth.requirePermission('email', 'view'), async (req, res) => {
  try { const accounts = await EmailAccount.find(); res.json(accounts.map(safe)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/accounts', auth, auth.requirePermission('email', 'create'), async (req, res) => {
  try {
    const { label, email, password, smtpHost, smtpPort, smtpSecure, imapHost, imapPort } = req.body;
    if (!email || !password || !smtpHost || !imapHost) return res.status(400).json({ message: 'اطلاعات ناقص است' });
    const cleanPassword = String(password).replace(/\s+/g, '');
    const account = await EmailAccount.create({
      label, email: String(email).trim(), passwordEnc: encrypt(cleanPassword),
      smtpHost, smtpPort: smtpPort || 587, smtpSecure: !!smtpSecure,
      imapHost, imapPort: imapPort || 993,
    });
    res.status(201).json(safe(account));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/accounts/:id', auth, auth.requirePermission('email', 'delete'), async (req, res) => {
  try { await EmailAccount.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// ---- خواندن اینباکس ----
router.get('/accounts/:id/inbox', auth, auth.requirePermission('email', 'view'), async (req, res) => {
  try {
    const account = await EmailAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'حساب یافت نشد' });
    const password = decrypt(account.passwordEnc);
    const list = await fetchInboxList(account, password, 30);
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: `اتصال به صندوق ایمیل ناموفق بود: ${e.message}` });
  }
});

router.get('/accounts/:id/inbox/:uid', auth, auth.requirePermission('email', 'view'), async (req, res) => {
  try {
    const account = await EmailAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'حساب یافت نشد' });
    const password = decrypt(account.passwordEnc);
    const msg = await fetchMessage(account, password, req.params.uid);
    res.json(msg);
  } catch (e) {
    res.status(500).json({ message: `خواندن پیام ناموفق بود: ${e.message}` });
  }
});

// ---- ارسال ایمیل (با قالب برندشده) ----
router.post('/accounts/:id/send', auth, auth.requirePermission('email', 'create'), async (req, res) => {
  try {
    const account = await EmailAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'حساب یافت نشد' });
    const password = decrypt(account.passwordEnc);
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) return res.status(400).json({ message: 'اطلاعات ناقص است' });

    const transporter = nodemailer.createTransport({
      host: account.smtpHost, port: account.smtpPort, secure: account.smtpSecure,
      auth: { user: account.email, pass: password },
    });

    await transporter.sendMail({
      from: `"${account.label || account.email}" <${account.email}>`,
      to, subject,
      html: emailTemplate({ title: subject, bodyHtml: message.replace(/\n/g, '<br/>') }),
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: `ارسال ایمیل ناموفق بود: ${e.message}` });
  }
});

module.exports = router;
