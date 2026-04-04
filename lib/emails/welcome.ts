export function welcomeEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Parent in the Loop 🌱</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito', 'Segoe UI', Arial, sans-serif;
      background-color: #FAF6F0;
      color: #222222;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 580px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    /* Header band */
    .header {
      background: linear-gradient(135deg, #A6B6A1 0%, #7C63B8 100%);
      padding: 40px 40px 32px;
      text-align: center;
    }
    .logo-row {
      margin-bottom: 16px;
    }
    .logo-circle {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      padding: 12px;
      font-size: 36px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 15px;
      color: rgba(255,255,255,0.85);
      line-height: 1.5;
    }
    /* Body */
    .body {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #7C63B8;
      margin-bottom: 16px;
    }
    .body p {
      font-size: 15px;
      color: #3E3E3E;
      line-height: 1.7;
      margin-bottom: 16px;
    }
    /* What to expect box */
    .expect-box {
      background: #FAF6F0;
      border-radius: 14px;
      border-left: 4px solid #F3A78E;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .expect-box h3 {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #B79D84;
      margin-bottom: 12px;
    }
    .expect-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }
    .expect-item:last-child { margin-bottom: 0; }
    .expect-emoji {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .expect-text {
      font-size: 14px;
      color: #3E3E3E;
      line-height: 1.5;
    }
    .expect-text strong { color: #222222; }
    /* CTA button */
    .cta-wrap {
      text-align: center;
      margin: 32px 0 24px;
    }
    .cta-btn {
      display: inline-block;
      background: #F3A78E;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 16px;
      font-weight: 800;
      padding: 14px 36px;
      border-radius: 50px;
      letter-spacing: 0.2px;
    }
    /* First tip preview */
    .tip-box {
      background: linear-gradient(135deg, rgba(185,166,227,0.12) 0%, rgba(244,215,139,0.12) 100%);
      border: 1.5px solid rgba(124,99,184,0.2);
      border-radius: 14px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .tip-box .tip-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #B79D84;
      margin-bottom: 8px;
    }
    .tip-box .tip-text {
      font-size: 15px;
      color: #222222;
      font-weight: 600;
      line-height: 1.6;
    }
    /* Footer */
    .footer {
      padding: 24px 40px;
      background: #F5F0EA;
      border-top: 1px solid #EDE8E1;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #B79D84;
      line-height: 1.6;
    }
    .footer a {
      color: #7C63B8;
      text-decoration: none;
    }
    .hashtags {
      margin-top: 12px;
      font-size: 12px;
      color: #B9A6E3;
    }
    /* Outer footer */
    .outer-footer {
      text-align: center;
      padding: 20px;
    }
    .outer-footer p {
      font-size: 11px;
      color: #B79D84;
    }
    @media (max-width: 600px) {
      .body { padding: 28px 24px; }
      .header { padding: 32px 24px 24px; }
      .footer { padding: 20px 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <!-- Header -->
      <div class="header">
        <div class="logo-row">
          <span class="logo-circle">🌱</span>
        </div>
        <h1>You&rsquo;re in the Loop!</h1>
        <p>Welcome to the Parent in the Loop community</p>
      </div>

      <!-- Body -->
      <div class="body">
        <p class="greeting">Hey there, welcome! 👋</p>

        <p>
          You&rsquo;ve just joined a growing community of parents who are helping their kids
          develop a <strong>joyful, empowered understanding of AI</strong> — through honest
          conversations, fun activities, and evidence-based guidance.
        </p>

        <p>
          We&rsquo;re so glad you&rsquo;re here. Your first weekly AI wisdom email arrives
          <strong>next week</strong> — check your inbox!
        </p>

        <!-- What to expect -->
        <div class="expect-box">
          <h3>What you&rsquo;ll get every week</h3>
          <div class="expect-item">
            <span class="expect-emoji">📝</span>
            <div class="expect-text">
              <strong>A fresh AI literacy topic</strong> — explained simply, without the hype
            </div>
          </div>
          <div class="expect-item">
            <span class="expect-emoji">💬</span>
            <div class="expect-text">
              <strong>A family conversation starter</strong> — words you can use at dinner tonight
            </div>
          </div>
          <div class="expect-item">
            <span class="expect-emoji">🎯</span>
            <div class="expect-text">
              <strong>A hands-on activity</strong> — playful, screen-optional, takes under 10 min
            </div>
          </div>
          <div class="expect-item">
            <span class="expect-emoji">⏱️</span>
            <div class="expect-text">
              <strong>Under 5 minutes to read</strong> — we respect your time
            </div>
          </div>
        </div>

        <!-- First tip preview -->
        <div class="tip-box">
          <div class="tip-label">✨ This week&rsquo;s family tip (preview)</div>
          <div class="tip-text">
            Ask your child: &ldquo;Can you name 3 things in our home that use AI?&rdquo;
            You might be surprised what they already know! 🏠
          </div>
        </div>

        <p>
          While you wait for your first issue, explore our latest articles — we cover everything
          from AI bias and privacy to creativity and screen time.
        </p>

        <!-- CTA -->
        <div class="cta-wrap">
          <a href="https://parentintheloop.com" class="cta-btn">
            Browse Articles &rarr;
          </a>
        </div>

        <p style="font-size:14px; color:#B79D84; text-align:center;">
          Questions? Just reply to this email — we read every message.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>
          You&rsquo;re receiving this because <strong>${email}</strong> subscribed
          at <a href="https://parentintheloop.com">parentintheloop.com</a>.<br />
          <a href="https://parentintheloop.substack.com">Unsubscribe anytime</a> &middot;
          We never sell or share your email &middot; Privacy-first 🔒
        </p>
        <div class="hashtags">
          #ParentInTheLoop &nbsp; #FamilyAI &nbsp; #CuriousKids &nbsp; #AIandParenting
        </div>
      </div>

    </div>

    <!-- Outer footer -->
    <div class="outer-footer">
      <p>Parent in the Loop &middot; Building AI literacy for families 🌱</p>
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
⏱️  Under 5 minutes to read

THIS WEEK'S FAMILY TIP (preview):
Ask your child: "Can you name 3 things in our home that use AI?"
You might be surprised what they already know! 🏠

Browse our latest articles: https://parentintheloop.com

Questions? Just reply to this email — we read every message.

---
You're receiving this because ${email} subscribed at parentintheloop.com.
Unsubscribe: https://parentintheloop.substack.com
We never sell or share your email. Privacy-first. 🔒

#ParentInTheLoop #FamilyAI #CuriousKids
`
}
