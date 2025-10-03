-- Enable Supabase Realtime for key tables
-- Run this in Supabase SQL editor.

-- Ensure RLS is enabled on tables
ALTER TABLE public.ocean_hazard_reports ENABLE ROW LEVEL SECURITY;

-- Grant replication for Realtime (if needed)
-- Supabase handles replication automatically, but ensure anon/authenticated can subscribe
DO $$ BEGIN
  PERFORM 1;
END $$;

-- Create publication for realtime if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'ocean_hazard_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ocean_hazard_reports;
  END IF;
END$$;

-- RLS policy for realtime read (same as map policy)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='ocean_hazard_reports'
      AND policyname='Public can read public reports'
  ) THEN
    CREATE POLICY "Public can read public reports" ON public.ocean_hazard_reports
      FOR SELECT USING (is_public = true);
  END IF;
END $$;
