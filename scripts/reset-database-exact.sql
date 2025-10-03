-- SamudraSetu Database Reset Script - Exact Match
-- This script exactly matches your current Supabase database structure
-- Run this in Supabase SQL Editor to reset your database

-- ========================================
-- STEP 1: Clean Up Existing Data
-- ========================================

-- Drop all tables in correct order (CASCADE handles dependencies)
DROP TABLE IF EXISTS public.alert_notifications CASCADE;
DROP TABLE IF EXISTS public.alert_rules CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.hazard_hotspots CASCADE;
DROP TABLE IF EXISTS public.notification_templates CASCADE;
DROP TABLE IF EXISTS public.ocean_hazard_reports CASCADE;
DROP TABLE IF EXISTS public.official_data_feeds CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.report_comments CASCADE;
DROP TABLE IF EXISTS public.social_media_feeds CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_hazard_hotspots() CASCADE;
DROP FUNCTION IF EXISTS public.get_nearby_reports(double precision, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.get_nearby_reports(decimal, decimal, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_users_within_radius(decimal, decimal, integer) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_analyst() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.check_admin_status() CASCADE;

-- Drop all triggers (only if tables exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

DO $$
BEGIN
    -- Drop triggers only if the tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ocean_hazard_reports' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_ocean_hazard_reports_updated_at ON public.ocean_hazard_reports CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hazard_hotspots' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_hazard_hotspots_updated_at ON public.hazard_hotspots CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alert_rules' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON public.alert_rules CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_templates' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON public.notification_templates CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments CASCADE;
    END IF;
END $$;

-- Clean up storage buckets
DELETE FROM storage.buckets WHERE id IN ('avatars', 'hazard-reports', 'social-media');

-- Clean up storage policies (drop them properly)
DO $$
DECLARE
    policy_name text;
BEGIN
    -- Drop storage policies if they exist
    FOR policy_name IN (
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname IN (
            'Avatar images are publicly accessible',
            'Anyone can upload avatar',
            'Users can update own avatar',
            'Hazard report images are publicly accessible',
            'Authenticated users can upload hazard report images',
            'Anyone can view avatars',
            'Authenticated users can upload avatars',
            'Users can update their own avatars',
            'Users can delete their own avatars',
            'Anyone can view hazard reports',
            'Authenticated users can upload hazard reports',
            'Anyone can view social media',
            'System can upload social media'
        )
    )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON storage.objects;';
    END LOOP;
END $$;

-- ========================================
-- STEP 2: Create Custom Types (if they don't exist)
-- ========================================

-- Create custom types (if they don't exist)
DO $$ 
BEGIN
    -- Create user_role type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('citizen', 'analyst', 'admin', 'dmf_head');
    END IF;
    
    -- Create hazard_type type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hazard_type') THEN
        CREATE TYPE hazard_type AS ENUM (
            'tsunami', 'storm_surge', 'flooding', 'erosion', 
            'unusual_tides', 'coastal_damage', 'marine_pollution', 
            'weather_anomaly', 'other'
        );
    END IF;
    
    -- Create severity_level type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_level') THEN
        CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    
    -- Create report_status type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('unverified', 'verified', 'false_alarm', 'resolved');
    END IF;
    
    -- Create alert_type type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
        CREATE TYPE alert_type AS ENUM ('tsunami', 'storm_surge', 'flooding', 'general');
    END IF;
    
    -- Create platform_type type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_type') THEN
        CREATE TYPE platform_type AS ENUM ('twitter', 'youtube', 'facebook', 'instagram');
    END IF;
END $$;

-- ========================================
-- STEP 3: Create Tables (Exact Match)
-- ========================================

-- Create profiles table (exact match)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text,
  role user_role DEFAULT 'citizen',
  department text,
  position text,
  language_preference text DEFAULT 'en',
  location geography(POINT, 4326),
  address text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Create alert_notifications table (exact match)
CREATE TABLE public.alert_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  message text NOT NULL,
  alert_type alert_type NOT NULL,
  severity severity_level NOT NULL,
  target_roles user_role[] NOT NULL,
  target_locations jsonb,
  sent_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alert_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT alert_notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

-- Create alert_rules table (exact match)
CREATE TABLE public.alert_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  enabled boolean DEFAULT true,
  priority severity_level DEFAULT 'medium',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alert_rules_pkey PRIMARY KEY (id)
);

-- Create departments table (exact match)
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  contact_phone text,
  contact_email text,
  jurisdiction geography(POLYGON, 4326),
  responsibilities text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);

-- Create hazard_hotspots table (exact match)
CREATE TABLE public.hazard_hotspots (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  center_location geography(POINT, 4326) NOT NULL,
  radius_meters integer NOT NULL,
  report_count integer DEFAULT 0,
  severity_level severity_level NOT NULL,
  confidence_score numeric DEFAULT 0.0,
  hazard_types hazard_type[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hazard_hotspots_pkey PRIMARY KEY (id)
);

-- Create notification_templates table (exact match)
CREATE TABLE public.notification_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL,
  subject text,
  message text NOT NULL,
  language text NOT NULL,
  variables text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_templates_pkey PRIMARY KEY (id)
);

-- Create ocean_hazard_reports table (exact match)
CREATE TABLE public.ocean_hazard_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  hazard_type hazard_type NOT NULL,
  severity severity_level NOT NULL,
  status report_status DEFAULT 'unverified',
  location geography(POINT, 4326) NOT NULL,
  address text,
  media_urls text[],
  confidence_score numeric DEFAULT 0.5,
  social_media_indicators jsonb,
  verified_by uuid,
  verified_at timestamp with time zone,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ocean_hazard_reports_pkey PRIMARY KEY (id),
  CONSTRAINT ocean_hazard_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT ocean_hazard_reports_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id)
);

-- Create official_data_feeds table (exact match)
CREATE TABLE public.official_data_feeds (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source text NOT NULL,
  feed_type text NOT NULL,
  data jsonb NOT NULL,
  location geography(POINT, 4326),
  valid_from timestamp with time zone NOT NULL,
  valid_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT official_data_feeds_pkey PRIMARY KEY (id)
);

-- Create report_comments table (exact match)
CREATE TABLE public.report_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  report_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT report_comments_pkey PRIMARY KEY (id),
  CONSTRAINT report_comments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.ocean_hazard_reports(id),
  CONSTRAINT report_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Create social_media_feeds table (exact match)
CREATE TABLE public.social_media_feeds (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  platform platform_type NOT NULL,
  post_id text NOT NULL,
  content text NOT NULL,
  author text,
  location geography(POINT, 4326),
  sentiment_score numeric,
  hazard_keywords text[],
  relevance_score numeric DEFAULT 0.0,
  language text DEFAULT 'en',
  verified boolean DEFAULT false,
  verification_notes text,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT social_media_feeds_pkey PRIMARY KEY (id),
  CONSTRAINT social_media_feeds_platform_post_id_unique UNIQUE (platform, post_id)
);

-- ========================================
-- STEP 4: Create Indexes
-- ========================================

-- Spatial indexes
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);
CREATE INDEX idx_ocean_hazard_reports_location ON ocean_hazard_reports USING GIST (location);
CREATE INDEX idx_social_media_feeds_location ON social_media_feeds USING GIST (location);
CREATE INDEX idx_hazard_hotspots_location ON hazard_hotspots USING GIST (center_location);
CREATE INDEX idx_official_data_feeds_location ON official_data_feeds USING GIST (location);

