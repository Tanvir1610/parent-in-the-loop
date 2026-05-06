-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION 001: All missing tables identified from Internship Report
-- Parent in the Loop — Production Backend
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. AI LITERACY LEVELS (Fig 4.1 / Table 4.1 in report) ───────────
CREATE TABLE IF NOT EXISTS public.ai_literacy_levels (
  id          SERIAL       PRIMARY KEY,
  level       INTEGER      NOT NULL UNIQUE CHECK (level BETWEEN 1 AND 5),
  age_group   TEXT         NOT NULL,
  core_concept TEXT        NOT NULL,
  key_skills  TEXT         NOT NULL,
  framework   TEXT         NOT NULL DEFAULT 'MIT Day of AI',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO public.ai_literacy_levels (level, age_group, core_concept, key_skills) VALUES
  (1, 'Ages 5–7',   'AI as a Tool',          'Recognise AI in toys, apps & devices; understand it needs instructions'),
  (2, 'Ages 8–10',  'How AI Learns',         'Supervised learning concept; training data; bias introduction'),
  (3, 'Ages 11–13', 'AI Decision Making',    'Algorithmic logic; fairness; real-world AI examples (maps, search)'),
  (4, 'Ages 14–16', 'Ethics & Society',      'Privacy, surveillance, deepfakes; responsible AI use; policy implications'),
  (5, 'Ages 17+',   'Building & Critiquing', 'Prompt engineering; build simple classifiers; evaluate AI claims critically')
ON CONFLICT (level) DO NOTHING;

COMMENT ON TABLE public.ai_literacy_levels IS 'Spiral AI Literacy Curriculum Model (MIT Day of AI) — Fig 4.1';

-- ── 2. CONTENT DELIVERABLES LOG (Table 6.1 in report) ───────────────
CREATE TABLE IF NOT EXISTS public.content_deliverables (
  id             BIGSERIAL    PRIMARY KEY,
  week_number    INTEGER      NOT NULL CHECK (week_number BETWEEN 1 AND 16),
  week_start     DATE,
  topic          TEXT         NOT NULL,
  ai_concept     TEXT         NOT NULL,
  assets_produced TEXT[]      NOT NULL DEFAULT ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'],
  blog_url       TEXT,
  status         TEXT         NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','in_review','approved','published')),
  novelty_pass   BOOLEAN      DEFAULT false,
  specificity_pass BOOLEAN    DEFAULT false,
  coherence_pass BOOLEAN      DEFAULT false,
  rigor_pass     BOOLEAN      DEFAULT false,
  sources_count  INTEGER      DEFAULT 0,
  mentor_approved BOOLEAN     DEFAULT false,
  approved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed with representative data from Table 6.1
INSERT INTO public.content_deliverables (week_number, topic, ai_concept, assets_produced, status, novelty_pass, specificity_pass, coherence_pass, rigor_pass, sources_count, mentor_approved) VALUES
  (1,  'What is AI? Introduction for Families',     'AI vs human intelligence; sensors',       ARRAY['Blog','Hook','Parent Carousel'],                           'published', true, true, true, true, 3, true),
  (2,  'What is AI? Introduction for Families',     'AI vs human intelligence; sensors',       ARRAY['Blog','Hook','Parent Carousel'],                           'published', true, true, true, true, 3, true),
  (3,  'How Does a Recommendation Work?',           'Pattern recognition, data',               ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (4,  'How Does a Recommendation Work?',           'Pattern recognition, data',               ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (5,  'AI and Fairness: Bias in Algorithms',       'Algorithmic bias, fairness',              ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (6,  'AI and Fairness: Bias in Algorithms',       'Algorithmic bias, fairness',              ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (7,  'Your Data and AI Privacy',                  'Data privacy, COPPA, consent',            ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (8,  'Your Data and AI Privacy',                  'Data privacy, COPPA, consent',            ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (9,  'AI and the Environment',                    'Energy and water use by AI',              ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 3, true),
  (10, 'AI and the Environment',                    'Energy and water use by AI',              ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 3, true),
  (11, 'Chatbots and AI Language Models',           'NLP, generative AI basics',               ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (12, 'Chatbots and AI Language Models',           'NLP, generative AI basics',               ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (13, 'Creative AI: Art, Music, and Stories',      'Generative AI, creativity',               ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 3, true),
  (14, 'Creative AI: Art, Music, and Stories',      'Generative AI, creativity',               ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 3, true),
  (15, 'AI Ethics and Future Choices',              'Responsible AI, agency',                  ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true),
  (16, 'AI Ethics and Future Choices',              'Responsible AI, agency',                  ARRAY['Blog','Hook','Parent Carousel','Kid Carousel','Video Script'], 'published', true, true, true, true, 4, true)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_content_deliverables_week ON public.content_deliverables(week_number);
CREATE INDEX IF NOT EXISTS idx_content_deliverables_status ON public.content_deliverables(status);

ALTER TABLE public.content_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_content_deliverables" ON public.content_deliverables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "service_manage_content_deliverables" ON public.content_deliverables FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.content_deliverables IS 'Weekly Content Deliverables Log — Table 6.1 in Internship Report';

-- ── 3. CONTENT QUALITY CHECKS (Table 7.1 in report) ─────────────────
CREATE TABLE IF NOT EXISTS public.content_qa_checks (
  id              BIGSERIAL    PRIMARY KEY,
  deliverable_id  BIGINT       REFERENCES public.content_deliverables(id) ON DELETE CASCADE,
  week_number     INTEGER      NOT NULL,
  asset_type      TEXT         NOT NULL CHECK (asset_type IN ('blog','hook_image','parent_carousel','kid_carousel','video_script')),
  -- Quality checklist items from Appendix 3
  fresh_angle         BOOLEAN  DEFAULT false,  -- TC-01: at least one fresh angle
  sources_cited       BOOLEAN  DEFAULT false,  -- TC-02: 2–4 credible sources cited
  safe_zones_clear    BOOLEAN  DEFAULT false,  -- TC-03: top 15% / bottom 25% clear (images)
  wcag_contrast       BOOLEAN  DEFAULT false,  -- TC-04: WCAG AA 4.5:1 contrast
  script_under_60s    BOOLEAN  DEFAULT false,  -- TC-05: video ≤60 seconds
  no_data_solicitation BOOLEAN DEFAULT false,  -- TC-06: no personal data from minors
  file_naming_correct BOOLEAN  DEFAULT false,  -- TC-07: YYYY-MM-DD format, no 'final'
  kid_carousel_text_free BOOLEAN DEFAULT false,-- TC-03 kid: zero baked-in text
  overall_pass        BOOLEAN  GENERATED ALWAYS AS (
    fresh_angle AND sources_cited AND wcag_contrast AND no_data_solicitation AND file_naming_correct
  ) STORED,
  reviewer            TEXT,
  reviewed_at         TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.content_qa_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_qa" ON public.content_qa_checks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "service_manage_qa" ON public.content_qa_checks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 4. UNSUBSCRIBE TRACKING (TC-16 in report) ───────────────────────
-- Column already added to subscribers in previous migration.
-- Add unsubscribed_at column if not exists.
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribe_reason TEXT;

-- ── 5. AGE GROUP FILTER on articles (report section 5.3) ────────────
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS age_group     TEXT CHECK (age_group IN ('5-7','8-10','11-13','14-16','17+','all')),
  ADD COLUMN IF NOT EXISTS literacy_level INTEGER REFERENCES public.ai_literacy_levels(level),
  ADD COLUMN IF NOT EXISTS asset_type    TEXT DEFAULT 'blog'
                           CHECK (asset_type IN ('blog','hook_image','parent_carousel','kid_carousel','video_script','all')),
  ADD COLUMN IF NOT EXISTS week_number   INTEGER,
  ADD COLUMN IF NOT EXISTS sources_count INTEGER DEFAULT 0;

-- Update existing articles to have 'all' age group
UPDATE public.articles SET age_group = 'all' WHERE age_group IS NULL;

CREATE INDEX IF NOT EXISTS idx_articles_age_group ON public.articles(age_group);
CREATE INDEX IF NOT EXISTS idx_articles_literacy_level ON public.articles(literacy_level);

-- ── 6. ANALYTICS VIEW (report section 8.5.2 — data dashboard) ───────
CREATE OR REPLACE VIEW public.platform_analytics AS
SELECT
  (SELECT COUNT(*) FROM public.subscribers WHERE is_active = true AND is_verified = true)  AS verified_subscribers,
  (SELECT COUNT(*) FROM public.subscribers WHERE is_active = false OR is_verified = false) AS pending_subscribers,
  (SELECT COUNT(*) FROM public.subscribers WHERE unsubscribed_at IS NOT NULL)              AS unsubscribed,
  (SELECT COUNT(*) FROM public.articles)                                                   AS total_articles,
  (SELECT COUNT(*) FROM public.articles WHERE published_date <= NOW())                     AS published_articles,
  (SELECT COALESCE(SUM(view_count),0) FROM public.articles)                                AS total_article_views,
  (SELECT COUNT(*) FROM public.email_queue WHERE status = 'sent')                         AS emails_sent,
  (SELECT COUNT(*) FROM public.email_queue WHERE status = 'failed')                       AS emails_failed,
  (SELECT COUNT(*) FROM public.email_queue WHERE email_type = 'verification')             AS verification_emails,
  (SELECT COUNT(*) FROM public.email_queue WHERE email_type = 'welcome')                  AS welcome_emails,
  (SELECT COUNT(*) FROM public.email_queue WHERE email_type = 'weekly')                   AS weekly_emails,
  (SELECT COUNT(*) FROM public.content_deliverables WHERE mentor_approved = true)         AS approved_deliverables,
  (SELECT COUNT(*) FROM public.content_deliverables)                                      AS total_deliverables,
  (SELECT COUNT(*) FROM public.quiz_results)                                              AS total_quiz_attempts,
  NOW() AS generated_at;

COMMENT ON VIEW public.platform_analytics IS 'Real-time platform stats for admin dashboard — report section 8.5.2';

-- ── 7. WEEKLY STATS VIEW (for chart data) ────────────────────────────
CREATE OR REPLACE VIEW public.weekly_subscriber_growth AS
SELECT
  DATE_TRUNC('week', subscribed_at) AS week,
  COUNT(*) AS new_subscribers,
  COUNT(*) FILTER (WHERE is_verified = true) AS verified_count
FROM public.subscribers
GROUP BY 1
ORDER BY 1 DESC;

-- ── 8. TRIGGER: auto-update updated_at on content_deliverables ───────
CREATE OR REPLACE FUNCTION public.update_content_deliverables_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_content_deliverables_updated ON public.content_deliverables;
CREATE TRIGGER trg_content_deliverables_updated
  BEFORE UPDATE ON public.content_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_content_deliverables_timestamp();
