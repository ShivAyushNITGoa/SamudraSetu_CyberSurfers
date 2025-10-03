// i18n Configuration for SamudraSetu
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.reports": "Reports",
      "nav.analytics": "Analytics",
      "nav.admin": "Admin",
      "nav.social": "Social Media",
      "nav.alerts": "Alerts",
      "nav.profile": "Profile",
      "nav.settings": "Settings",
      "nav.logout": "Logout",

      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.view": "View",
      "common.close": "Close",
      "common.refresh": "Refresh",
      "common.filter": "Filter",
      "common.search": "Search",
      "common.submit": "Submit",
      "common.back": "Back",
      "common.next": "Next",
      "common.previous": "Previous",
      "common.confirm": "Confirm",
      "common.yes": "Yes",
      "common.no": "No",

      // Dashboard
      "dashboard.title": "SamudraSetu Dashboard",
      "dashboard.subtitle": "Ocean Hazard Monitoring & Response",
      "dashboard.total_reports": "Total Reports",
      "dashboard.verified_reports": "Verified Reports",
      "dashboard.critical_reports": "Critical Reports",
      "dashboard.social_activity": "Social Activity",
      "dashboard.recent_reports": "Recent Reports",
      "dashboard.ocean_hazard_map": "Ocean Hazard Map",
      "dashboard.quick_actions": "Quick Actions",
      "dashboard.report_hazard": "Report Hazard",
      "dashboard.view_alerts": "View Alerts",
      "dashboard.my_profile": "My Profile",

      // Reports
      "reports.title": "Ocean Hazard Reports",
      "reports.new_report": "New Report",
      "reports.report_title": "Report Title",
      "reports.description": "Description",
      "reports.hazard_type": "Hazard Type",
      "reports.severity": "Severity Level",
      "reports.location": "Location",
      "reports.media_upload": "Media Upload",
      "reports.submit_report": "Submit Report",
      "reports.report_submitted": "Report submitted successfully!",
      "reports.report_failed": "Failed to submit report. Please try again.",

      // Hazard Types
      "hazard.tsunami": "Tsunami",
      "hazard.storm_surge": "Storm Surge",
      "hazard.flooding": "Flooding",
      "hazard.erosion": "Coastal Erosion",
      "hazard.unusual_tides": "Unusual Tides",
      "hazard.coastal_damage": "Coastal Damage",
      "hazard.marine_pollution": "Marine Pollution",
      "hazard.weather_anomaly": "Weather Anomaly",
      "hazard.other": "Other",

      // Severity Levels
      "severity.low": "Low",
      "severity.medium": "Medium",
      "severity.high": "High",
      "severity.critical": "Critical",

      // Status
      "status.unverified": "Unverified",
      "status.verified": "Verified",
      "status.false_alarm": "False Alarm",
      "status.resolved": "Resolved",

      // Map
      "map.markers": "Markers",
      "map.clusters": "Clusters",
      "map.heatmap": "Heatmap",
      "map.hotspots": "Hotspots",
      "map.legend": "Legend",
      "map.official_data": "Official Data",
      "map.social_media": "Social Media",

      // Analytics
      "analytics.title": "Analytics Dashboard",
      "analytics.subtitle": "Comprehensive insights and trends",
      "analytics.reports_trend": "Reports Trend",
      "analytics.social_activity": "Social Media Activity",
      "analytics.hazard_types": "Hazard Types",
      "analytics.severity_levels": "Severity Levels",
      "analytics.social_platforms": "Social Platforms",
      "analytics.trending_keywords": "Trending Keywords",
      "analytics.system_performance": "System Performance",
      "analytics.avg_response_time": "Avg Response Time",
      "analytics.system_uptime": "System Uptime",
      "analytics.error_rate": "Error Rate",
      "analytics.api_calls": "API Calls",

      // Admin
      "admin.title": "Admin Panel",
      "admin.subtitle": "User Management & System Administration",
      "admin.users": "Users",
      "admin.reports": "Reports",
      "admin.settings": "Settings",
      "admin.add_user": "Add User",
      "admin.user_management": "User Management",
      "admin.role_management": "Role Management",
      "admin.system_settings": "System Settings",

      // Social Media
      "social.title": "Social Media Monitoring",
      "social.subtitle": "Monitor and verify social media posts for ocean hazards",
      "social.total_posts": "Total Posts",
      "social.verified_posts": "Verified Posts",
      "social.positive_sentiment": "Positive Sentiment",
      "social.negative_sentiment": "Negative Sentiment",
      "social.trending_keywords": "Trending Keywords",
      "social.platform_distribution": "Platform Distribution",
      "social.sentiment_analysis": "Sentiment Analysis",

      // Alerts
      "alerts.title": "Alert Management",
      "alerts.new_alert": "New Alert",
      "alerts.alert_title": "Alert Title",
      "alerts.message": "Message",
      "alerts.alert_type": "Alert Type",
      "alerts.severity": "Severity",
      "alerts.target_roles": "Target Roles",
      "alerts.send_alert": "Send Alert",
      "alerts.alert_sent": "Alert sent successfully!",
      "alerts.alert_failed": "Failed to send alert. Please try again.",

      // Authentication
      "auth.login": "Sign In",
      "auth.register": "Sign Up",
      "auth.email": "Email Address",
      "auth.password": "Password",
      "auth.name": "Full Name",
      "auth.phone": "Phone Number",
      "auth.language_preference": "Preferred Language",
      "auth.forgot_password": "Forgot your password?",
      "auth.dont_have_account": "Don't have an account?",
      "auth.already_have_account": "Already have an account?",
      "auth.sign_in": "Sign in",
      "auth.sign_up": "Sign up",
      "auth.welcome_back": "Welcome Back",
      "auth.join_samudrasetu": "Join SamudraSetu",
      "auth.sign_in_description": "Sign in to report ocean hazards and stay informed",
      "auth.sign_up_description": "Create your account to help protect coastal communities",

      // Time Ranges
      "time.last_24h": "Last 24 Hours",
      "time.last_7d": "Last 7 Days",
      "time.last_30d": "Last 30 Days",
      "time.last_90d": "Last 90 Days",

      // Languages
      "language.english": "English",
      "language.hindi": "Hindi",
      "language.tamil": "Tamil",
      "language.bengali": "Bengali",

      // Roles
      "role.citizen": "Citizen",
      "role.analyst": "Analyst",
      "role.admin": "Admin",
      "role.dmf_head": "DMF Head",

      // Platforms
      "platform.twitter": "Twitter",
      "platform.youtube": "YouTube",
      "platform.facebook": "Facebook",
      "platform.instagram": "Instagram",

      // Sentiment
      "sentiment.positive": "Positive",
      "sentiment.negative": "Negative",
      "sentiment.neutral": "Neutral"
    }
  },
  hi: {
    translation: {
      // Navigation
      "nav.dashboard": "डैशबोर्ड",
      "nav.reports": "रिपोर्ट्स",
      "nav.analytics": "विश्लेषण",
      "nav.admin": "एडमिन",
      "nav.social": "सोशल मीडिया",
      "nav.alerts": "अलर्ट",
      "nav.profile": "प्रोफाइल",
      "nav.settings": "सेटिंग्स",
      "nav.logout": "लॉगआउट",

      // Common
      "common.loading": "लोड हो रहा है...",
      "common.error": "त्रुटि",
      "common.success": "सफलता",
      "common.cancel": "रद्द करें",
      "common.save": "सहेजें",
      "common.edit": "संपादित करें",
      "common.delete": "हटाएं",
      "common.view": "देखें",
      "common.close": "बंद करें",
      "common.refresh": "रिफ्रेश करें",
      "common.filter": "फिल्टर",
      "common.search": "खोजें",
      "common.submit": "जमा करें",
      "common.back": "वापस",
      "common.next": "अगला",
      "common.previous": "पिछला",
      "common.confirm": "पुष्टि करें",
      "common.yes": "हाँ",
      "common.no": "नहीं",

      // Dashboard
      "dashboard.title": "समुद्रसेतु डैशबोर्ड",
      "dashboard.subtitle": "समुद्री खतरा निगरानी और प्रतिक्रिया",
      "dashboard.total_reports": "कुल रिपोर्ट्स",
      "dashboard.verified_reports": "सत्यापित रिपोर्ट्स",
      "dashboard.critical_reports": "गंभीर रिपोर्ट्स",
      "dashboard.social_activity": "सोशल गतिविधि",
      "dashboard.recent_reports": "हाल की रिपोर्ट्स",
      "dashboard.ocean_hazard_map": "समुद्री खतरा मानचित्र",
      "dashboard.quick_actions": "त्वरित कार्य",
      "dashboard.report_hazard": "खतरा रिपोर्ट करें",
      "dashboard.view_alerts": "अलर्ट देखें",
      "dashboard.my_profile": "मेरी प्रोफाइल",

      // Reports
      "reports.title": "समुद्री खतरा रिपोर्ट्स",
      "reports.new_report": "नई रिपोर्ट",
      "reports.report_title": "रिपोर्ट शीर्षक",
      "reports.description": "विवरण",
      "reports.hazard_type": "खतरे का प्रकार",
      "reports.severity": "गंभीरता स्तर",
      "reports.location": "स्थान",
      "reports.media_upload": "मीडिया अपलोड",
      "reports.submit_report": "रिपोर्ट जमा करें",
      "reports.report_submitted": "रिपोर्ट सफलतापूर्वक जमा हो गई!",
      "reports.report_failed": "रिपोर्ट जमा करने में विफल। कृपया पुनः प्रयास करें।",

      // Hazard Types
      "hazard.tsunami": "सुनामी",
      "hazard.storm_surge": "तूफानी लहर",
      "hazard.flooding": "बाढ़",
      "hazard.erosion": "तटीय कटाव",
      "hazard.unusual_tides": "असामान्य ज्वार",
      "hazard.coastal_damage": "तटीय क्षति",
      "hazard.marine_pollution": "समुद्री प्रदूषण",
      "hazard.weather_anomaly": "मौसम संबंधी विसंगति",
      "hazard.other": "अन्य",

      // Severity Levels
      "severity.low": "कम",
      "severity.medium": "मध्यम",
      "severity.high": "उच्च",
      "severity.critical": "गंभीर",

      // Status
      "status.unverified": "असत्यापित",
      "status.verified": "सत्यापित",
      "status.false_alarm": "झूठी अलार्म",
      "status.resolved": "हल",

      // Map
      "map.markers": "मार्कर",
      "map.clusters": "क्लस्टर",
      "map.heatmap": "हीटमैप",
      "map.hotspots": "हॉटस्पॉट",
      "map.legend": "किंवदंती",
      "map.official_data": "आधिकारिक डेटा",
      "map.social_media": "सोशल मीडिया",

      // Analytics
      "analytics.title": "विश्लेषण डैशबोर्ड",
      "analytics.subtitle": "व्यापक अंतर्दृष्टि और रुझान",
      "analytics.reports_trend": "रिपोर्ट्स ट्रेंड",
      "analytics.social_activity": "सोशल मीडिया गतिविधि",
      "analytics.hazard_types": "खतरे के प्रकार",
      "analytics.severity_levels": "गंभीरता स्तर",
      "analytics.social_platforms": "सोशल प्लेटफॉर्म",
      "analytics.trending_keywords": "ट्रेंडिंग कीवर्ड",
      "analytics.system_performance": "सिस्टम प्रदर्शन",
      "analytics.avg_response_time": "औसत प्रतिक्रिया समय",
      "analytics.system_uptime": "सिस्टम अपटाइम",
      "analytics.error_rate": "त्रुटि दर",
      "analytics.api_calls": "API कॉल",

      // Admin
      "admin.title": "एडमिन पैनल",
      "admin.subtitle": "उपयोगकर्ता प्रबंधन और सिस्टम प्रशासन",
      "admin.users": "उपयोगकर्ता",
      "admin.reports": "रिपोर्ट्स",
      "admin.settings": "सेटिंग्स",
      "admin.add_user": "उपयोगकर्ता जोड़ें",
      "admin.user_management": "उपयोगकर्ता प्रबंधन",
      "admin.role_management": "भूमिका प्रबंधन",
      "admin.system_settings": "सिस्टम सेटिंग्स",

      // Social Media
      "social.title": "सोशल मीडिया निगरानी",
      "social.subtitle": "समुद्री खतरों के लिए सोशल मीडिया पोस्ट की निगरानी और सत्यापन",
      "social.total_posts": "कुल पोस्ट",
      "social.verified_posts": "सत्यापित पोस्ट",
      "social.positive_sentiment": "सकारात्मक भावना",
      "social.negative_sentiment": "नकारात्मक भावना",
      "social.trending_keywords": "ट्रेंडिंग कीवर्ड",
      "social.platform_distribution": "प्लेटफॉर्म वितरण",
      "social.sentiment_analysis": "भावना विश्लेषण",

      // Alerts
      "alerts.title": "अलर्ट प्रबंधन",
      "alerts.new_alert": "नया अलर्ट",
      "alerts.alert_title": "अलर्ट शीर्षक",
      "alerts.message": "संदेश",
      "alerts.alert_type": "अलर्ट प्रकार",
      "alerts.severity": "गंभीरता",
      "alerts.target_roles": "लक्ष्य भूमिकाएं",
      "alerts.send_alert": "अलर्ट भेजें",
      "alerts.alert_sent": "अलर्ट सफलतापूर्वक भेजा गया!",
      "alerts.alert_failed": "अलर्ट भेजने में विफल। कृपया पुनः प्रयास करें।",

      // Authentication
      "auth.login": "साइन इन",
      "auth.register": "साइन अप",
      "auth.email": "ईमेल पता",
      "auth.password": "पासवर्ड",
      "auth.name": "पूरा नाम",
      "auth.phone": "फोन नंबर",
      "auth.language_preference": "पसंदीदा भाषा",
      "auth.forgot_password": "पासवर्ड भूल गए?",
      "auth.dont_have_account": "खाता नहीं है?",
      "auth.already_have_account": "पहले से खाता है?",
      "auth.sign_in": "साइन इन",
      "auth.sign_up": "साइन अप",
      "auth.welcome_back": "वापस स्वागत है",
      "auth.join_samudrasetu": "समुद्रसेतु में शामिल हों",
      "auth.sign_in_description": "समुद्री खतरों की रिपोर्ट करने और सूचित रहने के लिए साइन इन करें",
      "auth.sign_up_description": "तटीय समुदायों की रक्षा में मदद करने के लिए अपना खाता बनाएं",

      // Time Ranges
      "time.last_24h": "पिछले 24 घंटे",
      "time.last_7d": "पिछले 7 दिन",
      "time.last_30d": "पिछले 30 दिन",
      "time.last_90d": "पिछले 90 दिन",

      // Languages
      "language.english": "अंग्रेजी",
      "language.hindi": "हिंदी",
      "language.tamil": "तमिल",
      "language.bengali": "बंगाली",

      // Roles
      "role.citizen": "नागरिक",
      "role.analyst": "विश्लेषक",
      "role.admin": "एडमिन",
      "role.dmf_head": "डीएमएफ हेड",

      // Platforms
      "platform.twitter": "ट्विटर",
      "platform.youtube": "यूट्यूब",
      "platform.facebook": "फेसबुक",
      "platform.instagram": "इंस्टाग्राम",

      // Sentiment
      "sentiment.positive": "सकारात्मक",
      "sentiment.negative": "नकारात्मक",
      "sentiment.neutral": "तटस्थ"
    }
  },
  ta: {
    translation: {
      // Navigation
      "nav.dashboard": "டாஷ்போர்டு",
      "nav.reports": "அறிக்கைகள்",
      "nav.analytics": "பகுப்பாய்வு",
      "nav.admin": "நிர்வாகம்",
      "nav.social": "சமூக ஊடகம்",
      "nav.alerts": "எச்சரிக்கைகள்",
      "nav.profile": "சுயவிவரம்",
      "nav.settings": "அமைப்புகள்",
      "nav.logout": "வெளியேறு",

      // Common
      "common.loading": "ஏற்றுகிறது...",
      "common.error": "பிழை",
      "common.success": "வெற்றி",
      "common.cancel": "ரத்து செய்",
      "common.save": "சேமி",
      "common.edit": "திருத்து",
      "common.delete": "நீக்கு",
      "common.view": "காண்க",
      "common.close": "மூடு",
      "common.refresh": "புதுப்பி",
      "common.filter": "வடிகட்டி",
      "common.search": "தேடு",
      "common.submit": "சமர்ப்பி",
      "common.back": "பின்",
      "common.next": "அடுத்து",
      "common.previous": "முந்தைய",
      "common.confirm": "உறுதிப்படுத்து",
      "common.yes": "ஆம்",
      "common.no": "இல்லை",

      // Dashboard
      "dashboard.title": "சமுத்ரசேது டாஷ்போர்டு",
      "dashboard.subtitle": "கடல் ஆபத்து கண்காணிப்பு மற்றும் பதில்",
      "dashboard.total_reports": "மொத்த அறிக்கைகள்",
      "dashboard.verified_reports": "சரிபார்க்கப்பட்ட அறிக்கைகள்",
      "dashboard.critical_reports": "முக்கியமான அறிக்கைகள்",
      "dashboard.social_activity": "சமூக செயல்பாடு",
      "dashboard.recent_reports": "சமீபத்திய அறிக்கைகள்",
      "dashboard.ocean_hazard_map": "கடல் ஆபத்து வரைபடம்",
      "dashboard.quick_actions": "விரைவு செயல்கள்",
      "dashboard.report_hazard": "ஆபத்தை அறிக்கை செய்",
      "dashboard.view_alerts": "எச்சரிக்கைகளைக் காண்க",
      "dashboard.my_profile": "என் சுயவிவரம்",

      // Reports
      "reports.title": "கடல் ஆபத்து அறிக்கைகள்",
      "reports.new_report": "புதிய அறிக்கை",
      "reports.report_title": "அறிக்கை தலைப்பு",
      "reports.description": "விளக்கம்",
      "reports.hazard_type": "ஆபத்து வகை",
      "reports.severity": "கடுமை நிலை",
      "reports.location": "இடம்",
      "reports.media_upload": "மீடியா பதிவேற்றம்",
      "reports.submit_report": "அறிக்கையை சமர்ப்பி",
      "reports.report_submitted": "அறிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
      "reports.report_failed": "அறிக்கை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",

      // Hazard Types
      "hazard.tsunami": "சுனாமி",
      "hazard.storm_surge": "புயல் அலை",
      "hazard.flooding": "வெள்ளம்",
      "hazard.erosion": "கடற்கரை அரிப்பு",
      "hazard.unusual_tides": "அசாதாரண அலைகள்",
      "hazard.coastal_damage": "கடற்கரை சேதம்",
      "hazard.marine_pollution": "கடல் மாசுபாடு",
      "hazard.weather_anomaly": "வானிலை அசாதாரணங்கள்",
      "hazard.other": "மற்றவை",

      // Severity Levels
      "severity.low": "குறைவு",
      "severity.medium": "நடுத்தர",
      "severity.high": "உயர்",
      "severity.critical": "முக்கியமான",

      // Status
      "status.unverified": "சரிபார்க்கப்படவில்லை",
      "status.verified": "சரிபார்க்கப்பட்டது",
      "status.false_alarm": "தவறான எச்சரிக்கை",
      "status.resolved": "தீர்க்கப்பட்டது",

      // Map
      "map.markers": "குறிப்பான்கள்",
      "map.clusters": "குழுக்கள்",
      "map.heatmap": "வெப்ப வரைபடம்",
      "map.hotspots": "சூடான இடங்கள்",
      "map.legend": "விளக்கம்",
      "map.official_data": "அதிகாரப்பூர்வ தரவு",
      "map.social_media": "சமூக ஊடகம்",

      // Analytics
      "analytics.title": "பகுப்பாய்வு டாஷ்போர்டு",
      "analytics.subtitle": "விரிவான நுண்ணறிவு மற்றும் போக்குகள்",
      "analytics.reports_trend": "அறிக்கைகள் போக்கு",
      "analytics.social_activity": "சமூக ஊடக செயல்பாடு",
      "analytics.hazard_types": "ஆபத்து வகைகள்",
      "analytics.severity_levels": "கடுமை நிலைகள்",
      "analytics.social_platforms": "சமூக தளங்கள்",
      "analytics.trending_keywords": "பிரபலமான முக்கிய வார்த்தைகள்",
      "analytics.system_performance": "கணினி செயல்திறன்",
      "analytics.avg_response_time": "சராசரி பதில் நேரம்",
      "analytics.system_uptime": "கணினி இயங்கும் நேரம்",
      "analytics.error_rate": "பிழை விகிதம்",
      "analytics.api_calls": "API அழைப்புகள்",

      // Admin
      "admin.title": "நிர்வாக பலகை",
      "admin.subtitle": "பயனர் மேலாண்மை மற்றும் கணினி நிர்வாகம்",
      "admin.users": "பயனர்கள்",
      "admin.reports": "அறிக்கைகள்",
      "admin.settings": "அமைப்புகள்",
      "admin.add_user": "பயனரைச் சேர்",
      "admin.user_management": "பயனர் மேலாண்மை",
      "admin.role_management": "பாத்திர மேலாண்மை",
      "admin.system_settings": "கணினி அமைப்புகள்",

      // Social Media
      "social.title": "சமூக ஊடக கண்காணிப்பு",
      "social.subtitle": "கடல் ஆபத்துகளுக்கான சமூக ஊடக இடுகைகளை கண்காணித்தல் மற்றும் சரிபார்த்தல்",
      "social.total_posts": "மொத்த இடுகைகள்",
      "social.verified_posts": "சரிபார்க்கப்பட்ட இடுகைகள்",
      "social.positive_sentiment": "நேர்மறை உணர்வு",
      "social.negative_sentiment": "எதிர்மறை உணர்வு",
      "social.trending_keywords": "பிரபலமான முக்கிய வார்த்தைகள்",
      "social.platform_distribution": "தள விநியோகம்",
      "social.sentiment_analysis": "உணர்வு பகுப்பாய்வு",

      // Alerts
      "alerts.title": "எச்சரிக்கை மேலாண்மை",
      "alerts.new_alert": "புதிய எச்சரிக்கை",
      "alerts.alert_title": "எச்சரிக்கை தலைப்பு",
      "alerts.message": "செய்தி",
      "alerts.alert_type": "எச்சரிக்கை வகை",
      "alerts.severity": "கடுமை",
      "alerts.target_roles": "இலக்கு பாத்திரங்கள்",
      "alerts.send_alert": "எச்சரிக்கையை அனுப்பு",
      "alerts.alert_sent": "எச்சரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது!",
      "alerts.alert_failed": "எச்சரிக்கை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",

      // Authentication
      "auth.login": "உள்நுழை",
      "auth.register": "பதிவு",
      "auth.email": "மின்னஞ்சல் முகவரி",
      "auth.password": "கடவுச்சொல்",
      "auth.name": "முழு பெயர்",
      "auth.phone": "தொலைபேசி எண்",
      "auth.language_preference": "விருப்பமான மொழி",
      "auth.forgot_password": "கடவுச்சொல் மறந்துவிட்டதா?",
      "auth.dont_have_account": "கணக்கு இல்லையா?",
      "auth.already_have_account": "ஏற்கனவே கணக்கு உள்ளதா?",
      "auth.sign_in": "உள்நுழை",
      "auth.sign_up": "பதிவு",
      "auth.welcome_back": "மீண்டும் வரவேற்கிறோம்",
      "auth.join_samudrasetu": "சமுத்ரசேதுவில் சேரவும்",
      "auth.sign_in_description": "கடல் ஆபத்துகளை அறிக்கை செய்யவும் மற்றும் தகவலறிந்திருக்கவும் உள்நுழையவும்",
      "auth.sign_up_description": "கடலோர சமூகங்களைப் பாதுகாக்க உதவ உங்கள் கணக்கை உருவாக்கவும்",

      // Time Ranges
      "time.last_24h": "கடந்த 24 மணி நேரம்",
      "time.last_7d": "கடந்த 7 நாட்கள்",
      "time.last_30d": "கடந்த 30 நாட்கள்",
      "time.last_90d": "கடந்த 90 நாட்கள்",

      // Languages
      "language.english": "ஆங்கிலம்",
      "language.hindi": "இந்தி",
      "language.tamil": "தமிழ்",
      "language.bengali": "வங்காளம்",

      // Roles
      "role.citizen": "குடிமகன்",
      "role.analyst": "பகுப்பாய்வாளர்",
      "role.admin": "நிர்வாகம்",
      "role.dmf_head": "டிஎம்எஃப் தலைவர்",

      // Platforms
      "platform.twitter": "ட்விட்டர்",
      "platform.youtube": "யூடியூப்",
      "platform.facebook": "பேஸ்புக்",
      "platform.instagram": "இன்ஸ்டாகிராம்",

      // Sentiment
      "sentiment.positive": "நேர்மறை",
      "sentiment.negative": "எதிர்மறை",
      "sentiment.neutral": "நடுநிலை"
    }
  },
  bn: {
    translation: {
      // Navigation
      "nav.dashboard": "ড্যাশবোর্ড",
      "nav.reports": "রিপোর্ট",
      "nav.analytics": "বিশ্লেষণ",
      "nav.admin": "অ্যাডমিন",
      "nav.social": "সোশ্যাল মিডিয়া",
      "nav.alerts": "সতর্কতা",
      "nav.profile": "প্রোফাইল",
      "nav.settings": "সেটিংস",
      "nav.logout": "লগআউট",

      // Common
      "common.loading": "লোড হচ্ছে...",
      "common.error": "ত্রুটি",
      "common.success": "সফলতা",
      "common.cancel": "বাতিল",
      "common.save": "সংরক্ষণ",
      "common.edit": "সম্পাদনা",
      "common.delete": "মুছে ফেলুন",
      "common.view": "দেখুন",
      "common.close": "বন্ধ",
      "common.refresh": "রিফ্রেশ",
      "common.filter": "ফিল্টার",
      "common.search": "অনুসন্ধান",
      "common.submit": "জমা দিন",
      "common.back": "পিছনে",
      "common.next": "পরবর্তী",
      "common.previous": "পূর্ববর্তী",
      "common.confirm": "নিশ্চিত করুন",
      "common.yes": "হ্যাঁ",
      "common.no": "না",

      // Dashboard
      "dashboard.title": "সমুদ্রসেতু ড্যাশবোর্ড",
      "dashboard.subtitle": "সমুদ্র বিপদ নিরীক্ষণ এবং প্রতিক্রিয়া",
      "dashboard.total_reports": "মোট রিপোর্ট",
      "dashboard.verified_reports": "যাচাইকৃত রিপোর্ট",
      "dashboard.critical_reports": "সমালোচনামূলক রিপোর্ট",
      "dashboard.social_activity": "সামাজিক কার্যকলাপ",
      "dashboard.recent_reports": "সাম্প্রতিক রিপোর্ট",
      "dashboard.ocean_hazard_map": "সমুদ্র বিপদ মানচিত্র",
      "dashboard.quick_actions": "দ্রুত কর্ম",
      "dashboard.report_hazard": "বিপদ রিপোর্ট করুন",
      "dashboard.view_alerts": "সতর্কতা দেখুন",
      "dashboard.my_profile": "আমার প্রোফাইল",

      // Reports
      "reports.title": "সমুদ্র বিপদ রিপোর্ট",
      "reports.new_report": "নতুন রিপোর্ট",
      "reports.report_title": "রিপোর্ট শিরোনাম",
      "reports.description": "বিবরণ",
      "reports.hazard_type": "বিপদের ধরন",
      "reports.severity": "তীব্রতা স্তর",
      "reports.location": "অবস্থান",
      "reports.media_upload": "মিডিয়া আপলোড",
      "reports.submit_report": "রিপোর্ট জমা দিন",
      "reports.report_submitted": "রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে!",
      "reports.report_failed": "রিপোর্ট জমা দিতে ব্যর্থ। আবার চেষ্টা করুন।",

      // Hazard Types
      "hazard.tsunami": "সুনামি",
      "hazard.storm_surge": "ঝড়ের ঢেউ",
      "hazard.flooding": "বন্যা",
      "hazard.erosion": "উপকূলীয় ক্ষয়",
      "hazard.unusual_tides": "অস্বাভাবিক জোয়ার",
      "hazard.coastal_damage": "উপকূলীয় ক্ষতি",
      "hazard.marine_pollution": "সমুদ্র দূষণ",
      "hazard.weather_anomaly": "আবহাওয়া অস্বাভাবিকতা",
      "hazard.other": "অন্যান্য",

      // Severity Levels
      "severity.low": "নিম্ন",
      "severity.medium": "মাঝারি",
      "severity.high": "উচ্চ",
      "severity.critical": "সমালোচনামূলক",

      // Status
      "status.unverified": "অযাচাইকৃত",
      "status.verified": "যাচাইকৃত",
      "status.false_alarm": "মিথ্যা অ্যালার্ম",
      "status.resolved": "সমাধান",

      // Map
      "map.markers": "মার্কার",
      "map.clusters": "ক্লাস্টার",
      "map.heatmap": "হিটম্যাপ",
      "map.hotspots": "হটস্পট",
      "map.legend": "কিংবদন্তি",
      "map.official_data": "সরকারি ডেটা",
      "map.social_media": "সোশ্যাল মিডিয়া",

      // Analytics
      "analytics.title": "বিশ্লেষণ ড্যাশবোর্ড",
      "analytics.subtitle": "বিস্তৃত অন্তর্দৃষ্টি এবং প্রবণতা",
      "analytics.reports_trend": "রিপোর্ট ট্রেন্ড",
      "analytics.social_activity": "সোশ্যাল মিডিয়া কার্যকলাপ",
      "analytics.hazard_types": "বিপদের ধরন",
      "analytics.severity_levels": "তীব্রতা স্তর",
      "analytics.social_platforms": "সোশ্যাল প্ল্যাটফর্ম",
      "analytics.trending_keywords": "ট্রেন্ডিং কীওয়ার্ড",
      "analytics.system_performance": "সিস্টেম পারফরম্যান্স",
      "analytics.avg_response_time": "গড় প্রতিক্রিয়া সময়",
      "analytics.system_uptime": "সিস্টেম আপটাইম",
      "analytics.error_rate": "ত্রুটি হার",
      "analytics.api_calls": "API কল",

      // Admin
      "admin.title": "অ্যাডমিন প্যানেল",
      "admin.subtitle": "ব্যবহারকারী ব্যবস্থাপনা এবং সিস্টেম প্রশাসন",
      "admin.users": "ব্যবহারকারী",
      "admin.reports": "রিপোর্ট",
      "admin.settings": "সেটিংস",
      "admin.add_user": "ব্যবহারকারী যোগ করুন",
      "admin.user_management": "ব্যবহারকারী ব্যবস্থাপনা",
      "admin.role_management": "ভূমিকা ব্যবস্থাপনা",
      "admin.system_settings": "সিস্টেম সেটিংস",

      // Social Media
      "social.title": "সোশ্যাল মিডিয়া মনিটরিং",
      "social.subtitle": "সমুদ্র বিপদের জন্য সোশ্যাল মিডিয়া পোস্ট নিরীক্ষণ এবং যাচাইকরণ",
      "social.total_posts": "মোট পোস্ট",
      "social.verified_posts": "যাচাইকৃত পোস্ট",
      "social.positive_sentiment": "ইতিবাচক অনুভূতি",
      "social.negative_sentiment": "নেতিবাচক অনুভূতি",
      "social.trending_keywords": "ট্রেন্ডিং কীওয়ার্ড",
      "social.platform_distribution": "প্ল্যাটফর্ম বিতরণ",
      "social.sentiment_analysis": "অনুভূতি বিশ্লেষণ",

      // Alerts
      "alerts.title": "সতর্কতা ব্যবস্থাপনা",
      "alerts.new_alert": "নতুন সতর্কতা",
      "alerts.alert_title": "সতর্কতা শিরোনাম",
      "alerts.message": "বার্তা",
      "alerts.alert_type": "সতর্কতা ধরন",
      "alerts.severity": "তীব্রতা",
      "alerts.target_roles": "লক্ষ্য ভূমিকা",
      "alerts.send_alert": "সতর্কতা পাঠান",
      "alerts.alert_sent": "সতর্কতা সফলভাবে পাঠানো হয়েছে!",
      "alerts.alert_failed": "সতর্কতা পাঠাতে ব্যর্থ। আবার চেষ্টা করুন।",

      // Authentication
      "auth.login": "সাইন ইন",
      "auth.register": "নিবন্ধন",
      "auth.email": "ইমেইল ঠিকানা",
      "auth.password": "পাসওয়ার্ড",
      "auth.name": "পূর্ণ নাম",
      "auth.phone": "ফোন নম্বর",
      "auth.language_preference": "পছন্দের ভাষা",
      "auth.forgot_password": "পাসওয়ার্ড ভুলে গেছেন?",
      "auth.dont_have_account": "অ্যাকাউন্ট নেই?",
      "auth.already_have_account": "ইতিমধ্যে অ্যাকাউন্ট আছে?",
      "auth.sign_in": "সাইন ইন",
      "auth.sign_up": "নিবন্ধন",
      "auth.welcome_back": "ফিরে আসার জন্য স্বাগতম",
      "auth.join_samudrasetu": "সমুদ্রসেতুতে যোগ দিন",
      "auth.sign_in_description": "সমুদ্র বিপদ রিপোর্ট করতে এবং অবহিত থাকতে সাইন ইন করুন",
      "auth.sign_up_description": "উপকূলীয় সম্প্রদায়কে রক্ষা করতে সাহায্য করতে আপনার অ্যাকাউন্ট তৈরি করুন",

      // Time Ranges
      "time.last_24h": "গত 24 ঘন্টা",
      "time.last_7d": "গত 7 দিন",
      "time.last_30d": "গত 30 দিন",
      "time.last_90d": "গত 90 দিন",

      // Languages
      "language.english": "ইংরেজি",
      "language.hindi": "হিন্দি",
      "language.tamil": "তামিল",
      "language.bengali": "বাংলা",

      // Roles
      "role.citizen": "নাগরিক",
      "role.analyst": "বিশ্লেষক",
      "role.admin": "অ্যাডমিন",
      "role.dmf_head": "ডিএমএফ হেড",

      // Platforms
      "platform.twitter": "টুইটার",
      "platform.youtube": "ইউটিউব",
      "platform.facebook": "ফেসবুক",
      "platform.instagram": "ইনস্টাগ্রাম",

      // Sentiment
      "sentiment.positive": "ইতিবাচক",
      "sentiment.negative": "নেতিবাচক",
      "sentiment.neutral": "নিরপেক্ষ"
    }
  }
}

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
