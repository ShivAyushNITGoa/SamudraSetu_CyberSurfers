# SamudraSetu
## Integrated Platform for Crowdsourced Ocean Hazard Reporting and Social Media Analytics

A comprehensive platform that combines crowdsourced ocean hazard reporting with real-time social media analytics to enhance coastal community safety and disaster management response. Built with Next.js, Supabase, and Flutter.

## 🌊 Features

### 🚨 Ocean Hazard Reporting

- **GPS-enabled Reporting**: Automatic location detection for precise hazard reporting
- **Multi-hazard Support**: Tsunami, storm surge, flooding, coastal erosion, and more
- **Media Upload**: Photos and videos with automatic compression
- **Severity Assessment**: Low, medium, high, and critical threat levels
- **Offline Support**: Queue reports when connectivity is poor

### 📱 Social Media Monitoring

- **Multi-platform Support**: Twitter, YouTube, Facebook, Instagram monitoring
- **Real-time Processing**: Continuous monitoring and analysis
- **Sentiment Analysis**: Emotion detection and trend analysis
- **Keyword Extraction**: Hazard-related term identification
- **Language Detection**: Multi-language content processing (Hindi, Tamil, Bengali, English)

### 🗺️ Interactive Mapping

- **Real-time Map**: Live hazard visualization with PostGIS support
- **Heatmap Overlay**: Hazard concentration areas
- **Clustering**: Grouped marker display for better performance
- **Filtering**: By type, severity, date, verification status
- **Official Data Overlay**: INCOIS, IMD data integration

### 📊 Analytics Dashboard

- **Trend Analysis**: Historical data visualization
- **Social Media Metrics**: Engagement and sentiment trends
- **Geographic Distribution**: Spatial analysis of reports
- **Verification Statistics**: Report accuracy metrics
- **Alert Recommendations**: AI-suggested actions

### 🚨 Alert System

- **Multi-channel Notifications**: SMS, email, push notifications
- **Geographic Targeting**: Location-based alert distribution
- **Severity-based Escalation**: Automatic alert level adjustment
- **Template Management**: Customizable alert messages
- **Delivery Tracking**: Notification status monitoring

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React-based web framework with server-side rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Map GL**: Interactive mapping with Mapbox
- **Recharts**: Data visualization and analytics

### Backend
- **Supabase**: PostgreSQL database with real-time capabilities
- **PostGIS**: Geospatial data processing
- **Row Level Security (RLS)**: Data access control
- **Supabase Auth**: User authentication and authorization

### Mobile
- **Flutter**: Cross-platform mobile development
- **Offline Storage**: SQLite for offline capabilities
- **GPS Integration**: Location services
- **Camera Integration**: Media capture

### Analytics & AI
- **Natural.js**: Natural language processing
- **Twitter API v2**: Social media monitoring
- **YouTube Data API**: Video content analysis
- **Sentiment Analysis**: Emotion detection
- **Keyword Extraction**: Hazard identification

## 🗄️ Database Schema

The application uses the following main tables:

- `ocean_hazard_reports`: Main table for ocean hazard reports with PostGIS support
- `social_media_feeds`: Social media monitoring data
- `hazard_hotspots`: Computed hazard concentration areas
- `official_data_feeds`: Integration with official agencies (INCOIS, IMD)
- `alert_notifications`: Emergency alert system
- `profiles`: User profile information with role-based access
- `report_comments`: Community engagement
- `departments`: Government agency management

## 👥 User Roles

### Citizens
- **Capabilities**: Report hazards, view public data, track own reports
- **Access**: Public map, personal dashboard, mobile app
- **Languages**: Full multilingual support

### Analysts
- **Capabilities**: Verify reports, moderate content, analyze trends
- **Access**: Verification queue, analytics dashboard, social media feeds
- **Tools**: AI-assisted verification, sentiment analysis

### Disaster Management Officials (DMF Head)
- **Capabilities**: Issue alerts, manage users, oversee operations
- **Access**: Full system access, alert management, user administration
- **Authority**: Emergency response coordination

