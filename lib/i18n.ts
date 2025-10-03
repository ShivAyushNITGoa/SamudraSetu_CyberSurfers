/**
 * Multilingual Support for SamudraSetu
 */

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' }
];

export const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Reports',
    'nav.map': 'Map',
    'nav.analytics': 'Analytics',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'hazard.tsunami': 'Tsunami',
    'hazard.storm_surge': 'Storm Surge',
    'hazard.flooding': 'Flooding',
    'severity.low': 'Low',
    'severity.medium': 'Medium',
    'severity.high': 'High',
    'severity.critical': 'Critical'
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.reports': 'रिपोर्ट्स',
    'nav.map': 'नक्शा',
    'nav.analytics': 'विश्लेषण',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'hazard.tsunami': 'सुनामी',
    'hazard.storm_surge': 'तूफानी लहर',
    'hazard.flooding': 'बाढ़',
    'severity.low': 'कम',
    'severity.medium': 'मध्यम',
    'severity.high': 'उच्च',
    'severity.critical': 'गंभीर'
  },
  ta: {
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.reports': 'அறிக்கைகள்',
    'nav.map': 'வரைபடம்',
    'nav.analytics': 'பகுப்பாய்வு',
    'common.submit': 'சமர்ப்பி',
    'common.cancel': 'ரத்து செய்',
    'common.save': 'சேமி',
    'hazard.tsunami': 'சுனாமி',
    'hazard.storm_surge': 'புயல் அலை',
    'hazard.flooding': 'வெள்ளம்',
    'severity.low': 'குறைவு',
    'severity.medium': 'நடுத்தர',
    'severity.high': 'உயர்',
    'severity.critical': 'முக்கியமான'
  },
  bn: {
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.reports': 'রিপোর্ট',
    'nav.map': 'মানচিত্র',
    'nav.analytics': 'বিশ্লেষণ',
    'common.submit': 'জমা দিন',
    'common.cancel': 'বাতিল',
    'common.save': 'সংরক্ষণ',
    'hazard.tsunami': 'সুনামি',
    'hazard.storm_surge': 'ঝড়ের ঢেউ',
    'hazard.flooding': 'বন্যা',
    'severity.low': 'নিম্ন',
    'severity.medium': 'মাঝারি',
    'severity.high': 'উচ্চ',
    'severity.critical': 'সমালোচনামূলক'
  }
};

class I18nManager {
  private currentLanguage = 'en';

  setLanguage(language: string) {
    if (supportedLanguages.find(lang => lang.code === language)) {
      this.currentLanguage = language;
      if (typeof window !== 'undefined') {
        localStorage.setItem('samudra-setu-language', language);
      }
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  t(key: string, fallback?: string) {
    const currentTranslations = translations[this.currentLanguage as keyof typeof translations];
    if (currentTranslations && currentTranslations[key]) {
      return currentTranslations[key];
    }
    return fallback || key;
  }
}

export const i18n = new I18nManager();
export default I18nManager;