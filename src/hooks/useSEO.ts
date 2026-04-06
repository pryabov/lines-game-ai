import { useEffect } from 'react';
import { useLanguage } from './useLanguage';
import { Language } from '../translations';

const SITE_URL = 'https://lines98.fun';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'ru', 'es', 'de', 'pl', 'zh', 'ja'];

const LOCALE_MAP: Record<Language, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  es: 'es_ES',
  de: 'de_DE',
  pl: 'pl_PL',
  zh: 'zh_CN',
  ja: 'ja_JP',
};

const getLanguageUrl = (lang: Language): string => {
  return lang === 'en' ? `${SITE_URL}/` : `${SITE_URL}/?lang=${lang}`;
};

const setMetaContent = (selector: string, content: string) => {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute('content', content);
  }
};

export const useSEO = () => {
  const { language, translations } = useLanguage();

  useEffect(() => {
    // Update title
    document.title = translations.seo.title;

    // Update meta description
    setMetaContent('meta[name="description"]', translations.seo.description);

    // Update Open Graph tags
    setMetaContent('meta[property="og:title"]', translations.seo.ogTitle);
    setMetaContent('meta[property="og:description"]', translations.seo.description);
    setMetaContent('meta[property="og:url"]', getLanguageUrl(language));

    // Update Twitter Card tags
    setMetaContent('meta[name="twitter:title"]', translations.seo.ogTitle);
    setMetaContent('meta[name="twitter:description"]', translations.seo.description);

    // Update og:locale
    setMetaContent('meta[property="og:locale"]', LOCALE_MAP[language]);

    // Update canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', getLanguageUrl(language));
    }
  }, [language, translations]);

  // Inject hreflang tags (once, then update if needed)
  useEffect(() => {
    // Remove any existing hreflang links
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());

    // Add hreflang for each language
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = getLanguageUrl(lang);
      link.setAttribute('data-hreflang', 'true');
      document.head.appendChild(link);
    });

    // Add x-default
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${SITE_URL}/`;
    xDefault.setAttribute('data-hreflang', 'true');
    document.head.appendChild(xDefault);

    // Add og:locale:alternate for other languages
    document.querySelectorAll('meta[data-og-locale-alt]').forEach((el) => el.remove());
    SUPPORTED_LANGUAGES.filter((lang) => lang !== language).forEach((lang) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:locale:alternate');
      meta.setAttribute('content', LOCALE_MAP[lang]);
      meta.setAttribute('data-og-locale-alt', 'true');
      document.head.appendChild(meta);
    });

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
      document.querySelectorAll('meta[data-og-locale-alt]').forEach((el) => el.remove());
    };
  }, [language]);
};
