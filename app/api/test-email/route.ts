import { NextResponse } from "next/server"

export async function GET() {
  const checks = {
    MAILJET_API_KEY:        process.env.MAILJET_API_KEY        ? "✓ set" : "✗ missing",
    MAILJET_SECRET_KEY:     process.env.MAILJET_SECRET_KEY     ? "✓ set" : "✗ missing",
    SMTP2GO_API_KEY:        process.env.SMTP2GO_API_KEY        ? "✓ set" : "✗ missing",
    POSTMARK_SERVER_TOKEN:  process.env.POSTMARK_SERVER_TOKEN  ? "✓ set" : "✗ missing",
    EMAIL_FROM:             process.env.EMAIL_FROM             || "✗ missing (will use tanvir@supanovlabs.com)",
    EMAIL_FROM_NAME:        process.env.EMAIL_FROM_NAME        || "✗ missing",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ set" : "✗ missing",
  }

  const hasAnyEmailProvider = !!(
    (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) ||
    process.env.SMTP2GO_API_KEY ||
    process.env.POSTMARK_SERVER_TOKEN
  )

  return NextResponse.json({
    status: hasAnyEmailProvider ? "✅ Email provider configured" : "❌ NO email provider — emails will NOT send",
    instructions: hasAnyEmailProvider
      ? "At least one email provider is configured. Emails should send on subscribe."
      : "Add MAILJET_API_KEY + MAILJET_SECRET_KEY to Vercel env vars (free at mailjet.com), then redeploy.",
    env_check: checks,
  })
}
