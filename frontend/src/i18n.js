import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationRU from './locales/ru.json';
import translationKK from './locales/kk.json';
import translationEN from './locales/en.json';

const resources = {
  ru: { translation: translationRU },
  kk: { translation: translationKK },
  en: { translation: translationEN }
};

const savedLanguage = localStorage.getItem('appLanguage') || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  });

// Слушаем изменения языка чтобы сохранять их в localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('appLanguage', lng);
});

export default i18n;
