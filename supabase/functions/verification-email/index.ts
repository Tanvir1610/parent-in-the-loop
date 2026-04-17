// lib/emails/verification.ts

export function verificationEmailHtml(email: string, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Confirm your subscription 🌱</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0;color:#222}
    .wrap{max-width:560px;margin:0 auto;padding:32px 16px}
    .card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hdr{background:linear-gradient(135deg,#A6B6A1,#7C63B8);padding:36px 40px;text-align:center}
    .hdr h1{font-size:24px;font-weight:800;color:#fff;margin-bottom:8px}
    .hdr p{font-size:14px;color:rgba(255,255,255,.85)}
    .body{padding:32px 40px}
    p{font-size:15px;color:#3E3E3E;line-height:1.7;margin-bottom:14px}
    .cta{text-align:center;margin:28px 0}
    .btn{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;
         font-size:16px;font-weight:800;padding:15px 40px;border-radius:50px;
         box-shadow:0 4px 14px rgba(243,167,142,0.4)}
    .url-box{background:#FAF6F0;border-radius:10px;padding:12px 16px;margin:20px 0;
             font-size:12px;color:#888;word-break:break-all;border:1px solid #EDE8E1}
    .url-box a{color:#7C63B8;text-decoration:none}
    .note{font-size:13px;color:#B79D84;text-align:center;margin-top:8px}
    .ftr{padding:20px 40px;background:#F5F0EA;border-top:1px solid #EDE8E1;text-align:center}
    .ftr p{font-size:12px;color:#B79D84;line-height:1.6}
    .ftr a{color:#7C63B8;text-decoration:none}
  </style>
</head>
<body>
<div class="wrap"><div class="card">

  <div class="hdr">
    <div style="font-size:40px;margin-bottom:12px">📬</div>
    <h1>One click to confirm!</h1>
    <p>Just verify your email to join Parent in the Loop</p>
  </div>

  <div class="body">
    <p><strong>Hey there! 👋</strong></p>
    <p>
      Thanks for signing up. We just need to confirm this is really you —
      click the button below to verify your email and get your weekly AI wisdom.
    </p>

    <div class="cta">
      <a href="${verifyUrl}" class="btn">✅ Confirm My Subscription</a>
    </div>

    <p class="note">This link expires in <strong>48 hours</strong>.</p>

    <div class="url-box">
      Button not working? Copy and paste this link into your browser:<br/>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>

    <p style="font-size:13px;color:#B79D84;text-align:center;">
      If you didn't subscribe to Parent in the Loop, you can safely ignore this email.
    </p>
  </div>

  <div class="ftr">
    <p>
      You're receiving this because <strong>${email}</strong> was used to subscribe at
      <a href="https://parentintheloop.com">parentintheloop.com</a>.<br/>
      We never sell or share your email. Privacy-first 🔒
    </p>
  </div>

</div></div>
</body>
</html>`
}

export function verificationEmailText(email: string, verifyUrl: string): string {
  return `Confirm your subscription to Parent in the Loop 🌱

Hey there! Thanks for signing up.

Click this link to verify your email address and start receiving your weekly AI wisdom:

${verifyUrl}

This link expires in 48 hours.

If you didn't subscribe, just ignore this email.

---
Sent because ${email} was used to subscribe at parentintheloop.com.
We never sell or share your email. 🔒
`
}