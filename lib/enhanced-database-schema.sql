-- Enhanced SamudraSetu Database Schema
-- Based on the comprehensive ocean hazard monitoring system architecture
-- This extends the existing schema with advanced features

-- ========================================
-- ENHANCED TYPES AND ENUMS
-- ========================================

-- Add new hazard types for comprehensive ocean monitoring
ALTER TYPE hazard_type ADD VALUE IF NOT EXISTS 'cyclone';
ALTER TYPE hazard_type ADD VALUE IF NOT EXISTS 'storm_track';
ALTER TYPE hazard_type ADD VALUE IF NOT EXISTS 'sea_level_rise';
ALTER TYPE hazard_type ADD VALUE IF NOT EXISTS 'coral_bleaching';
ALTER TYPE hazard_type ADD VALUE IF NOT EXISTS 'oil_spill';
ALTER TYPE hazard_type ADD VALUE IF NOT EXISTS 'algal_bloom';

-- Add new platform types for social media monitoring
ALTER TYPE platform_type ADD VALUE IF NOT EXISTS 'telegram';
ALTER TYPE platform_type ADD VALUE IF NOT EXISTS 'whatsapp';
ALTER TYPE platform_type ADD VALUE IF NOT EXISTS 'news_rss';

-- Add new alert types
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'cyclone_warning';
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'tsunami_warning';
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'storm_surge_warning';
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'flood_warning';
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'evacuation_order';

-- ========================================
-- NEW TABLES FOR ENHANCED FEATURES
-- ========================================

-- NLP Processing Results Table
CREATE TABLE IF NOT EXISTS public.nlp_processing_results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source_type text NOT NULL, -- 'social_media', 'report', 'official_feed'
  source_id uuid NOT NULL,
  content text NOT NULL,
  language text DEFAULT 'en',
  sentiment_score numeric, -- -1 to 1
  sentiment_label text, -- 'positive', 'negative', 'neutral'
  hazard_classification jsonb, -- classified hazard types with confidence scores
  location_extracted geography(POINT, 4326),
  keywords_extracted text[],
  confidence_score numeric DEFAULT 0.0,
  processing_model text,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT nlp_processing_results_pkey PRIMARY KEY (id)
);

-- Official Data Sources Configuration
CREATE TABLE IF NOT EXISTS public.official_data_sources (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  agency text NOT NULL, -- 'INCOIS', 'IMD', 'NOAA', 'ESA'
  api_endpoint text,
  api_key_required boolean DEFAULT false,
  data_type text NOT NULL, -- 'tsunami', 'cyclone', 'sea_level', 'weather'
  update_frequency_minutes integer DEFAULT 60,
  is_active boolean DEFAULT true,
  last_successful_fetch timestamp with time zone,
  last_error text,
  configuration jsonb, -- API configuration, headers, etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT official_data_sources_pkey PRIMARY KEY (id)
);

-- Social Media Monitoring Configuration
CREATE TABLE IF NOT EXISTS public.social_media_configs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  platform platform_type NOT NULL,
  api_credentials jsonb NOT NULL, -- encrypted API keys and tokens
  keywords text[] NOT NULL,
  languages text[] DEFAULT ARRAY['en', 'hi', 'ta', 'bn'],
  geographic_filters jsonb, -- bounding boxes, regions
  update_frequency_minutes integer DEFAULT 5,
  is_active boolean DEFAULT true,
  last_successful_fetch timestamp with time zone,
  last_error text,
  rate_limit_remaining integer,
  rate_limit_reset timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT social_media_configs_pkey PRIMARY KEY (id)
);

-- Alert Thresholds and Rules Engine
CREATE TABLE IF NOT EXISTS public.alert_thresholds (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  hazard_type hazard_type NOT NULL,
  conditions jsonb NOT NULL, -- complex conditions for triggering alerts
  actions jsonb NOT NULL, -- what to do when triggered
  severity_threshold severity_level NOT NULL,
  geographic_scope jsonb, -- specific regions or global
  time_window_minutes integer DEFAULT 30,
  cooldown_minutes integer DEFAULT 60,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alert_thresholds_pkey PRIMARY KEY (id),
  CONSTRAINT alert_thresholds_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

-- Multilingual Content and Translations
CREATE TABLE IF NOT EXISTS public.multilingual_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content_type text NOT NULL, -- 'hazard_type', 'severity', 'status', 'ui_text'
  content_key text NOT NULL,
  language_code text NOT NULL,
  translated_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT multilingual_content_pkey PRIMARY KEY (id),
  CONSTRAINT multilingual_content_unique UNIQUE (content_type, content_key, language_code)
);

