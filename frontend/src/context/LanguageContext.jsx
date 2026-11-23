import React, { createContext, useContext, useState, useEffect } from 'react';
import { strings } from '../i18n/strings';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('fibyti_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('fibyti_lang', lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key) => {
    return strings[lang]?.[key] || strings['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
