import { NextResponse } from "next/server"

// Health check — verifies all required env vars are present.
// Hit GET /api/test-email to confirm config before deploying.
export async function GET() {
  const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY
  const siteUrl          = process.env.NEXT_PUBLIC_SITE_URL

  const hasSupabase = !!(supabaseUrl && serviceRoleKey)
  const edgeFnUrl   = supabaseUrl ? `${supabaseUrl}/functions/v1/send-email` : null

  const checks = {
    NEXT_PUBLIC_SUPABASE_URL:    supabaseUrl      ? "✓ set" : "✗ missing",
    SUPABASE_SERVICE_ROLE_KEY:   serviceRoleKey   ? "✓ set" : "✗ missing",
    NEXT_PUBLIC_SITE_URL:        siteUrl          ? "✓ set" : "✗ missing (verification links will be wrong)",
    CRON_SECRET:                 process.env.CRON_SECRET ? "✓ set" : "⚠️  not set (weekly digest unprotected)",
    email_provider:              "Supabase Edge Function (no external API key needed)",
    edge_function_url:           edgeFnUrl ?? "unknown",
    smtp_host:                   "Set SMTP_HOST in Supabase project secrets",
    smtp_user:                   "Set SMTP_USER in Supabase project secrets",
    smtp_pass:                   "Set SMTP_PASS in Supabase project secrets (Gmail App Password)",
  }

  return NextResponse.json({
    status:       hasSupabase ? "✅ Supabase configured" : "❌ Supabase env vars missing",
    architecture: "All emails flow through Supabase Edge Function → your SMTP (Gmail/any free provider)",
    flow: [
      "1. User enters email on homepage",
      "2. POST /api/subscribe → saves to Supabase DB (is_active=false, is_verified=false)",
      "3. Calls Supabase Edge Function send-email(type=verification) → sends verification email via SMTP",
      "4. User clicks link → GET /api/verify-email?token=xxx → sets is_active=true, is_verified=true",
      "5. Calls Supabase Edge Function send-email(type=welcome) → sends welcome email",
      "6. Every Sunday 9AM UTC: Vercel Cron → POST /api/weekly-digest → loops subscribers → Edge Function send-email(type=weekly)",
    ],
    setup_required: [
      "supabase functions deploy send-email",
      "supabase secrets set SMTP_HOST=smtp.gmail.com",
      "supabase secrets set SMTP_PORT=465",
      "supabase secrets set SMTP_TLS=true",
      "supabase secrets set SMTP_USER=your-gmail@gmail.com",
      "supabase secrets set SMTP_PASS=your-gmail-app-password",
      "supabase secrets set EMAIL_FROM=your-gmail@gmail.com",
      "supabase secrets set EMAIL_FROM_NAME='Parent in the Loop'",
      "supabase secrets set EMAIL_REPLY_TO=your-gmail@gmail.com",
    ],
    env_check: checks,
  })
}
