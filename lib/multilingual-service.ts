// Multilingual Support Service for SamudraSetu
// Provides translation and localization support for multiple Indian languages

import { supabase } from './supabase'
import { MultilingualContent } from './enhanced-database'

export class MultilingualService {
  private translations: Map<string, Map<string, string>> = new Map()
  private supportedLanguages = ['en', 'hi', 'ta', 'bn', 'te', 'mr', 'gu', 'kn', 'ml', 'pa']
  private currentLanguage = 'en'

  constructor() {
    this.loadTranslations()
  }

  // Load all translations from database
  private async loadTranslations(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('multilingual_content')
        .select('*')

      if (error) throw error

      // Organize translations by content type and language
      for (const translation of data || []) {
        if (!this.translations.has(translation.content_type)) {
          this.translations.set(translation.content_type, new Map())
        }
        
        const key = `${translation.content_key}_${translation.language_code}`
        this.translations.get(translation.content_type)!.set(key, translation.translated_text)
      }

      console.log(`🌐 Loaded translations for ${this.supportedLanguages.length} languages`)
    } catch (error: any) {
      if (error?.code === 'PGRST205') {
        console.info('ℹ️ multilingual_content table not present; continuing without DB translations')
        return
      }
      console.error('❌ Error loading translations:', error)
    }
  }

  // Set current language
  public setLanguage(language: string): void {
    if (this.supportedLanguages.includes(language)) {
      this.currentLanguage = language
      console.log(`🌐 Language set to: ${language}`)
    } else {
      console.warn(`⚠️ Unsupported language: ${language}`)
    }
  }

  // Get current language
  public getCurrentLanguage(): string {
    return this.currentLanguage
  }

  // Get supported languages
  public getSupportedLanguages(): string[] {
    return this.supportedLanguages
  }

  // Translate text based on content type and key
  public translate(contentType: string, key: string, language?: string): string {
    const lang = language || this.currentLanguage
    const translationKey = `${key}_${lang}`
    
    const translations = this.translations.get(contentType)
    if (translations && translations.has(translationKey)) {
      return translations.get(translationKey)!
    }

    // Fallback to English if translation not found
    if (lang !== 'en') {
      const englishKey = `${key}_en`
      if (translations && translations.has(englishKey)) {
        return translations.get(englishKey)!
      }
    }

    // Return key if no translation found
    return key
  }

  // Get all translations for a content type
  public getTranslations(contentType: string, language?: string): Record<string, string> {
    const lang = language || this.currentLanguage
    const translations: Record<string, string> = {}
    
    const typeTranslations = this.translations.get(contentType)
    if (typeTranslations) {
      for (const [key, value] of typeTranslations.entries()) {
        if (key.endsWith(`_${lang}`)) {
          const contentKey = key.replace(`_${lang}`, '')
          translations[contentKey] = value
        }
      }
    }

    return translations
  }

  // Add or update translation
  public async addTranslation(
    contentType: string,
    key: string,
    language: string,
    text: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('multilingual_content')
        .upsert({
          content_type: contentType,
          content_key: key,
          language_code: language,
          translated_text: text
        }, {
          onConflict: 'content_type,content_key,language_code'
        })

      if (error) throw error

      // Update local cache
      if (!this.translations.has(contentType)) {
        this.translations.set(contentType, new Map())
      }
      
      const translationKey = `${key}_${language}`
      this.translations.get(contentType)!.set(translationKey, text)

      console.log(`✅ Added translation: ${contentType}.${key} (${language})`)
    } catch (error) {
      console.error('❌ Error adding translation:', error)
      throw error
    }
  }

  // Get hazard type translations
  public getHazardTypeTranslations(language?: string): Record<string, string> {
    const hazardTypes = [
      'tsunami', 'storm_surge', 'flooding', 'erosion', 'unusual_tides',
      'coastal_damage', 'marine_pollution', 'weather_anomaly', 'cyclone',
      'storm_track', 'sea_level_rise', 'coral_bleaching', 'oil_spill',
      'algal_bloom', 'other'
    ]

    const translations: Record<string, string> = {}
    for (const hazardType of hazardTypes) {
      translations[hazardType] = this.translate('hazard_type', hazardType, language)
    }

    return translations
  }

  // Get severity level translations
  public getSeverityTranslations(language?: string): Record<string, string> {
    const severities = ['low', 'medium', 'high', 'critical']
    const translations: Record<string, string> = {}
    
    for (const severity of severities) {
      translations[severity] = this.translate('severity', severity, language)
    }

    return translations
  }

  // Get status translations
  public getStatusTranslations(language?: string): Record<string, string> {
    const statuses = ['unverified', 'verified', 'false_alarm', 'resolved']
    const translations: Record<string, string> = {}
    
    for (const status of statuses) {
      translations[status] = this.translate('status', status, language)
    }

    return translations
  }

  // Get UI text translations
  public getUITranslations(language?: string): Record<string, string> {
    const uiKeys = [
      'dashboard', 'reports', 'map', 'alerts', 'profile', 'settings',
      'submit_report', 'view_details', 'edit', 'delete', 'save', 'cancel',
      'loading', 'error', 'success', 'warning', 'info', 'search',
      'filter', 'sort', 'export', 'import', 'refresh', 'back', 'next',
      'previous', 'close', 'open', 'show', 'hide', 'more', 'less'
    ]

    const translations: Record<string, string> = {}
    for (const key of uiKeys) {
      translations[key] = this.translate('ui_text', key, language)
    }

    return translations
  }

  // Get notification translations
  public getNotificationTranslations(language?: string): Record<string, string> {
    const notificationKeys = [
      'report_submitted', 'report_verified', 'alert_issued', 'system_update',
      'welcome_message', 'goodbye_message', 'error_occurred', 'success_message'
    ]

    const translations: Record<string, string> = {}
    for (const key of notificationKeys) {
      translations[key] = this.translate('notification', key, language)
    }

    return translations
  }

  // Detect language from text
  public detectLanguage(text: string): string {
    // Language detection patterns
    const patterns = {
      hi: /[\u0900-\u097F]/, // Devanagari (Hindi)
      ta: /[\u0B80-\u0BFF]/, // Tamil
      bn: /[\u0980-\u09FF]/, // Bengali
      te: /[\u0C00-\u0C7F]/, // Telugu
      mr: /[\u0900-\u097F]/, // Marathi (uses Devanagari)
      gu: /[\u0A80-\u0AFF]/, // Gujarati
      kn: /[\u0C80-\u0CFF]/, // Kannada
      ml: /[\u0D00-\u0D7F]/, // Malayalam
      pa: /[\u0A00-\u0A7F]/  // Punjabi
    }

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang
      }
    }

    return 'en' // Default to English
  }

  // Format number according to language
  public formatNumber(number: number, language?: string): string {
    const lang = language || this.currentLanguage
    
    try {
      return new Intl.NumberFormat(lang).format(number)
    } catch (error) {
      return number.toString()
    }
  }

  // Format date according to language
  public formatDate(date: Date, language?: string): string {
    const lang = language || this.currentLanguage
    
    try {
      return new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch (error) {
      return date.toLocaleString()
    }
  }

  // Get language name in native script
  public getLanguageName(languageCode: string, inNativeScript: boolean = true): string {
    const languageNames: Record<string, { native: string; english: string }> = {
      en: { native: 'English', english: 'English' },
      hi: { native: 'हिन्दी', english: 'Hindi' },
      ta: { native: 'தமிழ்', english: 'Tamil' },
      bn: { native: 'বাংলা', english: 'Bengali' },
      te: { native: 'తెలుగు', english: 'Telugu' },
      mr: { native: 'मराठी', english: 'Marathi' },
      gu: { native: 'ગુજરાતી', english: 'Gujarati' },
      kn: { native: 'ಕನ್ನಡ', english: 'Kannada' },
      ml: { native: 'മലയാളം', english: 'Malayalam' },
      pa: { native: 'ਪੰਜਾਬੀ', english: 'Punjabi' }
    }

    const language = languageNames[languageCode]
    if (!language) return languageCode

    return inNativeScript ? language.native : language.english
  }

  // Initialize default translations
  public async initializeDefaultTranslations(): Promise<void> {
    const defaultTranslations = [
      // Hazard types
      { type: 'hazard_type', key: 'tsunami', hi: 'सुनामी', ta: 'சுனாமி', bn: 'সুনামি' },
      { type: 'hazard_type', key: 'cyclone', hi: 'चक्रवात', ta: 'சூறாவளி', bn: 'ঘূর্ণিঝড়' },
      { type: 'hazard_type', key: 'flooding', hi: 'बाढ़', ta: 'வெள்ளம்', bn: 'বন্যা' },
      { type: 'hazard_type', key: 'storm_surge', hi: 'तूफानी लहर', ta: 'புயல் அலை', bn: 'ঝড়ের ঢেউ' },
      
      // Severity levels
      { type: 'severity', key: 'low', hi: 'कम', ta: 'குறைவு', bn: 'কম' },
      { type: 'severity', key: 'medium', hi: 'मध्यम', ta: 'நடுத்தர', bn: 'মাঝারি' },
      { type: 'severity', key: 'high', hi: 'उच्च', ta: 'உயர்', bn: 'উচ্চ' },
      { type: 'severity', key: 'critical', hi: 'गंभीर', ta: 'முக்கியமான', bn: 'গুরুতর' },
      
      // Status
      { type: 'status', key: 'unverified', hi: 'असत्यापित', ta: 'சரிபார்க்கப்படாத', bn: 'অনিশ্চিত' },
      { type: 'status', key: 'verified', hi: 'सत्यापित', ta: 'சரிபார்க்கப்பட்ட', bn: 'নিশ্চিত' },
      { type: 'status', key: 'false_alarm', hi: 'गलत अलार्म', ta: 'தவறான அலாரம்', bn: 'ভুল সতর্কতা' },
      { type: 'status', key: 'resolved', hi: 'हल', ta: 'தீர்வு', bn: 'সমাধান' },
      
      // UI text
      { type: 'ui_text', key: 'dashboard', hi: 'डैशबोर्ड', ta: 'டாஷ்போர்டு', bn: 'ড্যাশবোর্ড' },
      { type: 'ui_text', key: 'reports', hi: 'रिपोर्ट्स', ta: 'அறிக்கைகள்', bn: 'রিপোর্ট' },
      { type: 'ui_text', key: 'map', hi: 'नक्शा', ta: 'வரைபடம்', bn: 'মানচিত্র' },
      { type: 'ui_text', key: 'submit_report', hi: 'रिपोर्ट जमा करें', ta: 'அறிக்கை சமர்ப்பிக்கவும்', bn: 'রিপোর্ট জমা দিন' }
    ]

    for (const translation of defaultTranslations) {
      for (const [lang, text] of Object.entries(translation)) {
        if (lang !== 'type' && lang !== 'key') {
          await this.addTranslation(translation.type, translation.key, lang, text)
        }
      }
    }

    console.log('✅ Default translations initialized')
  }
}

export const multilingualService = new MultilingualService()
