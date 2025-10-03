import { supabase } from './supabase';

// Function to list all tables in Supabase
export const listAllTables = async () => {
  try {
    // Try to query information_schema directly
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');

    if (error) {
      console.error('Error fetching tables:', error);
      // Fallback: return known tables from our schema
      return [
        { table_name: 'profiles', table_schema: 'public' },
        { table_name: 'ocean_hazard_reports', table_schema: 'public' },
        { table_name: 'social_media_feeds', table_schema: 'public' },
        { table_name: 'hazard_hotspots', table_schema: 'public' },
        { table_name: 'official_data_feeds', table_schema: 'public' },
        { table_name: 'report_comments', table_schema: 'public' },
        { table_name: 'departments', table_schema: 'public' },
        { table_name: 'alert_notifications', table_schema: 'public' }
      ];
    }

    return data || [];
  } catch (error) {
    console.error('Error in listAllTables:', error);
    // Fallback: return known tables from our schema
    return [
      { table_name: 'profiles', table_schema: 'public' },
      { table_name: 'ocean_hazard_reports', table_schema: 'public' },
      { table_name: 'social_media_feeds', table_schema: 'public' },
      { table_name: 'hazard_hotspots', table_schema: 'public' },
      { table_name: 'official_data_feeds', table_schema: 'public' },
      { table_name: 'report_comments', table_schema: 'public' },
      { table_name: 'departments', table_schema: 'public' },
      { table_name: 'alert_notifications', table_schema: 'public' }
    ];
  }
};

