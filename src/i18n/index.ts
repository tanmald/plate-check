import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ptPT from "./locales/pt-PT.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      "pt-PT": { translation: ptPT },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "pt-PT"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "platecheck_lang",
      cacheUserLanguage: true,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
