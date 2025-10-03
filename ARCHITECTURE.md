# SamudraSetu - Comprehensive Ocean Hazard Monitoring System

## Overview

SamudraSetu is a comprehensive, cloud-based ocean hazard monitoring system that integrates citizen reports, social media monitoring, official data feeds, and advanced analytics to provide real-time insights into coastal and marine hazards across India.

## Architecture

### Frontend
- **Next.js Web Dashboard**: Responsive admin/analyst interface with server-side rendering
- **Flutter Mobile App**: Cross-platform citizen reporting app (planned)
- **OpenStreetMap Integration**: Free mapping solution with multiple tile layers
- **Real-time Updates**: WebSocket connections for live data synchronization

### Backend
- **Supabase**: PostgreSQL database with PostGIS extension for geospatial data
- **Node.js API**: Next.js API routes for backend services
- **Real-time Subscriptions**: Supabase real-time for live updates
- **Row-Level Security**: Comprehensive RBAC system

### Data Sources
- **Citizen Reports**: Geotagged reports via mobile/web apps
- **Social Media**: Twitter, YouTube, Facebook, Telegram, RSS feeds
- **Official Data**: INCOIS, IMD, NOAA, ESA APIs
- **NLP Processing**: Sentiment analysis and hazard classification

## Key Features

### 1. Multi-Channel Data Collection
- **Citizen Reporting**: GPS-enabled mobile app for hazard reporting
- **Social Media Monitoring**: Real-time monitoring of multiple platforms
- **Official Data Integration**: Automated feeds from government agencies
- **NLP Processing**: AI-powered content analysis and classification

### 2. Advanced Mapping & Visualization
- **Interactive Maps**: OpenStreetMap with multiple tile layers (Standard, Satellite, Terrain)
- **Multiple View Modes**: Markers, clusters, heatmaps, hotspots
- **Real-time Updates**: Live data synchronization
- **Geospatial Analytics**: PostGIS-powered spatial queries
- **Free Mapping**: No API keys required, completely free to use

### 3. Intelligent Alert System
- **Threshold-based Alerts**: Configurable rules for automatic notifications
- **Multi-channel Notifications**: Email, SMS, push, in-app
- **Role-based Targeting**: Alerts sent to relevant stakeholders
- **Escalation Management**: Automatic escalation for critical events

### 4. Multilingual Support
- **10+ Languages**: Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi
- **Dynamic Translation**: Real-time language switching
- **Localized Content**: Region-specific hazard information

### 5. Role-Based Access Control
- **Citizens**: Report hazards, view public information
- **Analysts**: Verify reports, analyze trends, moderate content
- **Administrators**: Manage users, configure system settings
- **DMF Heads**: High-level oversight, emergency response coordination

## Database Schema

### Core Tables
- `profiles`: User accounts with role-based permissions
- `ocean_hazard_reports`: Citizen and verified hazard reports
- `social_media_feeds`: Processed social media content
- `official_data_feeds`: Government agency data
- `hazard_hotspots_ml`: AI-calculated risk areas
- `alert_notifications`: System-generated alerts
- `nlp_processing_results`: AI analysis results

### Enhanced Features
- `multilingual_content`: Translation database
- `system_analytics`: Performance metrics
- `user_activity_logs`: Engagement tracking
- `alert_thresholds`: Configurable alert rules

## Services Architecture

### 1. Social Media Monitoring Service
```typescript
class SocialMediaMonitoringService {
  // Monitors Twitter, YouTube, Facebook, Telegram, RSS
  // Real-time keyword tracking
  // NLP processing pipeline
  // Geographic filtering
}
```

### 2. Official Data Integration Service
```typescript
class OfficialDataIntegrationService {
  // INCOIS tsunami warnings
  // IMD cyclone alerts
  // NOAA sea level data
  // ESA marine monitoring
}
```

### 3. Enhanced Mapping Service
```typescript
class EnhancedMappingService {
  // Multiple visualization modes
  // ML-powered hotspot detection
  // Real-time clustering
  // Geospatial analytics
}
```

### 4. Alert Notification System
```typescript
class AlertNotificationSystem {
  // Threshold monitoring
  // Multi-channel notifications
  // Role-based targeting
  // Escalation management
}
```

### 5. Multilingual Service
```typescript
class MultilingualService {
  // Dynamic translation
  // Language detection
  // Localized formatting
  // Cultural adaptation
}
```

## API Endpoints

### Citizen Reports
- `POST /api/reports` - Submit new report
- `GET /api/reports` - List reports with filters
- `GET /api/reports/[id]` - Get specific report
- `PUT /api/reports/[id]` - Update report

### Social Media
- `GET /api/social-media/feeds` - Get processed social media data
- `POST /api/social-media/process` - Trigger manual processing
- `GET /api/social-media/sentiment` - Get sentiment analysis

### Official Data
- `GET /api/official-data` - Get official data feeds
- `POST /api/official-data/refresh` - Refresh data sources
- `GET /api/official-data/sources` - List data sources

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/hotspots` - Hotspot analysis
- `GET /api/analytics/trends` - Trend analysis

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create manual alert
- `PUT /api/alerts/[id]` - Update alert
- `GET /api/alerts/thresholds` - Get alert thresholds

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL with PostGIS extension
- Supabase account
- API keys for social media platforms
- Official data source credentials

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Social Media APIs (Optional)
TWITTER_BEARER_TOKEN=your_twitter_token
YOUTUBE_API_KEY=your_youtube_key
FACEBOOK_ACCESS_TOKEN=your_facebook_token

# Official Data APIs (Optional)
INCOIS_API_KEY=your_incois_key
IMD_API_KEY=your_imd_key
NOAA_API_KEY=your_noaa_key

# Notification Services (Optional)
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Note: No mapping API key required - using free OpenStreetMap
```

### Database Setup
1. Run the enhanced database schema:
```sql
-- Execute lib/enhanced-database-schema.sql
```

2. Initialize default data:
```sql
-- Insert sample configurations
-- Set up RLS policies
-- Create storage buckets
```

### Service Initialization
```typescript
// Initialize all services
await socialMediaMonitoring.startMonitoring()
await officialDataIntegration.startIntegration()
await alertNotificationSystem.startMonitoring()
await multilingualService.initializeDefaultTranslations()
```

## Security

### Authentication
- Supabase Auth with email/password
- Social login integration
- JWT token management
- Session management

### Authorization
- Row-Level Security (RLS) policies
- Role-based access control
- API endpoint protection
- Data encryption at rest

### Data Privacy
- GDPR compliance
- Data anonymization
- Consent management
- Audit logging

## Monitoring & Analytics

### System Health
- Uptime monitoring
- Performance metrics
- Error tracking
- Resource utilization

### User Analytics
- Engagement metrics
- Report quality scores
- Geographic coverage
- Response times

### Business Intelligence
- Hazard trend analysis
- Predictive modeling
- Risk assessment
- Impact evaluation

## Future Enhancements

### Phase 2
- Flutter mobile app
- Advanced ML models
- IoT sensor integration
- Blockchain verification

### Phase 3
- Satellite data integration
- Drone surveillance
- Automated response systems
- International expansion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Code review and merge

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Email: support@samudrasetu.in
- Documentation: https://docs.samudrasetu.in
- Issues: GitHub Issues

## Acknowledgments

- INCOIS for oceanographic data
- IMD for weather information
- NOAA for global ocean data
- ESA for satellite monitoring
- OpenStreetMap for mapping data
- Supabase for backend infrastructure
