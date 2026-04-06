import React from 'react';
import { act } from '@testing-library/react';
import App from '../../App';
import { en } from '../../translations/en';

const ANALYTICS_CONSENT_KEY = 'analytics_consent';

// Use real render since App has its own providers
const render = (ui: React.ReactElement) => require('@testing-library/react').render(ui);

describe('SEO: Dynamic meta tags and hreflang', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    // Pre-accept analytics to skip consent dialog
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'accepted');
    // Clean up any hreflang links from previous tests
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());
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
});
