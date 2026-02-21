import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Locale files
import en from './locales/en.json'
import hi from './locales/hi.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',    nativeLabel: 'English',   flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',      nativeLabel: 'हिंदी',       flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',    nativeLabel: 'मराठी',       flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்',       flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',     nativeLabel: 'తెలుగు',      flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali',    nativeLabel: 'বাংলা',       flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati',   nativeLabel: 'ગુજરાતી',     flag: '🇮🇳' },
] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      // Add mr, ta, te, bn, gu locale files as they are translated
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'medicare-lang',
    },
  })

export default i18n
