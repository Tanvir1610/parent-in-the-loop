# Email System Setup — Zero External API Keys

## How it works

```
User enters email
      ↓
POST /api/subscribe          (Next.js backend)
      ↓
Supabase DB                  (subscriber saved, is_active=false)
      ↓
Supabase Edge Function       (send-email)
      ↓
Your Gmail (free SMTP)       (verification email sent)
      ↓
User clicks link
      ↓
GET /api/verify-email?token= (Next.js backend)
      ↓
Supabase DB                  (is_active=true, is_verified=true)
      ↓
Supabase Edge Function       (send-email — welcome email)
      ↓
Every Sunday 9AM UTC
      ↓
Vercel Cron → /api/weekly-digest → Edge Function → Gmail (weekly email to all verified subscribers)
```

**No Resend. No Mailjet. No SendGrid. Just Gmail + Supabase.**

---

## Step 1 — Supabase Database

Run in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Already in scripts/setup-subscribers-with-verification.sql
-- Just run that file once
```

---

## Step 2 — Gmail App Password (2 minutes)

1. Go to **myaccount.google.com**
2. Security → 2-Step Verification → turn it ON (if not already)
3. Security → **App passwords** → Select app: Mail → Generate
4. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)

That's your `SMTP_PASS`. Gmail allows 500 emails/day free.

---

## Step 3 — Deploy the Edge Function

Install Supabase CLI first if needed:
```bash
npm install -g supabase
supabase login
supabase link --project-ref riybvfwcrqvoryslkokz
```

Deploy the function:
```bash
supabase functions deploy send-email --no-verify-jwt
```

Set the secrets (replace values with your actual Gmail):
```bash
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_TLS=true
supabase secrets set SMTP_USER=your-gmail@gmail.com
supabase secrets set SMTP_PASS="abcd efgh ijkl mnop"
supabase secrets set EMAIL_FROM=your-gmail@gmail.com
supabase secrets set EMAIL_FROM_NAME="Parent in the Loop"
supabase secrets set EMAIL_REPLY_TO=your-gmail@gmail.com
```

---

## Step 4 — Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables, ensure these are set:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://riybvfwcrqvoryslkokz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `NEXT_PUBLIC_SITE_URL` | `https://parent-in-the-loop.vercel.app` |
| `CRON_SECRET` | any random string e.g. `s3cr3t-weekly-xyz` |

**Remove these (no longer needed):**
- `RESEND_API_KEY`
- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`

---

## Step 5 — Verify it works

```bash
# 1. Check config
curl https://parent-in-the-loop.vercel.app/api/test-email

# 2. Test verification email manually
curl -X POST https://parent-in-the-loop.vercel.app/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@gmail.com"}'

# 3. Check your inbox — you should get a verification email within 30 seconds
```

---

## Weekly Digest Schedule

The Vercel Cron in `vercel.json` runs every Sunday at 9:00 AM UTC:
```json
{ "path": "/api/weekly-digest", "schedule": "0 9 * * 0" }
```

To trigger manually (from admin panel or terminal):
```bash
curl -X POST https://parent-in-the-loop.vercel.app/api/weekly-digest \
  -H "Authorization: Bearer your-cron-secret"
```

---

## Email Flow Summary

| Event | Email sent | Trigger |
|-------|-----------|---------|
| User subscribes | Verification email | POST /api/subscribe |
| User clicks verify link | Welcome email | GET /api/verify-email |
| Every Sunday | Weekly digest | Vercel Cron → POST /api/weekly-digest |

---

## Troubleshooting

**Emails not sending?**
1. Check Edge Function logs: Supabase Dashboard → Edge Functions → send-email → Logs
2. Verify secrets are set: `supabase secrets list`
3. Make sure Gmail 2FA is ON and App Password (not regular password) is used

**"Invalid token" on verify link?**
- Token already used (links are single-use by design)
- Token expired — user needs to re-subscribe

**Gmail "less secure app" warning?**
- Use an App Password (Step 2 above) — this is the modern, secure way. Never use your real Gmail password.

**Want to use a different SMTP provider?**
Just change the secrets:
- Outlook: `SMTP_HOST=smtp-mail.outlook.com`, `SMTP_PORT=587`, `SMTP_TLS=false`
- Zoho Mail: `SMTP_HOST=smtp.zoho.com`, `SMTP_PORT=465`, `SMTP_TLS=true`
- Any free SMTP provider works — no code changes needed

