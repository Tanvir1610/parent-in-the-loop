-- ================================================================
-- Parent in the Loop — Complete Database Setup
-- Paste this entire file into your Supabase SQL Editor and run.
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. ARTICLES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id             BIGSERIAL PRIMARY KEY,
  title          TEXT        NOT NULL,
  slug           TEXT        NOT NULL UNIQUE,
  excerpt        TEXT        NOT NULL,
  content        TEXT,
  category       TEXT        NOT NULL
                   CHECK (category IN ('AI Literacy','Parenting','Family Conversations','Safety')),
  image_url      TEXT,
  author         TEXT        NOT NULL DEFAULT 'Parent in the Loop',
  published_date TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  featured       BOOLEAN     NOT NULL DEFAULT false,
  substack_url   TEXT,
  read_time      INT                  DEFAULT 5,
  tags           TEXT[]               DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured  ON articles(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_category  ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug      ON articles(slug);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles_public_read" ON articles;
CREATE POLICY "articles_public_read" ON articles FOR SELECT USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────────
-- 2. SUBSCRIBERS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(254) UNIQUE NOT NULL,
  source         TEXT                DEFAULT 'website',
  subscribed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active      BOOLEAN     NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email       ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed  ON subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_active      ON subscribers(is_active) WHERE is_active = true;

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- No SELECT/UPDATE policy for anon — only service role can read subscribers
-- (service role bypasses RLS automatically)

-- ────────────────────────────────────────────────────────────────
-- 3. CONTACT MESSAGES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id      BIGSERIAL   PRIMARY KEY,
  name    TEXT        NOT NULL,
  email   TEXT        NOT NULL,
  subject TEXT        NOT NULL DEFAULT 'General enquiry',
  message TEXT        NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status  TEXT        NOT NULL DEFAULT 'new'
            CHECK (status IN ('new','read','replied','archived'))
);

CREATE INDEX IF NOT EXISTS idx_contact_sent_at ON contact_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status  ON contact_messages(status);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- Only service role can read contact messages

-- ────────────────────────────────────────────────────────────────
-- 4. QUIZ RESULTS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id         BIGSERIAL   PRIMARY KEY,
  score      INT         NOT NULL,
  total      INT         NOT NULL,
  percentage INT         NOT NULL,
  answers    JSONB,
  session_id TEXT,
  taken_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_taken_at ON quiz_results(taken_at DESC);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
-- Only service role writes; no anon reads (aggregate stats only via service role)

