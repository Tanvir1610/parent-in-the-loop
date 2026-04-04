# Setting Up Welcome Emails with Resend

Follow these steps to send welcome emails from ryan@supanovlabs.com or tanvir@supanovlabs.com.

---

## Step 1 — Create a Resend account
Go to https://resend.com and sign up (free tier: 100 emails/day, 3,000/month).

## Step 2 — Verify your domain (supanovlabs.com)
1. In Resend dashboard → **Domains** → **Add Domain**
2. Enter `supanovlabs.com`
3. Resend gives you DNS records (TXT + MX entries) to add
4. Add them in your domain registrar (GoDaddy / Cloudflare / etc.)
5. Click **Verify** — takes a few minutes

## Step 3 — Get your API key
1. Resend dashboard → **API Keys** → **Create API Key**
2. Name it `parent-in-the-loop-production`
3. Copy the key (starts with `re_`)

## Step 4 — Add to Vercel environment variables
Go to **Vercel → Your Project → Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` (your key from Step 3) |
| `EMAIL_FROM` | `Parent in the Loop <ryan@supanovlabs.com>` |

> To use tanvir@ instead, change EMAIL_FROM to: `Parent in the Loop <tanvir@supanovlabs.com>`

## Step 5 — Redeploy
In Vercel → **Deployments** → **Redeploy** (or push any commit).

## Step 6 — Test
Subscribe with a real email at your live site. You should receive the welcome email within seconds.

---

## What the welcome email contains
- Warm welcome message
- What subscribers will get each week (4 bullet points)
- A preview of this week's family AI tip
- CTA button → parentintheloop.com
- Reply-to: tanvir@supanovlabs.com (so replies come to you)
- Branded footer with unsubscribe link

## Email addresses used
- **From:** ryan@supanovlabs.com (or tanvir@supanovlabs.com via EMAIL_FROM env var)
- **Reply-To:** tanvir@supanovlabs.com
