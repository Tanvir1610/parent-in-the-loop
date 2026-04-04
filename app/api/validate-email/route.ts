import { NextResponse } from "next/server"
import { promises as dns } from "dns"

// Large list of known disposable / throwaway email domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","guerrillamail.net","guerrillamail.org",
  "guerrillamail.biz","guerrillamail.de","guerrillamail.info","trashmail.com",
  "trashmail.me","trashmail.net","trashmail.at","trashmail.io","trashmail.org",
  "tempmail.com","temp-mail.org","temp-mail.io","throwam.com","throwam.net",
  "yopmail.com","yopmail.fr","yopmail.net","cool.fr.nf","jetable.fr.nf",
  "nospam.ze.tc","nomail.xl.cx","mega.zik.dj","speed.1s.fr","courriel.fr.nf",
  "moncourrier.fr.nf","monemail.fr.nf","monmail.fr.nf","dispostable.com",
  "fakeinbox.com","fakeinbox.net","spam4.me","sharklasers.com","guerrillamailblock.com",
  "grr.la","guerrillamail.info","spam.la","maildrop.cc","discard.email",
  "mailnull.com","spamgourmet.com","spamgourmet.net","spamgourmet.org",
  "trashmail.fr","trashmail.de","trashmail.me","trashmail.xyz","trashmail.live",
  "getairmail.com","filzmail.com","throwam.com","spamherelots.com",
  "spamhereplease.com","mailnull.com","mailseal.de","mailscrap.com",
  "mailslite.com","mailsiphon.com","mailslapping.com","mailslapping.net",
  "10minutemail.com","10minutemail.net","10minutemail.org","10minutemail.co.uk",
  "20minutemail.com","30minutemail.com","1-hour-mail.com","24hourmail.com",
  "spambox.us","spam.su","mailbox80.biz","mail-temporaire.fr",
  "mozilla.mailbolt.com","junk.burundibujumbura.com",
  "binkmail.com","bobmail.info","dacoolest.com","dandikmail.com",
  "dispomail.eu","dispostable.com","dm.w3internet.co.uk","domozmail.com",
  "donemail.ru","dontreg.com","dontsendmespam.de","drdrb.net",
  "dump-email.info","dumpandfuck.com","dumpmail.de","dumpyemail.com",
])

// RFC-5321 email regex — identical to client and subscribe route
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = (searchParams.get("email") ?? "").trim().toLowerCase()

  // 1. Format check
  if (!raw) {
    return NextResponse.json({ valid: false, reason: "Email is required." })
  }
  if (!EMAIL_RE.test(raw)) {
    return NextResponse.json({ valid: false, reason: "That doesn't look like a valid email address." })
  }

  const domain = raw.split("@")[1]

  // 2. Disposable domain check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({
      valid: false,
      reason: "Disposable email addresses aren't accepted. Please use your real email.",
    })
  }

  // 3. MX record check — confirms the domain actually receives email
  try {
    const records = await dns.resolveMx(domain)
    if (!records || records.length === 0) {
      return NextResponse.json({
        valid: false,
        reason: `The domain "${domain}" doesn't appear to accept email. Please check your address.`,
      })
    }
    // Domain has valid MX records — email address is deliverable
    return NextResponse.json({ valid: true, domain, mx: records[0].exchange })
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "ESERVFAIL") {
      return NextResponse.json({
        valid: false,
        reason: `The domain "${domain}" doesn't exist. Please check your email address.`,
      })
    }
    // DNS lookup failed for network reasons — don't block the user
    console.warn("[validate-email] DNS lookup failed for", domain, code)
    return NextResponse.json({ valid: true, domain, mx: null, warning: "DNS check skipped" })
  }
}
