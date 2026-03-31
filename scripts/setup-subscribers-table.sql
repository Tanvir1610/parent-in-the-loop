-- ================================================================
-- Subscribers table — run this if you need just this table
-- (The full setup-database.sql already includes this)
-- ================================================================

CREATE TABLE IF NOT EXISTS subscribers (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(254) UNIQUE NOT NULL,
  source          TEXT                     DEFAULT 'website',
  subscribed_at   TIMESTAMPTZ  NOT NULL    DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active       BOOLEAN      NOT NULL    DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email      ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed ON subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_active     ON subscribers(is_active) WHERE is_active = true;

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS for all writes; no anon SELECT policy intentionally.
