
const Imap = require('imap');
const { simpleParser } = require('mailparser');

function connect(account, password) {
  return new Imap({
    user: account.email,
    password,
    host: account.imapHost,
    port: account.imapPort,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    connTimeout: 15000,
    authTimeout: 15000,
  });
}

// لیست آخرین ایمیل‌های اینباکس (خلاصه: فرستنده، موضوع، تاریخ، پیش‌نمایش کوتاه)
function fetchInboxList(account, password, limit = 25) {
  return new Promise((resolve, reject) => {
    const imap = connect(account, password);
    const results = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) { imap.end(); return reject(err); }
        if (!box.messages.total) { imap.end(); return resolve([]); }

        const start = Math.max(1, box.messages.total - limit + 1);
        const range = `${start}:${box.messages.total}`;
        const f = imap.seq.fetch(range, { bodies: '', struct: true });

        f.on('message', (msg, seqno) => {
          let buffer = '';
          let uid = null;
          let flags = [];
          msg.on('body', stream => { stream.on('data', chunk => { buffer += chunk.toString('utf8'); }); });
          msg.once('attributes', attrs => { uid = attrs.uid; flags = attrs.flags || []; });
          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(buffer);
              results.push({
                uid,
                seqno,
                from: parsed.from?.text || '',
                subject: parsed.subject || '(بدون موضوع)',
                date: parsed.date,
                snippet: (parsed.text || '').slice(0, 140),
                seen: flags.includes('\\Seen'),
              });
            } catch (e) { /* از این پیام رد شو */ }
          });
        });

        f.once('error', e => { imap.end(); reject(e); });
        f.once('end', () => {
          imap.end();
        });
      });
    });

    imap.once('error', reject);
    imap.once('end', () => {
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(results);
    });

    imap.connect();
  });
}

// خواندن کامل یک پیام بر اساس uid
function fetchMessage(account, password, uid) {
  return new Promise((resolve, reject) => {
    const imap = connect(account, password);

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err) => {
        if (err) { imap.end(); return reject(err); }
        const f = imap.fetch(uid, { bodies: '', struct: true });
        let found = false;

        f.on('message', msg => {
          found = true;
          let buffer = '';
          msg.on('body', stream => { stream.on('data', chunk => { buffer += chunk.toString('utf8'); }); });
          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(buffer);
              imap.end();
              resolve({
                from: parsed.from?.text || '',
                to: parsed.to?.text || '',
                subject: parsed.subject || '(بدون موضوع)',
                date: parsed.date,
                text: parsed.text || '',
                html: parsed.html || null,
              });
            } catch (e) { imap.end(); reject(e); }
          });
        });

        f.once('error', e => { imap.end(); reject(e); });
        f.once('end', () => { if (!found) { imap.end(); reject(new Error('پیام یافت نشد')); } });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
}

module.exports = { fetchInboxList, fetchMessage };
