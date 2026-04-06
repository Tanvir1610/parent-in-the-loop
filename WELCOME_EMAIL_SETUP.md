# Welcome Email Setup — Supabase Edge Function

Sends welcome email from tanvir@supanovlabs.com when someone subscribes.
No external services. Everything runs inside Supabase.

---

## What email service does supanovlabs.com use?

Check your domain registrar. Common options:

| Provider | SMTP_HOST | SMTP_PORT |
|---|---|---|
| Google Workspace / Gmail | smtp.gmail.com | 465 |
| Microsoft 365 / Outlook | smtp.office365.com | 587 |
| Zoho Mail | smtp.zoho.com | 465 |
| cPanel hosting | mail.supanovlabs.com | 465 |
| Namecheap Private Email | mail.privateemail.com | 465 |

---

## Step 1 — Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2 — Login and link project

```bash
supabase login
supabase link --project-ref riybvfwcrqvoryslkokz
```

## Step 3 — Deploy the edge function

```bash
supabase functions deploy welcome-email --project-ref riybvfwcrqvoryslkokz
```

## Step 4 — Set secrets in Supabase

Run these (replace values with your actual email credentials):

```bash
supabase secrets set SMTP_HOST=smtp.gmail.com --project-ref riybvfwcrqvoryslkokz
supabase secrets set SMTP_PORT=465 --project-ref riybvfwcrqvoryslkokz
supabase secrets set SMTP_USER=tanvir@supanovlabs.com --project-ref riybvfwcrqvoryslkokz
supabase secrets set SMTP_PASS=your-email-password --project-ref riybvfwcrqvoryslkokz
supabase secrets set EMAIL_FROM_NAME="Parent in the Loop" --project-ref riybvfwcrqvoryslkokz
```

### If using Gmail / Google Workspace:
- SMTP_HOST = smtp.gmail.com
- SMTP_PORT = 465
- SMTP_USER = tanvir@supanovlabs.com
- SMTP_PASS = (create an App Password at myaccount.google.com → Security → App passwords)

### If using cPanel / Namecheap:
- SMTP_HOST = mail.supanovlabs.com
- SMTP_PORT = 465
- SMTP_USER = tanvir@supanovlabs.com
- SMTP_PASS = your normal email password

## Step 5 — Run the webhook SQL

In Supabase → SQL Editor, run the file:
  scripts/setup-email-webhook.sql

## Step 6 — Test it

Subscribe with a real email at your live site.
Check Supabase → Edge Functions → welcome-email → Logs to see if it fired.

---

## Alternatively — set secrets via Supabase Dashboard

Go to: Supabase → Project → Edge Functions → welcome-email → Secrets

Add each secret there without needing the CLI.