-- Other indexes
CREATE INDEX idx_ocean_hazard_reports_user_id ON ocean_hazard_reports(user_id);
CREATE INDEX idx_ocean_hazard_reports_hazard_type ON ocean_hazard_reports(hazard_type);
CREATE INDEX idx_ocean_hazard_reports_severity ON ocean_hazard_reports(severity);
CREATE INDEX idx_ocean_hazard_reports_status ON ocean_hazard_reports(status);
CREATE INDEX idx_ocean_hazard_reports_created_at ON ocean_hazard_reports(created_at);
CREATE INDEX idx_social_media_feeds_platform ON social_media_feeds(platform);
CREATE INDEX idx_social_media_feeds_relevance_score ON social_media_feeds(relevance_score);
CREATE INDEX idx_social_media_feeds_created_at ON social_media_feeds(created_at);
CREATE INDEX idx_report_comments_report_id ON report_comments(report_id);

-- ========================================
-- STEP 5: Create Functions
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'citizen'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby reports
CREATE OR REPLACE FUNCTION get_nearby_reports(
  user_lat decimal,
  user_lon decimal,
  radius_km integer
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  hazard_type hazard_type,
  severity severity_level,
  status report_status,
  distance_km decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.hazard_type,
    r.severity,
    r.status,
    ST_Distance(
      r.location,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)
    ) / 1000 as distance_km
  FROM ocean_hazard_reports r
  WHERE ST_DWithin(
    r.location,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326),
    radius_km * 1000
  )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 6: Create Triggers
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocean_hazard_reports_updated_at
  BEFORE UPDATE ON ocean_hazard_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hazard_hotspots_updated_at
  BEFORE UPDATE ON hazard_hotspots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- STEP 7: Enable Row Level Security
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocean_hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_data_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 8: Create RLS Policies
-- ========================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

