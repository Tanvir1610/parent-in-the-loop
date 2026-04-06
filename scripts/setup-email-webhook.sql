-- ================================================================
-- Set up DB Webhook to trigger welcome email on every new subscriber
-- Run this in Supabase SQL Editor AFTER deploying the edge function
-- ================================================================

-- Enable the pg_net extension (needed for HTTP webhooks)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing webhook if re-running
DROP TRIGGER IF EXISTS on_subscriber_insert ON subscribers;
DROP FUNCTION IF EXISTS notify_welcome_email();

-- Function that fires the edge function via HTTP POST
CREATE OR REPLACE FUNCTION notify_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url TEXT;
  service_key TEXT;
BEGIN
  -- These are auto-available in Supabase
  project_url := current_setting('app.settings.project_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  -- Call the edge function with the new subscriber record
  PERFORM net.http_post(
    url    := project_url || '/functions/v1/welcome-email',
    body   := jsonb_build_object(
      'type',   'INSERT',
      'table',  'subscribers',
      'record', row_to_json(NEW)
    )::text,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || service_key
    )
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to subscribers table
CREATE TRIGGER on_subscriber_insert
  AFTER INSERT ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION notify_welcome_email();
