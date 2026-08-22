const config = require('../config');

// قالب ایمیل حرفه‌ای و برندشده
function emailTemplate({ title, bodyHtml, footerNote, button }) {
  return `
<!doctype html>
<html dir="rtl" lang="fa">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="
margin:0;
padding:0;
background:#eef3fa;
font-family:Tahoma,Arial,sans-serif;
direction:rtl;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 10px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="
max-width:600px;
background:#ffffff;
border-radius:24px;
overflow:hidden;
box-shadow:0 15px 40px rgba(0,30,80,.12);
">

<!-- HEADER -->
<tr>
<td style="
background:linear-gradient(135deg,#031b4e,#1268ff);
padding:35px 30px;
text-align:center;
">

<div style="
width:70px;
height:70px;
margin:0 auto 15px;
background:rgba(255,255,255,.15);
border-radius:20px;
line-height:70px;
font-size:34px;
color:#fff;
">
✦
</div>


<div style="
font-size:24px;
font-weight:bold;
color:#ffffff;
letter-spacing:.5px;
">
${config.siteName}
</div>


<div style="
margin-top:8px;
font-size:13px;
color:rgba(255,255,255,.75);
">
تجربه‌ای سریع، امن و حرفه‌ای
</div>

</td>
</tr>


<!-- CONTENT -->
<tr>
<td style="
padding:40px 35px;
">

${title ? `
<h1 style="
margin:0 0 25px;
font-size:22px;
color:#081a36;
font-weight:bold;
">
${title}
</h1>
` : ''}


<div style="
font-size:15px;
line-height:2.1;
color:#42526b;
">

${bodyHtml}

</div>


${button ? `

<div style="
text-align:center;
margin-top:35px;
">

<a href="${button.url}"
style="
display:inline-block;
background:linear-gradient(135deg,#1268ff,#00a8ff);
color:white;
text-decoration:none;
padding:14px 35px;
border-radius:12px;
font-size:15px;
font-weight:bold;
box-shadow:0 8px 20px rgba(18,104,255,.25);
">
${button.text}
</a>

</div>

` : ''}


</td>
</tr>



<!-- FEATURE BOX -->
<tr>
<td style="
padding:0 35px 30px;
">

<div style="
background:#f5f8ff;
border:1px solid #e2eaff;
border-radius:16px;
padding:18px;
text-align:center;
">

<div style="
font-size:13px;
color:#52637d;
line-height:1.8;
">

با تشکر از همراهی شما با ${config.siteName}
<br>
ما همیشه تلاش می‌کنیم بهترین تجربه را برای شما فراهم کنیم.

</div>

</div>

</td>
</tr>



<!-- FOOTER -->
<tr>
<td style="
background:#07162f;
padding:25px 30px;
text-align:center;
">

<div style="
font-size:13px;
color:rgba(255,255,255,.7);
line-height:2;
">

${footerNote || 
`این ایمیل به‌صورت خودکار توسط ${config.siteName} ارسال شده است.`}

</div>


<div style="
margin-top:15px;
font-size:11px;
color:rgba(255,255,255,.35);
">

© ${new Date().getFullYear()} ${config.siteName}. All rights reserved.

</div>


</td>
</tr>


</table>

</td>
</tr>
</table>


</body>
</html>
`;
}


module.exports = { emailTemplate };