-- Ocean hazard reports policies
CREATE POLICY "Anyone can view public reports" ON ocean_hazard_reports
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own reports" ON ocean_hazard_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON ocean_hazard_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON ocean_hazard_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON ocean_hazard_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

CREATE POLICY "Admins can update all reports" ON ocean_hazard_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

-- Social media feeds policies
CREATE POLICY "Anyone can view social media feeds" ON social_media_feeds
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert social media feeds" ON social_media_feeds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

-- Hazard hotspots policies
CREATE POLICY "Anyone can view hazard hotspots" ON hazard_hotspots
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage hazard hotspots" ON hazard_hotspots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

-- Official data feeds policies
CREATE POLICY "Anyone can view official data feeds" ON official_data_feeds
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage official data feeds" ON official_data_feeds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'analyst', 'dmf_head')
    )
  );

-- Alert notifications policies
CREATE POLICY "Users can view relevant alerts" ON alert_notifications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = ANY(target_roles)
    )
  );

CREATE POLICY "Admins can manage alerts" ON alert_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- Report comments policies
CREATE POLICY "Anyone can view comments" ON report_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON report_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON report_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Departments policies
CREATE POLICY "Anyone can view departments" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- Alert rules policies
CREATE POLICY "Admins can manage alert rules" ON alert_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- Notification templates policies
CREATE POLICY "Admins can manage templates" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'dmf_head')
    )
  );

-- ========================================
-- STEP 9: Create Storage Buckets
-- ========================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('hazard-reports', 'hazard-reports', true, 10485760, ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']),
  ('social-media', 'social-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view hazard reports" ON storage.objects
FOR SELECT USING (bucket_id = 'hazard-reports');

CREATE POLICY "Authenticated users can upload hazard reports" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'hazard-reports' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view social media" ON storage.objects
FOR SELECT USING (bucket_id = 'social-media');

CREATE POLICY "System can upload social media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'social-media');

-- ========================================
-- STEP 10: Verification
-- ========================================

-- Test PostGIS functionality
SELECT 'PostGIS Test' as test_name, ST_AsText(ST_GeomFromText('POINT(73.8278 15.4989)', 4326)) as result;

-- Check if all tables exist
SELECT 'Tables Check' as test_name, COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'ocean_hazard_reports', 'social_media_feeds', 
    'hazard_hotspots', 'official_data_feeds', 'report_comments', 
    'departments', 'alert_notifications', 'alert_rules', 'notification_templates'
  );

-- Check RLS is enabled
SELECT 'RLS Check' as test_name, COUNT(*) as rls_enabled_count
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
  AND tablename IN (
    'profiles', 'ocean_hazard_reports', 'social_media_feeds', 
    'hazard_hotspots', 'official_data_feeds', 'report_comments', 
    'departments', 'alert_notifications', 'alert_rules', 'notification_templates'
  );

-- Check storage buckets
SELECT 'Storage Check' as test_name, COUNT(*) as bucket_count
FROM storage.buckets 
WHERE id IN ('avatars', 'hazard-reports', 'social-media');

-- Check sample data
SELECT 'Data Check' as test_name, 'Profiles' as item, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Data Check' as test_name, 'Ocean Hazard Reports' as item, COUNT(*) as count FROM public.ocean_hazard_reports
UNION ALL
SELECT 'Data Check' as test_name, 'Social Media Feeds' as item, COUNT(*) as count FROM public.social_media_feeds
UNION ALL
SELECT 'Data Check' as test_name, 'Hazard Hotspots' as item, COUNT(*) as count FROM public.hazard_hotspots
UNION ALL
SELECT 'Data Check' as test_name, 'Official Data Feeds' as item, COUNT(*) as count FROM public.official_data_feeds
UNION ALL
SELECT 'Data Check' as test_name, 'Departments' as item, COUNT(*) as count FROM public.departments
UNION ALL
SELECT 'Data Check' as test_name, 'Alert Notifications' as item, COUNT(*) as count FROM public.alert_notifications
UNION ALL
SELECT 'Data Check' as test_name, 'Report Comments' as item, COUNT(*) as count FROM public.report_comments;

-- Overall status
SELECT 
  'SETUP STATUS' as category,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'ocean_hazard_reports', 'social_media_feeds', 'hazard_hotspots', 'official_data_feeds', 'report_comments', 'departments', 'alert_notifications', 'alert_rules', 'notification_templates')
    ) = 10
    AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis')
    AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp')
    THEN '🎉 DATABASE RESET COMPLETE!'
    ELSE '⚠️ RESET INCOMPLETE - Check issues above'
  END as status;

SELECT 'Database reset completed successfully!' as final_status;
