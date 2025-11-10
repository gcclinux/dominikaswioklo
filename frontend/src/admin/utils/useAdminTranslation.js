import { useLanguage } from '../../context/LanguageContext';
import { useState, useEffect } from 'react';

// Simple in-memory cache to avoid refetching translations for each component
// Structure: { [language]: translationsObject }
const translationCache = {};

/**
 * Custom hook for admin panel translations
 * Loads admin-specific translation files and provides translation function
 */
export function useAdminTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      // If we already have cached translations for this language, use them
      if (translationCache[language]) {
        setTranslations(translationCache[language]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/locales/${language}/admin.json`);
        if (response.ok) {
          const data = await response.json();
          translationCache[language] = data;
          setTranslations(data);
        } else {
          console.error(`Failed to load ${language} admin translations`);
          // Fallback to English if current language fails
          if (language !== 'en') {
            const fallbackResponse = await fetch('/locales/en/admin.json');
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              translationCache['en'] = fallbackData;
              setTranslations(fallbackData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading admin translations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  /**
   * Get translation by key path (e.g., 'dashboard.title' or 'tiles.settings.title')
   * @param {string} key - Dot-separated path to translation
   * @param {object} replacements - Optional object with placeholder replacements
   * @returns {string} - Translated text or key if not found
   */
  const t = (key, replacements = {}) => {
    if (!key) return '';
    // While translations are still loading, return the key (no warning)
    if (loading) return key;
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Suppress noisy warnings: only warn when we actually finished loading
        // and the key is missing from the final translations object
        if (!loading) {
          console.warn(`Translation key not found: ${key}`);
        }
        return key;
      }
    }
    
    // Handle placeholder replacements
    if (typeof value === 'string' && Object.keys(replacements).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
        return replacements[placeholder] !== undefined ? replacements[placeholder] : match;
      });
    }
    
    return value || key;
  };

  return { t, language, loading };
}
