import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'jotai';
import { LanguageProvider } from '../../hooks/useLanguage';
import AnalyticsProvider from '../../components/AnalyticsProvider';

/**
 * Wraps component in Jotai Provider + LanguageProvider.
 * Skips AnalyticsProvider to avoid consent dialog unless explicitly requested.
 */
const MinimalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider>
    <LanguageProvider>{children}</LanguageProvider>
  </Provider>
);

/**
 * Full provider tree including AnalyticsProvider (shows consent dialog on first visit).
 */
const FullProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider>
    <LanguageProvider>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </LanguageProvider>
  </Provider>
);

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: MinimalProviders, ...options });

export const renderWithFullProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: FullProviders, ...options });
