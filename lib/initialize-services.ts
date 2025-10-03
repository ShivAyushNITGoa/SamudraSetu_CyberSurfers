// Service Initialization Script for SamudraSetu
// Run this to initialize all services with default configurations

import { supabase } from './supabase'
import { socialMediaMonitoring } from './social-media-monitoring'
import { officialDataIntegration } from './official-data-integration'
import { alertNotificationSystem } from './alert-notification-system'
import { multilingualService } from './multilingual-service'

export async function initializeAllServices() {
  console.log('🚀 Initializing SamudraSetu services...')

  try {
    // 1. Initialize multilingual service with default translations
    console.log('📝 Initializing multilingual service...')
    await multilingualService.initializeDefaultTranslations()
    console.log('✅ Multilingual service initialized')

    // 2. Set up default social media configurations
    console.log('📱 Setting up social media monitoring...')
    await setupSocialMediaConfigs()
    console.log('✅ Social media monitoring configured')

    // 3. Set up official data sources
    console.log('🌊 Setting up official data sources...')
    await setupOfficialDataSources()
    console.log('✅ Official data sources configured')

    // 4. Set up default alert thresholds
    console.log('🚨 Setting up alert thresholds...')
    await setupAlertThresholds()
    console.log('✅ Alert thresholds configured')

    // 5. Start monitoring services
    console.log('🔄 Starting monitoring services...')
    await socialMediaMonitoring.startMonitoring()
    await officialDataIntegration.startIntegration()
    await alertNotificationSystem.startMonitoring()
    console.log('✅ All monitoring services started')

    console.log('🎉 SamudraSetu services initialized successfully!')
    return true
  } catch (error) {
    console.error('❌ Error initializing services:', error)
    return false
  }
}

async function setupSocialMediaConfigs() {
  // Check if table exists; gracefully skip if missing in current schema
  try {
    const { data: existingConfigs } = await supabase
      .from('social_media_feeds')
      .select('id')
      .limit(1)

    if (existingConfigs && existingConfigs.length > 0) {
      console.log('📱 Social media configs already exist, skipping...')
      return
    }
  } catch (err: any) {
    if (err?.code === 'PGRST205') {
      console.info('ℹ️ social_media_feeds table not present; skipping social media config setup for this schema')
      return
    }
    throw err
  }

  // Insert default social media configurations
  const defaultConfigs = [
    {
      platform: 'twitter',
      api_credentials: {
        bearer_token: process.env.TWITTER_BEARER_TOKEN || 'demo_token'
      },
      keywords: [
        'tsunami', 'cyclone', 'flood', 'storm surge', 'coastal damage',
        'ocean hazard', 'marine pollution', 'coastal erosion', 'unusual tides',
        'सुनामी', 'चक्रवात', 'बाढ़', 'तूफान', 'समुद्री खतरा'
      ],
      languages: ['en', 'hi', 'ta', 'bn'],
      update_frequency_minutes: 5,
      is_active: !!process.env.TWITTER_BEARER_TOKEN
    },
    {
      platform: 'youtube',
      api_credentials: {
        api_key: process.env.YOUTUBE_API_KEY || 'demo_key'
      },
      keywords: [
        'ocean hazard', 'coastal flooding', 'storm damage', 'tsunami warning',
        'cyclone alert', 'flood report', 'coastal erosion'
      ],
      languages: ['en', 'hi'],
      update_frequency_minutes: 15,
      is_active: !!process.env.YOUTUBE_API_KEY
    },
    {
      platform: 'news_rss',
      api_credentials: {
        rss_feeds: [
          'https://www.weather.com/rss',
          'https://www.ndtv.com/rss',
          'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms'
        ]
      },
      keywords: [
        'flood', 'storm', 'cyclone', 'tsunami', 'coastal', 'ocean',
        'बाढ़', 'तूफान', 'चक्रवात', 'सुनामी', 'तटीय'
      ],
      languages: ['en', 'hi'],
      update_frequency_minutes: 30,
      is_active: true
    }
  ]

  for (const config of defaultConfigs) {
    await supabase
      .from('social_media_feeds')
      .insert(config)
  }
}

