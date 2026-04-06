export function welcomeEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Parent in the Loop 🌱</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAF6F0; color: #222222; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #A6B6A1 0%, #7C63B8 100%); padding: 40px; text-align: center; }
    .header h1 { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
    .header p { font-size: 15px; color: rgba(255,255,255,0.85); }
    .body { padding: 36px 40px; }
    .body p { font-size: 15px; color: #3E3E3E; line-height: 1.7; margin-bottom: 16px; }
    .expect-box { background: #FAF6F0; border-radius: 14px; border-left: 4px solid #F3A78E; padding: 20px 24px; margin: 24px 0; }
    .expect-box h3 { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #B79D84; margin-bottom: 12px; }
    .expect-item { display: flex; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #3E3E3E; line-height: 1.5; }
    .expect-item:last-child { margin-bottom: 0; }
    .tip-box { background: rgba(185,166,227,0.1); border: 1.5px solid rgba(124,99,184,0.2); border-radius: 14px; padding: 20px 24px; margin: 24px 0; }
    .tip-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #B79D84; margin-bottom: 8px; }
    .tip-text { font-size: 15px; color: #222222; font-weight: 600; line-height: 1.6; }
    .cta-wrap { text-align: center; margin: 32px 0 24px; }
    .cta-btn { display: inline-block; background: #F3A78E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 14px 36px; border-radius: 50px; }
    .footer { padding: 24px 40px; background: #F5F0EA; border-top: 1px solid #EDE8E1; text-align: center; }
    .footer p { font-size: 12px; color: #B79D84; line-height: 1.6; }
    .footer a { color: #7C63B8; text-decoration: none; }
    .hashtags { margin-top: 10px; font-size: 12px; color: #B9A6E3; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div style="font-size:40px;margin-bottom:14px;">🌱</div>
        <h1>You&rsquo;re in the Loop!</h1>
        <p>Welcome to the Parent in the Loop community</p>
      </div>
      <div class="body">
        <p><strong>Hey there, welcome! 👋</strong></p>
        <p>You&rsquo;ve just joined a growing community of parents helping their kids develop a <strong>joyful, empowered understanding of AI</strong> &mdash; through honest conversations, fun activities, and evidence-based guidance.</p>
        <p>Your first weekly AI wisdom email arrives <strong>next week</strong> &mdash; check your inbox!</p>
        <div class="expect-box">
          <h3>What you&rsquo;ll get every week</h3>
          <div class="expect-item"><span>📝</span><div><strong>A fresh AI literacy topic</strong> &mdash; explained simply, without the hype</div></div>
          <div class="expect-item"><span>💬</span><div><strong>A family conversation starter</strong> &mdash; words you can use at dinner tonight</div></div>
          <div class="expect-item"><span>🎯</span><div><strong>A hands-on activity</strong> &mdash; playful, screen-optional, under 10 minutes</div></div>
          <div class="expect-item"><span>⏱️</span><div><strong>Under 5 minutes to read</strong> &mdash; we respect your time</div></div>
        </div>
        <div class="tip-box">
          <div class="tip-label">✨ This week&rsquo;s family tip</div>
          <div class="tip-text">Ask your child: &ldquo;Can you name 3 things in our home that use AI?&rdquo; You might be surprised what they already know! 🏠</div>
        </div>
        <p>While you wait, explore our latest articles on AI literacy for families.</p>
        <div class="cta-wrap">
          <a href="https://parentintheloop.com" class="cta-btn">Browse Articles &rarr;</a>
        </div>
        <p style="font-size:14px;color:#B79D84;text-align:center;">Questions? Just reply to this email &mdash; we read every message.</p>
      </div>
      <div class="footer">
        <p>You&rsquo;re receiving this because <strong>${email}</strong> subscribed at <a href="https://parentintheloop.com">parentintheloop.com</a>.<br/>
        <a href="https://parentintheloop.substack.com">Unsubscribe anytime</a> &middot; We never sell your email &middot; Privacy-first 🔒</p>
        <div class="hashtags">#ParentInTheLoop &nbsp; #FamilyAI &nbsp; #CuriousKids</div>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function welcomeEmailText(email: string): string {
  return `Welcome to Parent in the Loop! 🌱

Hey there — you're in!

You've joined a community of parents helping their kids develop a joyful, empowered understanding of AI.

Your first weekly AI wisdom email arrives next week. Check your inbox!

WHAT YOU'LL GET EVERY WEEK:
📝 A fresh AI literacy topic — explained simply, no hype
💬 A family conversation starter — words you can use at dinner tonight
🎯 A hands-on activity — playful, under 10 minutes
⏱️ Under 5 minutes to read

THIS WEEK'S FAMILY TIP:
Ask your child: "Can you name 3 things in our home that use AI?"
You might be surprised what they already know! 🏠

Browse our latest articles: https://parentintheloop.com

Questions? Just reply to this email — we read every message.

---
You're receiving this because ${email} subscribed at parentintheloop.com.
Unsubscribe: https://parentintheloop.substack.com
We never sell or share your email. 🔒
`
}
