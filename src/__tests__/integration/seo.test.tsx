import React from 'react';
import { act } from '@testing-library/react';
import App from '../../App';
import { en } from '../../translations/en';
import { ru } from '../../translations/ru';

const ANALYTICS_CONSENT_KEY = 'analytics_consent';
const SETTINGS_KEY = 'lines-game-settings';

// Use real render since App has its own providers
const render = (ui: React.ReactElement) => require('@testing-library/react').render(ui);

// Helper to create a meta tag in the document head (simulates static HTML)
const ensureMetaTag = (property: string, content: string, attr: string = 'property') => {
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    el.setAttribute('content', content);
    document.head.appendChild(el);
  }
  return el;
};

// Helper to create a link tag in the document head
const ensureLinkTag = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute('href', href);
    document.head.appendChild(el);
  }
  return el;
};

describe('SEO: Dynamic meta tags and hreflang', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    // Pre-accept analytics to skip consent dialog
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'accepted');
    // Clean up injected SEO elements from previous tests
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
    document.querySelectorAll('meta[data-og-locale-alt]').forEach((el) => el.remove());
    // Ensure required meta tags exist (simulates static index.html)
    ensureMetaTag('og:title', '', 'property');
    ensureMetaTag('og:description', '', 'property');
    ensureMetaTag('og:url', '', 'property');
    ensureMetaTag('og:locale', 'en_US', 'property');
    ensureMetaTag('description', '', 'name');
    ensureMetaTag('twitter:title', '', 'name');
    ensureMetaTag('twitter:description', '', 'name');
    ensureLinkTag('canonical', '');
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
    document.querySelectorAll('meta[data-og-locale-alt]').forEach((el) => el.remove());
  });

  it('sets document title from SEO translations', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(document.title).toBe(en.seo.title);
  });

  it('injects hreflang links for all 7 languages + x-default', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const hreflangLinks = document.querySelectorAll('link[data-hreflang]');
    // 7 languages + x-default = 8
    expect(hreflangLinks).toHaveLength(8);
  });

  it('sets correct hreflang URLs', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const getHreflangHref = (lang: string) => {
      const link = document.querySelector(`link[hreflang="${lang}"]`);
      return link?.getAttribute('href');
    };

    expect(getHreflangHref('en')).toBe('https://lines98.fun/');
    expect(getHreflangHref('ru')).toBe('https://lines98.fun/?lang=ru');
    expect(getHreflangHref('es')).toBe('https://lines98.fun/?lang=es');
    expect(getHreflangHref('de')).toBe('https://lines98.fun/?lang=de');
    expect(getHreflangHref('pl')).toBe('https://lines98.fun/?lang=pl');
    expect(getHreflangHref('zh')).toBe('https://lines98.fun/?lang=zh');
    expect(getHreflangHref('ja')).toBe('https://lines98.fun/?lang=ja');
    expect(getHreflangHref('x-default')).toBe('https://lines98.fun/');
  });

  it('sets html lang attribute to current language', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(document.documentElement.lang).toBe('en');
  });

  it('updates meta description from SEO translations', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const desc = document.querySelector('meta[name="description"]');
    expect(desc?.getAttribute('content')).toBe(en.seo.description);
  });

  it('updates og:title and og:description', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      en.seo.ogTitle
    );
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content')
    ).toBe(en.seo.description);
  });

  it('updates canonical URL for English to bare path with trailing slash', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://lines98.fun/');
  });

  it('sets og:locale to en_US for English', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const locale = document.querySelector('meta[property="og:locale"]');
    expect(locale?.getAttribute('content')).toBe('en_US');
  });

  it('injects og:locale:alternate tags for other languages', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const altLocales = document.querySelectorAll('meta[data-og-locale-alt]');
    // Current language is EN, so 6 alternates (all except EN)
    expect(altLocales).toHaveLength(6);
  });
});

describe('SEO: Non-English language via ?lang= URL', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'accepted');
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
    document.querySelectorAll('meta[data-og-locale-alt]').forEach((el) => el.remove());
    ensureMetaTag('og:title', '', 'property');
    ensureMetaTag('og:description', '', 'property');
    ensureMetaTag('og:url', '', 'property');
    ensureMetaTag('og:locale', 'en_US', 'property');
    ensureMetaTag('description', '', 'name');
    ensureMetaTag('twitter:title', '', 'name');
    ensureMetaTag('twitter:description', '', 'name');
    ensureLinkTag('canonical', '');
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
    document.querySelectorAll('meta[data-og-locale-alt]').forEach((el) => el.remove());
  });

  it('uses Russian when language is set to ru in localStorage', () => {
    // Simulate a returning user with Russian preference
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: 'ru' }));

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    // Title should be Russian
    expect(document.title).toBe(ru.seo.title);
  });

  it('sets Russian meta description when language is ru', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: 'ru' }));

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const desc = document.querySelector('meta[name="description"]');
    expect(desc?.getAttribute('content')).toBe(ru.seo.description);
  });

  it('sets canonical to ?lang=ru for Russian', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: 'ru' }));

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://lines98.fun/?lang=ru');
  });

  it('sets og:locale to ru_RU for Russian', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: 'ru' }));

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    const locale = document.querySelector('meta[property="og:locale"]');
    expect(locale?.getAttribute('content')).toBe('ru_RU');
  });

  it('sets html lang to ru for Russian', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: 'ru' }));

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(document.documentElement.lang).toBe('ru');
  });

  it('sets Russian og:title and og:description', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: 'ru' }));

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      ru.seo.ogTitle
    );
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content')
    ).toBe(ru.seo.description);
  });
});
