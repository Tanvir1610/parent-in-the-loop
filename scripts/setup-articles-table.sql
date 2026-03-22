-- Create articles table with full content structure
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  author TEXT DEFAULT 'Parent in the Loop',
  published_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  featured BOOLEAN DEFAULT false,
  substack_url TEXT
);

-- Create index for faster lookups
CREATE INDEX idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX idx_articles_featured ON articles(featured);
CREATE INDEX idx_articles_category ON articles(category);

-- Insert sample articles
INSERT INTO articles (title, slug, excerpt, content, category, image_url, published_date, featured, substack_url) VALUES
(
  'Teaching Kids About AI Bias Without the Jargon',
  'ai-bias-for-kids',
  'Simple conversations you can have at dinner about why AI sometimes makes unfair choices, and what that means.',
  'This article explores how to talk to kids about AI bias in a way that makes sense to them...',
  'AI Literacy',
  '/diverse-children-learning-together.jpg',
  '2025-01-10',
  true,
  'https://parentintheloop.substack.com/p/ai-bias'
),
(
  'Privacy & Your Kids: A Gentle Guide to Consent',
  'privacy-kids-consent',
  'Understanding how to teach children about personal data, digital footprints, and saying no to apps.',
  'Teaching children about privacy is one of the most important digital literacy skills...',
  'Safety',
  '/parent-and-child-having-conversation.jpg',
  '2025-01-05',
  true,
  'https://parentintheloop.substack.com/p/privacy-consent'
),
(
  'AI Creativity: Teaching Kids It''s a Tool, Not Magic',
  'ai-creativity-tool',
  'How to help your child use AI responsibly while keeping their own creativity and critical thinking intact.',
  'AI tools like ChatGPT can be amazing creative partners for kids, but they''re not replacements...',
  'Family Conversations',
  '/child-drawing-with-creativity.jpg',
  '2024-12-29',
  true,
  'https://parentintheloop.substack.com/p/ai-creativity'
),
(
  'The Environmental Impact of Training AI: A Conversation Starter',
  'ai-environmental-impact',
  'Did you know that training large AI models uses enormous amounts of water and electricity? Here''s how to explain this to kids.',
  'As AI becomes more integrated into daily life, it''s important for kids to understand the environmental costs...',
  'AI Literacy',
  '/sustainable-learning.jpg',
  '2024-12-22',
  false,
  'https://parentintheloop.substack.com/p/ai-environment'
),
(
  'When Your Child Uses ChatGPT for Homework: A Parent''s Guide',
  'chatgpt-homework-guide',
  'Is AI homework help cheating? Here''s what research says and how to set boundaries that work.',
  'The rise of AI tools has changed how students approach homework. Instead of banning these tools...',
  'Parenting',
  '/homework-guide.jpg',
  '2024-12-15',
  false,
  'https://parentintheloop.substack.com/p/chatgpt-homework'
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read articles (public)
CREATE POLICY "Articles are public" ON articles FOR SELECT USING (true);