-- ────────────────────────────────────────────────────────────────
-- 5. ARTICLE VIEWS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS article_views (
  slug           TEXT        PRIMARY KEY,
  views          BIGINT      NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "views_public_read" ON article_views;
CREATE POLICY "views_public_read" ON article_views FOR SELECT USING (true);

-- RPC function to atomically increment view count
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO article_views (slug, views, last_viewed_at)
    VALUES (article_slug, 1, NOW())
  ON CONFLICT (slug) DO UPDATE
    SET views          = article_views.views + 1,
        last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────
-- 6. SEED DATA — all 6 brand-aligned articles
-- ────────────────────────────────────────────────────────────────
INSERT INTO articles (title, slug, excerpt, content, category, image_url, published_date, featured, substack_url, read_time, tags)
VALUES
(
  'Teaching Kids About AI Bias Without the Jargon',
  'ai-bias-for-kids',
  'Simple dinner-table conversations about why AI sometimes makes unfair choices — and what your family can do about it.',
  E'When we talk about AI bias, we''re really talking about fairness — and kids already have a strong intuition for that.\n\n**A dinner-table conversation starter:** Ask your child, "If we trained a robot to pick the class leader by only looking at photos of kids who won before, who might it leave out?"\n\n**Why it matters:** AI systems make real decisions — about who sees which job ad, what music gets recommended, even who gets a loan. Teaching kids to ask "Is this fair to everyone?" is one of the most important skills for the AI age.\n\n**Try this tonight:** Show two images of the same scene drawn by different kids. Ask, "If an AI only learned from one of these, what might it get wrong?"\n\n*Sources: MIT Media Lab AI Ethics curriculum (2024); UNICEF Policy Guidance on AI for Children (2021)*',
  'AI Literacy',
  '/diverse-children-learning-together.jpg',
  '2025-01-10',
  true,
  'https://parentintheloop.substack.com/p/ai-bias',
  5,
  ARRAY['bias','fairness','activity','AI literacy']
),
(
  'Privacy & Your Kids: A Gentle Guide to Consent',
  'privacy-kids-consent',
  'How to explain digital footprints, personal data, and the power of saying no to apps — in words a 9-year-old actually understands.',
  E'Every time your child uses an app, they leave a trail — a digital footprint.\n\n**Start with something familiar:** "Remember when you didn''t want to share your diary? Your personal information online is like your diary — you get to decide who sees it."\n\n**What kids should know:**\n- Apps often ask for more data than they need\n- Even "anonymous" data can sometimes identify you\n- They have the right to ask "Why do you need this?"\n\n**A simple rule for families:** Before downloading any new app, ask three questions together: Who made this? What data does it collect? Can we delete our data if we want?\n\n*Sources: COPPA (Children''s Online Privacy Protection Act); AAP Digital Media Policy (2023)*',
  'Safety',
  '/parent-and-child-having-conversation.jpg',
  '2025-01-05',
  true,
  'https://parentintheloop.substack.com/p/privacy-consent',
  6,
  ARRAY['privacy','consent','COPPA','safety']
),
(
  'AI Creativity: Teaching Kids It''s a Tool, Not Magic',
  'ai-creativity-tool',
  'Help your child use AI creatively while keeping their imagination, originality, and critical thinking firmly in the driver''s seat.',
  E'AI image generators and writing tools can feel magical to kids. But magic thinking leads to passive consumption.\n\n**The key shift:** From "AI made this" to "I made this with AI''s help."\n\n**Try the ''first draft'' rule:** Before using any AI tool for a creative project, spend 5 minutes on your own version first. Then use AI to expand, remix, or compare.\n\n**Questions that build critical thinking:**\n- "What would you have done differently without AI?"\n- "How do you know this AI image is accurate?"\n- "What did the AI get wrong about your idea?"\n\n*Sources: MIT Day of AI curriculum (2024); Creative Commons AI & Copyright guidance (2024)*',
  'Family Conversations',
  '/child-drawing-with-creativity.jpg',
  '2024-12-29',
  true,
  'https://parentintheloop.substack.com/p/ai-creativity',
  5,
  ARRAY['creativity','critical thinking','homework','originality']
),
(
  'What Is an Algorithm? Explaining It at the Dinner Table',
  'what-is-an-algorithm',
  'Algorithms power everything from YouTube recommendations to search results. Here''s how to make the concept click for kids ages 7–14.',
  E'An algorithm is just a set of steps to solve a problem. Kids already use algorithms every day — a recipe is an algorithm.\n\n**The recipe analogy:** "Remember the steps we follow to make pancakes? A computer program is just a recipe — but instead of flour and eggs, it uses data and instructions."\n\n**YouTube and the recommendation algorithm:** "Have you ever noticed how YouTube always suggests videos you might like? It''s watching what you watch, for how long, and what you skip — then guessing what comes next."\n\n**A hands-on activity (10 minutes):** Write down the exact steps for making a peanut butter sandwich. Then swap with a sibling and follow their steps literally.\n\n*Sources: CS Unplugged (csunplugged.org); Google''s Teachable Machine educational resources*',
  'AI Literacy',
  '/child-expressing-feelings-to-parent.jpg',
  '2024-12-15',
  true,
  'https://parentintheloop.substack.com/p/algorithm-explained',
  4,
  ARRAY['algorithm','explainer','activity','YouTube']
),
(
  'Screen Time vs. AI Time: Are They the Same Thing?',
  'screen-time-vs-ai-time',
  'Parents often lump AI tools in with general screen time. But there are key differences — and understanding them helps you set smarter limits.',
  E'Most screen time guidelines were written before generative AI existed.\n\n**The active/passive spectrum:**\n- Passive: Asking AI to write your essay for you\n- Reactive: Asking AI follow-up questions to something you read\n- Active: Using AI to brainstorm, then doing the work yourself\n\n**Practical family framework:**\n- Set aside "AI-free" creative time each day\n- When kids use AI, ask them to explain what they did\n- Celebrate the work they did, not just the output\n\n*Sources: American Academy of Pediatrics Digital Media Guidelines (2023); Common Sense Media (2024)*',
  'Parenting',
  '/family-time-without-screens.jpg',
  '2024-12-08',
  false,
  'https://parentintheloop.substack.com/p/screen-time',
  5,
  ARRAY['screen time','AAP','parenting','balance']
),
(
  'When Your Kid Asks ''Does AI Have Feelings?''',
  'does-ai-have-feelings',
  'A question that stumps many parents. Here''s an honest, age-appropriate answer — and why it actually matters for ethical thinking.',
  E'"Does Alexa get lonely?" These questions reveal something important: kids naturally anthropomorphize.\n\n**The honest answer:** Current AI systems do not have feelings, consciousness, or experiences. When ChatGPT says "I feel excited!", it''s producing text that sounds like feelings.\n\n**Why this matters for ethics:** If kids believe AI has feelings, they might feel guilty "being mean" to chatbots instead of to real people.\n\n**A helpful framing:** "AI is like a very sophisticated mirror — it reflects back human language and ideas. The feelings in there originally came from people, not from the AI itself."\n\n*Sources: Stanford HAI — Human-Centered AI; UNICEF AI for Children Policy (2021)*',
  'Family Conversations',
  '/parent-setting-boundaries-with-child.jpg',
  '2024-11-30',
  false,
  'https://parentintheloop.substack.com/p/ai-feelings',
  5,
  ARRAY['anthropomorphism','AI ethics','feelings','philosophy']
)
ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  excerpt        = EXCLUDED.excerpt,
  content        = EXCLUDED.content,
  featured       = EXCLUDED.featured,
  substack_url   = EXCLUDED.substack_url,
  read_time      = EXCLUDED.read_time,
  tags           = EXCLUDED.tags,
  updated_at     = NOW();

