-- ============================================================
-- Parent in the Loop — Articles Table Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
  id           BIGSERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  excerpt      TEXT NOT NULL,
  content      TEXT,
  category     TEXT NOT NULL CHECK (category IN ('AI Literacy','Parenting','Family Conversations','Safety')),
  image_url    TEXT,
  author       TEXT DEFAULT 'Parent in the Loop',
  published_date TIMESTAMP NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  featured     BOOLEAN DEFAULT false,
  substack_url TEXT,
  read_time    INT DEFAULT 5,
  tags         TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Seed with brand-aligned articles
INSERT INTO articles (title, slug, excerpt, content, category, image_url, published_date, featured, substack_url, read_time, tags) VALUES
(
  'Teaching Kids About AI Bias Without the Jargon',
  'ai-bias-for-kids',
  'Simple dinner-table conversations about why AI sometimes makes unfair choices — and what your family can do about it.',
  'Full article content here...',
  'AI Literacy',
  '/diverse-children-learning-together.jpg',
  '2025-01-10',
  true,
  'https://parentintheloop.substack.com/p/ai-bias',
  5,
  ARRAY['bias','fairness','activity']
),
(
  'Privacy & Your Kids: A Gentle Guide to Consent',
  'privacy-kids-consent',
  'How to explain digital footprints, personal data, and the power of saying no to apps.',
  'Full article content here...',
  'Safety',
  '/parent-and-child-having-conversation.jpg',
  '2025-01-05',
  true,
  'https://parentintheloop.substack.com/p/privacy-consent',
  6,
  ARRAY['privacy','consent','COPPA']
),
(
  'AI Creativity: Teaching Kids It''s a Tool, Not Magic',
  'ai-creativity-tool',
  'Help your child use AI creatively while keeping their own creativity and critical thinking intact.',
  'Full article content here...',
  'Family Conversations',
  '/child-drawing-with-creativity.jpg',
  '2024-12-29',
  true,
  'https://parentintheloop.substack.com/p/ai-creativity',
  5,
  ARRAY['creativity','critical thinking','homework']
)
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY IF NOT EXISTS "Articles are public" ON articles
  FOR SELECT USING (true);