// Function to get table structure
export const getTableStructure = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');

    if (error) {
      console.error(`Error fetching structure for table ${tableName}:`, error);
      // Fallback: return known structure for our tables
      return getKnownTableStructure(tableName);
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getTableStructure for ${tableName}:`, error);
    // Fallback: return known structure for our tables
    return getKnownTableStructure(tableName);
  }
};

// Fallback function to return known table structures
const getKnownTableStructure = (tableName: string) => {
  const knownStructures: Record<string, any[]> = {
    profiles: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      { column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'role', data_type: 'text', is_nullable: 'YES', column_default: "'citizen'" },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
      { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' }
    ],
    ocean_hazard_reports: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'uuid_generate_v4()' },
      { column_name: 'title', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'description', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'hazard_type', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'severity', data_type: 'text', is_nullable: 'YES', column_default: "'medium'" },
      { column_name: 'status', data_type: 'text', is_nullable: 'YES', column_default: "'unverified'" },
      { column_name: 'location', data_type: 'geography', is_nullable: 'NO', column_default: null },
      { column_name: 'address', data_type: 'text', is_nullable: 'NO', column_default: "''" },
      { column_name: 'media_urls', data_type: 'text[]', is_nullable: 'YES', column_default: "'{}'" },
      { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      { column_name: 'verified_by', data_type: 'uuid', is_nullable: 'YES', column_default: null },
      { column_name: 'is_public', data_type: 'boolean', is_nullable: 'YES', column_default: 'true' },
      { column_name: 'confidence_score', data_type: 'numeric', is_nullable: 'YES', column_default: '0.5' },
      { column_name: 'social_media_indicators', data_type: 'jsonb', is_nullable: 'YES', column_default: "'{}'" },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
      { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
      { column_name: 'verified_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: null },
      { column_name: 'admin_notes', data_type: 'text', is_nullable: 'YES', column_default: null }
    ],
    report_comments: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'uuid_generate_v4()' },
      { column_name: 'report_id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
      { column_name: 'user_name', data_type: 'text', is_nullable: 'YES', column_default: null },
      { column_name: 'comment', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' }
    ],
    departments: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
      { column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'contact_email', data_type: 'text', is_nullable: 'NO', column_default: null },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' }
    ]
  };

  return knownStructures[tableName] || [];
};

// Function to test database connection and get basic info
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Database connection successful');
    
    // Get table count
    const { data: tableCount, error: countError } = await supabase
      .from('ocean_hazard_reports')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting table count:', countError);
    }
    
    return { 
      success: true, 
      reportsCount: tableCount?.length || 0,
      message: 'Database connection successful'
    };
    
  } catch (error) {
    console.error('Database test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to create sample data if database is empty
export const createSampleData = async () => {
  try {
    console.log('Creating sample data...');
    
    // First, create a sample profile if none exists
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    let profileId = existingProfiles?.[0]?.id;

    if (!profileId) {
      // Create a sample profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000001', // Use a fixed UUID for testing
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating sample profile:', profileError);
        return { success: false, error: profileError.message };
      }
      profileId = newProfile.id;
    }

    // Create sample reports
    const { data: existingReports } = await supabase
      .from('ocean_hazard_reports')
      .select('id')
      .limit(1);

    if (!existingReports?.length) {
      const sampleReports = [
        {
          title: 'Unusual High Tide',
          description: 'Tide levels are significantly higher than normal, causing minor flooding in low-lying areas.',
          hazard_type: 'unusual_tides',
          severity: 'medium',
          status: 'unverified',
          location: `POINT(73.8278 15.4989)`,
          address: 'Panaji Beach, Goa',
          media_urls: [],
          user_id: profileId,
          admin_notes: null
        },
        {
          title: 'Coastal Erosion',
          description: 'Rapid erosion of beachfront, threatening nearby structures.',
          hazard_type: 'erosion',
          severity: 'high',
          status: 'verified',
          location: `POINT(73.8300 15.5000)`,
          address: 'Candolim Beach, Goa',
          media_urls: [],
          user_id: profileId,
          admin_notes: 'Verified by local authorities, monitoring in progress'
        },
        {
          title: 'Marine Pollution',
          description: 'Oil slick observed near the harbor, affecting marine life.',
          hazard_type: 'marine_pollution',
          severity: 'critical',
          status: 'resolved',
          location: `POINT(73.8200 15.4900)`,
          address: 'Mormugao Harbor, Goa',
          media_urls: [],
          user_id: profileId,
          admin_notes: 'Cleanup completed, monitoring ongoing',
          verified_at: new Date().toISOString()
        }
      ];

      const { error: reportsError } = await supabase
        .from('ocean_hazard_reports')
        .insert(sampleReports);

      if (reportsError) {
        console.error('Error creating sample reports:', reportsError);
        return { success: false, error: reportsError.message };
      }

      console.log('Sample data created successfully');
    }

    return { success: true, message: 'Sample data created successfully' };
  } catch (error) {
    console.error('Error creating sample data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to test the resolve/start functionality
export const testResolveStartFeature = async () => {
  try {
    console.log('Testing resolve/start feature...');
    
    // Get an unverified report
    const { data: unverifiedReport, error: fetchError } = await supabase
      .from('ocean_hazard_reports')
      .select('*')
      .eq('status', 'unverified')
      .limit(1)
      .single();

    if (fetchError || !unverifiedReport) {
      console.log('No unverified reports found, creating one...');
      // Create a test report
      const { data: newReport, error: createError } = await supabase
        .from('ocean_hazard_reports')
        .insert({
          title: 'Test Ocean Hazard Report',
          description: 'This is a test report to verify verification functionality.',
          hazard_type: 'weather_anomaly',
          severity: 'medium',
          status: 'unverified',
          location: `POINT(73.8300 15.5000)`,
          address: 'Test Location',
          media_urls: [],
          user_id: '00000000-0000-0000-0000-000000000001', // Use the sample profile ID
          admin_notes: null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating test report:', createError);
        return { success: false, error: createError.message };
      }

      // Test updating status to verified
      const { data: updatedReport, error: updateError } = await supabase
        .from('ocean_hazard_reports')
        .update({ 
          status: 'verified',
          updated_at: new Date().toISOString(),
          admin_notes: 'Test update to verified'
        })
        .eq('id', newReport.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating report status:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ Verification feature test successful');
      return { 
        success: true, 
        message: 'Verification feature working correctly',
        testReport: updatedReport
      };
    }

    // Test updating existing unverified report
    const { data: updatedReport, error: updateError } = await supabase
      .from('ocean_hazard_reports')
      .update({ 
        status: 'verified',
        updated_at: new Date().toISOString(),
        admin_notes: 'Test update to verified'
      })
      .eq('id', unverifiedReport.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating report status:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Verification feature test successful');
    return { 
      success: true, 
      message: 'Verification feature working correctly',
      testReport: updatedReport
    };

  } catch (error) {
    console.error('Error testing verification feature:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
