# Email System Setup Guide

Parent in the Loop uses **Resend** for all transactional emails.
Free tier: 3,000 emails/month — more than enough to start.

---

## Step 1 — Get your Resend API Key (5 minutes)

1. Go to **[resend.com](https://resend.com)** and create a free account
2. Click **API Keys** → **Create API Key**
3. Copy the key (starts with `re_`)

---

## Step 2 — Add Vercel Environment Variables

Go to **Vercel → Project → Settings → Environment Variables** and add:

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | `re_your_key_here` |
| `NEXT_PUBLIC_SITE_URL` | `https://parent-in-the-loop.vercel.app` |
| `EMAIL_FROM` | `newsletter@yourdomain.com` (or `onboarding@resend.dev` for testing) |
| `EMAIL_REPLY_TO` | `tanvir@supanovlabs.com` |
| `CRON_SECRET` | any random string, e.g. `abc123xyz` |

---

## Step 3 — Add sender domain to Resend (optional but recommended)

Without a domain, emails come from `onboarding@resend.dev`.
To use your own address:
1. Go to **Resend → Domains → Add Domain**
2. Add `parentintheloop.com`
3. Add the DNS records Resend shows you (takes ~24 hours)
4. Update `EMAIL_FROM` to `newsletter@parentintheloop.com`

---

## Step 4 — Run the database migration in Supabase

Go to **Supabase → SQL Editor** and run:
```
scripts/setup-subscribers-with-verification.sql
```

This adds `is_verified`, `verified_at`, and `verification_token` columns.
Safe to run on an existing table — uses `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`.

---

## Step 5 — Redeploy on Vercel

After adding the env vars, click **Deployments → Redeploy**.

---

## How the email flow works

```
User enters email on homepage
        ↓
POST /api/subscribe
        ↓
New row in subscribers table (is_verified=false, is_active=false)
        ↓
Resend sends VERIFICATION EMAIL with unique token link
        ↓
User clicks link in email
        ↓
GET /api/verify-email?token=xxx
        ↓
subscribers row updated: is_verified=true, is_active=true
        ↓
Resend sends WELCOME EMAIL
        ↓
User redirected to homepage with "Email confirmed! ✅" toast
        ↓
Every Sunday 9am UTC: Vercel Cron calls POST /api/weekly-digest
        ↓
Resend sends WEEKLY DIGEST to all is_active=true, is_verified=true subscribers
```

---

## Testing email locally

1. Use `onboarding@resend.dev` as `EMAIL_FROM` (Resend's test domain)
2. Set `RESEND_API_KEY` in your `.env.local`
3. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
4. Subscribe using your own email
5. Check your inbox for verification email

---

## Manual weekly digest trigger

Call the endpoint manually to test:
```bash
curl -X POST https://parent-in-the-loop.vercel.app/api/weekly-digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or trigger from the Admin panel (added to quick actions).