-- System Analytics and Metrics
CREATE TABLE IF NOT EXISTS public.system_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  dimensions jsonb, -- additional context like region, time period
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_analytics_pkey PRIMARY KEY (id)
);

-- User Activity and Engagement Tracking
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL, -- 'report_created', 'report_viewed', 'map_interaction'
  activity_data jsonb,
  ip_address inet,
  user_agent text,
  location geography(POINT, 4326),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Enhanced Hazard Hotspots with Machine Learning
CREATE TABLE IF NOT EXISTS public.hazard_hotspots_ml (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  center_location geography(POINT, 4326) NOT NULL,
  radius_meters integer NOT NULL,
  report_count integer DEFAULT 0,
  social_media_count integer DEFAULT 0,
  official_data_count integer DEFAULT 0,
  severity_level severity_level NOT NULL,
  confidence_score numeric DEFAULT 0.0,
  ml_model_version text,
  hazard_types hazard_type[],
  risk_factors jsonb, -- environmental factors, historical data
  predicted_escalation boolean DEFAULT false,
  escalation_probability numeric DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hazard_hotspots_ml_pkey PRIMARY KEY (id)
);

-- ========================================
-- ENHANCED INDEXES
-- ========================================

-- NLP Processing indexes
CREATE INDEX IF NOT EXISTS idx_nlp_processing_results_source ON nlp_processing_results(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_nlp_processing_results_sentiment ON nlp_processing_results(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_nlp_processing_results_confidence ON nlp_processing_results(confidence_score);
CREATE INDEX IF NOT EXISTS idx_nlp_processing_results_location ON nlp_processing_results USING GIST (location_extracted);

-- Official data sources indexes
CREATE INDEX IF NOT EXISTS idx_official_data_sources_agency ON official_data_sources(agency);
CREATE INDEX IF NOT EXISTS idx_official_data_sources_data_type ON official_data_sources(data_type);
CREATE INDEX IF NOT EXISTS idx_official_data_sources_active ON official_data_sources(is_active);

-- Social media configs indexes
CREATE INDEX IF NOT EXISTS idx_social_media_configs_platform ON social_media_configs(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_configs_active ON social_media_configs(is_active);

-- Alert thresholds indexes
CREATE INDEX IF NOT EXISTS idx_alert_thresholds_hazard_type ON alert_thresholds(hazard_type);
CREATE INDEX IF NOT EXISTS idx_alert_thresholds_active ON alert_thresholds(is_active);

-- Multilingual content indexes
CREATE INDEX IF NOT EXISTS idx_multilingual_content_type_key ON multilingual_content(content_type, content_key);
CREATE INDEX IF NOT EXISTS idx_multilingual_content_language ON multilingual_content(language_code);

-- System analytics indexes
CREATE INDEX IF NOT EXISTS idx_system_analytics_metric ON system_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_analytics_recorded_at ON system_analytics(recorded_at);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_location ON user_activity_logs USING GIST (location);

-- Enhanced hazard hotspots ML indexes
CREATE INDEX IF NOT EXISTS idx_hazard_hotspots_ml_location ON hazard_hotspots_ml USING GIST (center_location);
CREATE INDEX IF NOT EXISTS idx_hazard_hotspots_ml_confidence ON hazard_hotspots_ml(confidence_score);
CREATE INDEX IF NOT EXISTS idx_hazard_hotspots_ml_escalation ON hazard_hotspots_ml(predicted_escalation);

-- ========================================
-- ENHANCED FUNCTIONS
-- ========================================

-- Function to calculate hazard hotspot density using ML
CREATE OR REPLACE FUNCTION calculate_hazard_hotspots_ml(
  min_confidence numeric DEFAULT 0.7,
  max_radius_km integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  center_location geography,
  radius_meters integer,
  report_count integer,
  social_media_count integer,
  confidence_score numeric,
  hazard_types hazard_type[],
  predicted_escalation boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH clustered_reports AS (
    SELECT 
      ST_ClusterDBSCAN(location, max_radius_km * 1000, 3) OVER() as cluster_id,
      r.*
    FROM ocean_hazard_reports r
    WHERE r.created_at > NOW() - INTERVAL '24 hours'
  ),
  cluster_stats AS (
    SELECT 
      cluster_id,
      ST_Centroid(ST_Collect(location)) as center,
      COUNT(*) as report_count,
      AVG(confidence_score) as avg_confidence,
      array_agg(DISTINCT hazard_type) as hazard_types,
      CASE WHEN COUNT(*) > 10 THEN true ELSE false END as predicted_escalation
    FROM clustered_reports
    WHERE cluster_id IS NOT NULL
    GROUP BY cluster_id
  )
  SELECT 
    uuid_generate_v4() as id,
    cs.center as center_location,
    (max_radius_km * 1000)::integer as radius_meters,
    cs.report_count,
    0::integer as social_media_count, -- TODO: Add social media count
    cs.avg_confidence as confidence_score,
    cs.hazard_types,
    cs.predicted_escalation
  FROM cluster_stats cs
  WHERE cs.avg_confidence >= min_confidence;
END;
$$ LANGUAGE plpgsql;

-- Function to get sentiment analysis summary
CREATE OR REPLACE FUNCTION get_sentiment_summary(
  time_window_hours integer DEFAULT 24,
  geographic_bounds jsonb DEFAULT NULL
)
RETURNS TABLE (
  sentiment_label text,
  count bigint,
  avg_score numeric,
  hazard_types text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nlp.sentiment_label,
    COUNT(*) as count,
    AVG(nlp.sentiment_score) as avg_score,
    array_agg(DISTINCT smf.hazard_keywords) as hazard_types
  FROM nlp_processing_results nlp
  JOIN social_media_feeds smf ON nlp.source_id = smf.id
  WHERE nlp.processed_at > NOW() - (time_window_hours || ' hours')::interval
    AND (geographic_bounds IS NULL OR 
         ST_Within(nlp.location_extracted, 
                   ST_MakeEnvelope(
                     (geographic_bounds->>'min_lng')::numeric,
                     (geographic_bounds->>'min_lat')::numeric,
                     (geographic_bounds->>'max_lng')::numeric,
                     (geographic_bounds->>'max_lat')::numeric,
                     4326
                   )::geography
         )
    )
  GROUP BY nlp.sentiment_label;
END;
$$ LANGUAGE plpgsql;

-- Function to get multilingual content
CREATE OR REPLACE FUNCTION get_multilingual_content(
  content_type_param text,
  language_code_param text DEFAULT 'en'
)
RETURNS TABLE (
  content_key text,
  translated_text text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.content_key,
    mc.translated_text
  FROM multilingual_content mc
  WHERE mc.content_type = content_type_param
    AND mc.language_code = language_code_param;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ENHANCED TRIGGERS
-- ========================================

-- Trigger for updated_at on new tables
CREATE TRIGGER update_official_data_sources_updated_at
  BEFORE UPDATE ON official_data_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_configs_updated_at
  BEFORE UPDATE ON social_media_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_thresholds_updated_at
  BEFORE UPDATE ON alert_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multilingual_content_updated_at
  BEFORE UPDATE ON multilingual_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hazard_hotspots_ml_updated_at
  BEFORE UPDATE ON hazard_hotspots_ml
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ENHANCED RLS POLICIES
-- ========================================

-- Enable RLS on new tables
ALTER TABLE nlp_processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE multilingual_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_hotspots_ml ENABLE ROW LEVEL SECURITY;

-- NLP Processing Results policies
CREATE POLICY "Anyone can view NLP results" ON nlp_processing_results
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage NLP results" ON nlp_processing_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

-- Official Data Sources policies
CREATE POLICY "Anyone can view data sources" ON official_data_sources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage data sources" ON official_data_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- Social Media Configs policies
CREATE POLICY "Admins can manage social media configs" ON social_media_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- Alert Thresholds policies
CREATE POLICY "Analysts can view alert thresholds" ON alert_thresholds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

CREATE POLICY "Admins can manage alert thresholds" ON alert_thresholds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- Multilingual Content policies
CREATE POLICY "Anyone can view multilingual content" ON multilingual_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage multilingual content" ON multilingual_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- System Analytics policies
CREATE POLICY "Analysts can view system analytics" ON system_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

CREATE POLICY "System can insert analytics" ON system_analytics
  FOR INSERT WITH CHECK (true);

-- User Activity Logs policies
CREATE POLICY "Users can view their own activity" ON user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON user_activity_logs
  FOR INSERT WITH CHECK (true);

-- Hazard Hotspots ML policies
CREATE POLICY "Anyone can view ML hotspots" ON hazard_hotspots_ml
  FOR SELECT USING (true);

CREATE POLICY "System can manage ML hotspots" ON hazard_hotspots_ml
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

-- ========================================
-- SAMPLE DATA FOR ENHANCED FEATURES
-- ========================================

-- Insert sample official data sources
INSERT INTO official_data_sources (name, agency, data_type, api_endpoint, is_active) VALUES
('INCOIS Tsunami Early Warning', 'INCOIS', 'tsunami', 'https://www.incois.gov.in/tsunami/tsunami-early-warning', true),
('IMD Cyclone Warning', 'IMD', 'cyclone', 'https://mausam.imd.gov.in/cyclone', true),
('NOAA Sea Level Data', 'NOAA', 'sea_level', 'https://tidesandcurrents.noaa.gov/api/', true),
('ESA Ocean Monitoring', 'ESA', 'ocean_monitoring', 'https://marine.copernicus.eu/api', true)
ON CONFLICT DO NOTHING;

-- Insert sample social media configurations
INSERT INTO social_media_configs (platform, api_credentials, keywords, languages, is_active) VALUES
('twitter', '{}'::jsonb, ARRAY['tsunami', 'cyclone', 'flood', 'storm surge', 'coastal damage'], ARRAY['en', 'hi', 'ta', 'bn'], true),
('youtube', '{}'::jsonb, ARRAY['ocean hazard', 'coastal flooding', 'storm damage'], ARRAY['en', 'hi'], true),
('facebook', '{}'::jsonb, ARRAY['flood', 'storm', 'coastal'], ARRAY['en', 'hi', 'ta'], true)
ON CONFLICT DO NOTHING;

-- Insert sample multilingual content
INSERT INTO multilingual_content (content_type, content_key, language_code, translated_text) VALUES
-- Hazard types in Hindi
('hazard_type', 'tsunami', 'hi', 'सुनामी'),
('hazard_type', 'cyclone', 'hi', 'चक्रवात'),
('hazard_type', 'flooding', 'hi', 'बाढ़'),
('hazard_type', 'storm_surge', 'hi', 'तूफानी लहर'),
-- Severity levels in Hindi
('severity', 'low', 'hi', 'कम'),
('severity', 'medium', 'hi', 'मध्यम'),
('severity', 'high', 'hi', 'उच्च'),
('severity', 'critical', 'hi', 'गंभीर'),
-- Status in Hindi
('status', 'unverified', 'hi', 'असत्यापित'),
('status', 'verified', 'hi', 'सत्यापित'),
('status', 'false_alarm', 'hi', 'गलत अलार्म'),
('status', 'resolved', 'hi', 'हल'),
-- Tamil translations
('hazard_type', 'tsunami', 'ta', 'சுனாமி'),
('hazard_type', 'cyclone', 'ta', 'சூறாவளி'),
('hazard_type', 'flooding', 'ta', 'வெள்ளம்'),
-- Bengali translations
('hazard_type', 'tsunami', 'bn', 'সুনামি'),
('hazard_type', 'cyclone', 'bn', 'ঘূর্ণিঝড়'),
('hazard_type', 'flooding', 'bn', 'বন্যা')
ON CONFLICT (content_type, content_key, language_code) DO NOTHING;

-- Insert sample alert thresholds
INSERT INTO alert_thresholds (name, description, hazard_type, conditions, actions, severity_threshold, created_by) VALUES
('Tsunami Alert Threshold', 'Alert when multiple tsunami reports in short time', 'tsunami', 
 '{"min_reports": 3, "time_window_minutes": 15, "geographic_radius_km": 50}',
 '{"send_notification": true, "target_roles": ["admin", "analyst", "dmf_head"], "notification_type": "urgent"}',
 'high', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('Cyclone Warning Threshold', 'Alert for cyclone-related reports', 'cyclone',
 '{"min_reports": 5, "time_window_minutes": 30, "min_confidence": 0.7}',
 '{"send_notification": true, "target_roles": ["admin", "analyst"], "notification_type": "warning"}',
 'medium', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check new tables exist
SELECT 'Enhanced Tables Check' as test_name, COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'nlp_processing_results', 'official_data_sources', 'social_media_configs',
    'alert_thresholds', 'multilingual_content', 'system_analytics',
    'user_activity_logs', 'hazard_hotspots_ml'
  );

-- Check sample data
SELECT 'Enhanced Data Check' as test_name, 'Official Data Sources' as item, COUNT(*) as count FROM official_data_sources
UNION ALL
SELECT 'Enhanced Data Check' as test_name, 'Social Media Configs' as item, COUNT(*) as count FROM social_media_configs
UNION ALL
SELECT 'Enhanced Data Check' as test_name, 'Multilingual Content' as item, COUNT(*) as count FROM multilingual_content
UNION ALL
SELECT 'Enhanced Data Check' as test_name, 'Alert Thresholds' as item, COUNT(*) as count FROM alert_thresholds;

SELECT 'Enhanced database schema setup completed successfully!' as final_status;