async function setupOfficialDataSources() {
  // Check if table exists; gracefully skip if missing in current schema
  try {
    const { data: existingSources } = await supabase
      .from('official_data_feeds')
      .select('id')
      .limit(1)

    if (existingSources && existingSources.length > 0) {
      console.log('🌊 Official data sources already exist, skipping...')
      return
    }
  } catch (err: any) {
    if (err?.code === 'PGRST205') {
      console.info('ℹ️ official_data_feeds table not present; skipping official data sources setup for this schema')
      return
    }
    throw err
  }

  // Insert default official data sources
  const defaultSources = [
    {
      name: 'INCOIS Tsunami Early Warning',
      agency: 'INCOIS',
      data_type: 'tsunami',
      api_endpoint: 'https://www.incois.gov.in/tsunami/tsunami-early-warning',
      is_active: true,
      update_frequency_minutes: 60,
      configuration: {
        api_key: process.env.INCOIS_API_KEY || null
      }
    },
    {
      name: 'IMD Cyclone Warning',
      agency: 'IMD',
      data_type: 'cyclone',
      api_endpoint: 'https://mausam.imd.gov.in/cyclone',
      is_active: true,
      update_frequency_minutes: 120,
      configuration: {
        api_key: process.env.IMD_API_KEY || null
      }
    },
    {
      name: 'NOAA Sea Level Data',
      agency: 'NOAA',
      data_type: 'sea_level',
      api_endpoint: 'https://tidesandcurrents.noaa.gov/api/',
      is_active: true,
      update_frequency_minutes: 180,
      configuration: {
        api_key: process.env.NOAA_API_KEY || null
      }
    },
    {
      name: 'ESA Marine Monitoring',
      agency: 'ESA',
      data_type: 'ocean_monitoring',
      api_endpoint: 'https://marine.copernicus.eu/api',
      is_active: true,
      update_frequency_minutes: 240,
      configuration: {}
    }
  ]

  for (const source of defaultSources) {
    await supabase
      .from('official_data_feeds')
      .insert(source)
  }
}

async function setupAlertThresholds() {
  // Check if table exists; gracefully skip if missing in current schema
  try {
    const { data: existingThresholds } = await supabase
      .from('alert_rules')
      .select('id')
      .limit(1)

    if (existingThresholds && existingThresholds.length > 0) {
      console.log('🚨 Alert thresholds already exist, skipping...')
      return
    }
  } catch (err: any) {
    if (err?.code === 'PGRST205') {
      console.info('ℹ️ alert_rules table not present; skipping alert threshold setup for this schema')
      return
    }
    throw err
  }

  // Get admin user for created_by field
  const { data: adminUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  // Insert default alert thresholds
  const defaultThresholds = [
    {
      name: 'Tsunami Alert Threshold',
      description: 'Alert when multiple tsunami reports in short time',
      hazard_type: 'tsunami',
      conditions: {
        min_reports: 3,
        time_window_minutes: 15,
        geographic_radius_km: 50,
        min_confidence: 0.7
      },
      actions: {
        send_notification: true,
        target_roles: ['admin', 'analyst', 'dmf_head'],
        notification_type: 'urgent',
        auto_verify: true,
        escalate_to_dmf: true
      },
      severity_threshold: 'high',
      time_window_minutes: 15,
      cooldown_minutes: 60,
      is_active: true,
      created_by: adminUser?.id || null
    },
    {
      name: 'Cyclone Warning Threshold',
      description: 'Alert for cyclone-related reports',
      hazard_type: 'cyclone',
      conditions: {
        min_reports: 5,
        time_window_minutes: 30,
        min_confidence: 0.6,
        sentiment_threshold: -0.3
      },
      actions: {
        send_notification: true,
        target_roles: ['admin', 'analyst'],
        notification_type: 'warning',
        auto_verify: false
      },
      severity_threshold: 'medium',
      time_window_minutes: 30,
      cooldown_minutes: 120,
      is_active: true,
      created_by: adminUser?.id || null
    },
    {
      name: 'Flooding Alert Threshold',
      description: 'Alert for coastal flooding reports',
      hazard_type: 'flooding',
      conditions: {
        min_reports: 4,
        time_window_minutes: 20,
        geographic_radius_km: 25,
        min_confidence: 0.8
      },
      actions: {
        send_notification: true,
        target_roles: ['admin', 'analyst', 'dmf_head'],
        notification_type: 'warning',
        auto_verify: true
      },
      severity_threshold: 'medium',
      time_window_minutes: 20,
      cooldown_minutes: 90,
      is_active: true,
      created_by: adminUser?.id || null
    }
  ]

  for (const threshold of defaultThresholds) {
    await supabase
      .from('alert_rules')
      .insert(threshold)
  }
}

// Export for use in other parts of the application
