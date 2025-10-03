-- Supabase: Public reports GeoJSON view and RLS policies
-- Run this in your Supabase SQL editor.

-- Ensure PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Public SELECT on public reports
ALTER TABLE public.ocean_hazard_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ocean_hazard_reports' 
      AND policyname = 'Public can read public reports'
  ) THEN
    CREATE POLICY "Public can read public reports" ON public.ocean_hazard_reports
      FOR SELECT USING (is_public = true);
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_ohr_location ON public.ocean_hazard_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_ohr_created_at ON public.ocean_hazard_reports (created_at);

-- GeoJSON view for website/dashboard maps
CREATE OR REPLACE VIEW public.view_public_reports_geojson AS
SELECT 
  id,
  title,
  description,
  hazard_type,
  severity,
  status,
  ST_AsGeoJSON(location)::json AS location,
  address,
  confidence_score,
  social_media_indicators,
  created_at
FROM public.ocean_hazard_reports
WHERE is_public = true;

GRANT SELECT ON public.view_public_reports_geojson TO anon, authenticated;

-- Hotspots read access (optional)
ALTER TABLE public.hazard_hotspots ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'hazard_hotspots' 
      AND policyname = 'Public can read hotspots'
  ) THEN
    CREATE POLICY "Public can read hotspots" ON public.hazard_hotspots
      FOR SELECT USING (true);
  END IF;
END $$;


