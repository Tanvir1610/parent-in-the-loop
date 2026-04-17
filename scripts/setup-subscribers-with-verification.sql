-- ================================================================
-- SUBSCRIBERS TABLE — Full schema with email verification
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Drop and recreate with all columns (safe — uses IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS subscribers (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(254) UNIQUE NOT NULL,
  source              TEXT                     DEFAULT 'website',
  subscribed_at       TIMESTAMPTZ  NOT NULL    DEFAULT NOW(),
  unsubscribed_at     TIMESTAMPTZ,
  is_active           BOOLEAN      NOT NULL    DEFAULT false,
  is_verified         BOOLEAN      NOT NULL    DEFAULT false,
  verified_at         TIMESTAMPTZ,
  verification_token  UUID                     DEFAULT gen_random_uuid(),
  last_email_sent_at  TIMESTAMPTZ,
  email_count         INTEGER      NOT NULL    DEFAULT 0
);

-- Add missing columns if table already exists (safe to run multiple times)
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS is_verified        BOOLEAN      NOT NULL DEFAULT false;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS verified_at        TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS verification_token UUID         DEFAULT gen_random_uuid();
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS email_count        INTEGER      NOT NULL DEFAULT 0;

-- Backfill verification tokens for any rows that don't have one
UPDATE subscribers SET verification_token = gen_random_uuid() WHERE verification_token IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email             ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed        ON subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_active            ON subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subscribers_verification_token ON subscribers(verification_token);

-- Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Service role key bypasses RLS for all server-side writes — no anon SELECT needed