### Administrators
- **Capabilities**: System configuration, user management, data export
- **Access**: All features, system settings, analytics
- **Responsibility**: Platform maintenance and optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- npm or yarn
- Flutter SDK (for mobile development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd samudra-setu
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.samudra-setu.example .env.local
   ```

   Update the configuration in `.env.local`:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Social Media API Keys
   TWITTER_API_KEY=your_twitter_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   
   # Mapping Configuration
   # No mapping API key needed - using free OpenStreetMap!
   ```

4. **Set up the database**

   - Create a new Supabase project
   - Run the SQL schema from `samudra-setu-schema.sql`
   - Enable PostGIS extension in your Supabase project
   - Configure Row Level Security policies

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Mobile App Setup

1. **Navigate to mobile directory**

   ```bash
   cd mobile-app
   ```

2. **Install Flutter dependencies**

   ```bash
   flutter pub get
   ```

3. **Configure Supabase for Flutter**

   Update `lib/core/services/supabase_service.dart` with your Supabase credentials

4. **Run the mobile app**

   ```bash
   flutter run
   ```

## 📁 Project Structure

```text
├── app/                           # Next.js app directory
│   ├── (dashboard)/              # Dashboard pages
│   │   ├── dashboard/            # Main dashboard
│   │   ├── reports/              # Ocean hazard reports
│   │   ├── map/                  # Interactive map view
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── social-media/         # Social media monitoring
│   │   ├── alerts/               # Alert management
│   │   └── settings/             # Application settings
│   ├── citizen/                  # Citizen portal
│   │   ├── report/               # Report creation
│   │   ├── map/                  # Public map view
│   │   └── profile/              # User profile
│   └── website/                  # Marketing website
├── components/                    # Reusable UI components
│   ├── citizen/                  # Citizen-specific components
│   ├── map/                      # Mapping components
│   └── common/                   # Shared components
├── lib/                          # Utility functions and services
│   ├── social-media-monitoring.ts # Social media analytics
│   ├── ocean-hazard-analytics.ts  # Hazard analytics
│   ├── i18n.ts                   # Internationalization
│   └── database.ts               # Database types and utilities
├── mobile-app/                   # Flutter mobile application
├── public/                       # Static assets
└── docs/                         # Documentation
```

## 🌐 API Integrations

### Official Data Sources
- **INCOIS (Indian National Centre for Ocean Information Services)**
  - Tsunami early warning system
  - Ocean current data
  - Sea level monitoring
- **IMD (India Meteorological Department)**
  - Weather alerts
  - Cyclone tracking
  - Storm surge predictions
- **NOAA (National Oceanic and Atmospheric Administration)**
  - Global ocean data
  - Satellite imagery
  - Climate data

### Social Media APIs
- **Twitter API v2** - Real-time tweet monitoring
- **YouTube Data API v3** - Video content analysis
- **Facebook Graph API** - Public post access

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Mobile Development
cd mobile-app
flutter run          # Run mobile app
flutter build apk    # Build Android APK
flutter build ios    # Build iOS app
```

### Environment Variables

See `env.samudra-setu.example` for all required environment variables.

## 🚀 Deployment

### Web Application
- Deploy to Vercel, Netlify, or similar platforms
- Configure Supabase project for production
- Set up custom domain and SSL

### Mobile Application
- Build and deploy to Google Play Store and Apple App Store
- Configure Firebase for push notifications
- Set up app store optimization

### Database
- Use Supabase Cloud for managed PostgreSQL
- Configure backups and monitoring
- Set up Row Level Security policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- INCOIS for ocean data APIs
- IMD for meteorological data
- Supabase for backend infrastructure
- OpenStreetMap for mapping data
- Coastal communities for feedback and testing

## 📞 Support

For support, email support@samudrasetu.org or join our Slack channel.

## 🔮 Roadmap

- [ ] AI-powered hazard prediction
- [ ] IoT sensor integration
- [ ] Satellite imagery analysis
- [ ] Multi-country support
- [ ] Advanced analytics dashboard
- [ ] Community engagement features