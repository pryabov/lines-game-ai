/**
 * Analytics service to track game events
 * This provides a wrapper around Google Analytics with optional Cloudflare Analytics support
 */

interface GameEvent {
  eventName: string;
  data?: Record<string, any>;
}

// Local storage keys
const ANALYTICS_CONSENT_KEY = 'analytics_consent';
const GA_MEASUREMENT_ID = 'G-4W51MVRRH5'; // Replace with your actual Google Analytics measurement ID

// Function to load GA script dynamically after consent
const loadGoogleAnalytics = (): void => {
  if (typeof window === 'undefined' || document.getElementById('ga-script')) {
    return;
  }

  // Create script tags and append to head
  const gaScript = document.createElement('script');
  gaScript.id = 'ga-script';
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  gaScript.async = true;
  gaScript.crossOrigin = 'anonymous'; // Add crossOrigin attribute

  const inlineScript = document.createElement('script');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { 
      anonymize_ip: true,
      send_page_view: true
    });
  `;

  // Add error handling for script loading
  gaScript.onerror = (error) => {
    console.error('Failed to load Google Analytics:', error);
    // Remove the failed script
    gaScript.remove();
    inlineScript.remove();
  };

  document.head.appendChild(gaScript);
  document.head.appendChild(inlineScript);
};

// Check if user has consented to analytics
export const hasUserConsent = (): boolean => {
  const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return consent === 'accepted';
};

// Save user's consent choice
export const saveUserConsent = (accepted: boolean): void => {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, accepted ? 'accepted' : 'declined');

  // If user accepted, load Google Analytics
  if (accepted) {
    loadGoogleAnalytics();
  } else {
    // If user declined, disable tracking and clear any existing cookies
    if (typeof window !== 'undefined') {
      // Disable GA tracking - the 'ga-disable-{GA_ID}' is a standard GA feature
      (window as any)['ga-disable-' + GA_MEASUREMENT_ID] = true;
    }
  }
};

// Check if analytics consent has been answered
export const hasAnsweredConsent = (): boolean => {
  return localStorage.getItem(ANALYTICS_CONSENT_KEY) !== null;
};

// Check if Google Analytics is available
const isGoogleAnalyticsAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
};

// Track a game event
export const trackEvent = (event: GameEvent): void => {
  try {
    // In development mode, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`Analytics (dev): ${event.eventName}`, event.data);
      return;
    }

    // Skip tracking if user hasn't consented (unless it's the consent event itself)
    if (!hasUserConsent() && event.eventName !== 'analytics_consent_choice') {
      return;
    }

    // Only log analytics events in production if debug mode is enabled
    if (
      process.env.NODE_ENV === 'production' &&
      localStorage.getItem('debug_analytics') === 'true'
    ) {
      console.log(`Analytics: ${event.eventName}`, event.data);
    }

    // Google Analytics tracking
    if (isGoogleAnalyticsAvailable()) {
      try {
        // Convert to camelCase for GA event names (replace underscores with camelCase)
        const gtagEventName = event.eventName.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );

        (window as any).gtag('event', gtagEventName, {
          ...event.data,
          event_category: 'game',
          non_interaction: event.eventName.startsWith('view_'),
          send_to: GA_MEASUREMENT_ID,
        });
      } catch (gaError) {
        console.error('Failed to send event to Google Analytics:', gaError);
      }
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Track analytics consent choice
export const trackConsentChoice = (accepted: boolean): void => {
  // Save the user's choice
  saveUserConsent(accepted);

  // Track the choice (this is one event we'll track regardless of consent)
  trackEvent({
    eventName: 'analytics_consent_choice',
    data: { accepted },
  });
};

// Game-specific tracking events
export const trackGameStart = (): void => {
  trackEvent({ eventName: 'game_start' });
};

export const trackGameOver = (score: number): void => {
  trackEvent({
    eventName: 'game_over',
    data: { score },
  });
};

export const trackScoreChanged = (score: number): void => {
  trackEvent({
    eventName: 'score_changed',
    data: { score },
  });
};

export const trackLineCompleted = (lineLength: number): void => {
  trackEvent({
    eventName: 'line_completed',
    data: { lineLength },
  });
};

export const trackBallMoved = (from: string, to: string): void => {
  trackEvent({
    eventName: 'ball_moved',
    data: { from, to },
  });
};

export const trackThemeChanged = (theme: string): void => {
  trackEvent({
    eventName: 'theme_changed',
    data: { theme },
  });
};

export const trackDifficultyChanged = (difficulty: string): void => {
  trackEvent({
    eventName: 'difficulty_changed',
    data: { difficulty },
  });
};

export const trackAppInstalled = (): void => {
  trackEvent({ eventName: 'app_installed' });
};

export const trackOfflineMode = (): void => {
  trackEvent({ eventName: 'offline_mode' });
};

export const trackPageView = (page: string): void => {
  trackEvent({
    eventName: 'page_view',
    data: { page },
  });
};

export default {
  trackEvent,
  trackGameStart,
  trackGameOver,
  trackScoreChanged,
  trackLineCompleted,
  trackBallMoved,
  trackThemeChanged,
  trackDifficultyChanged,
  trackAppInstalled,
  trackOfflineMode,
  trackPageView,
  hasUserConsent,
  hasAnsweredConsent,
  saveUserConsent,
  trackConsentChoice,
};
