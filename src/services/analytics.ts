/**
 * Analytics service to track game events
 * This provides a wrapper around Cloudflare Analytics with custom event tracking
 */

interface GameEvent {
  eventName: string;
  data?: Record<string, any>;
}

// Local storage keys
const ANALYTICS_CONSENT_KEY = 'analytics_consent';

// Check if user has consented to analytics
export const hasUserConsent = (): boolean => {
  const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return consent === 'accepted';
};

// Save user's consent choice
export const saveUserConsent = (accepted: boolean): void => {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, accepted ? 'accepted' : 'declined');
};

// Check if analytics consent has been answered
export const hasAnsweredConsent = (): boolean => {
  return localStorage.getItem(ANALYTICS_CONSENT_KEY) !== null;
};

// Check if Cloudflare analytics is available
const isCloudflareAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'cfe' in window;
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
    
    console.log(`Analytics: ${event.eventName}`, event.data);

    // Try to use Cloudflare's event tracking if available
    if (isCloudflareAvailable()) {
      // @ts-ignore - Cloudflare's API is not typed
      window.cfe?.beacon?.('event', {
        name: event.eventName,
        ...(event.data || {})
      });
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
    data: { accepted }
  });
};

// Game-specific tracking events
export const trackGameStart = (): void => {
  trackEvent({ eventName: 'game_start' });
};

export const trackGameOver = (score: number): void => {
  trackEvent({ 
    eventName: 'game_over', 
    data: { score } 
  });
};

export const trackScoreChanged = (score: number): void => {
  trackEvent({ 
    eventName: 'score_changed', 
    data: { score } 
  });
};

export const trackLineCompleted = (lineLength: number): void => {
  trackEvent({ 
    eventName: 'line_completed', 
    data: { lineLength } 
  });
};

export const trackBallMoved = (): void => {
  trackEvent({ eventName: 'ball_moved' });
};

export const trackThemeChanged = (theme: string): void => {
  trackEvent({ 
    eventName: 'theme_changed', 
    data: { theme } 
  });
};

export const trackAppInstalled = (): void => {
  trackEvent({ eventName: 'app_installed' });
};

export const trackOfflineMode = (): void => {
  trackEvent({ eventName: 'offline_mode' });
};

export default {
  trackEvent,
  trackGameStart,
  trackGameOver,
  trackScoreChanged,
  trackLineCompleted,
  trackBallMoved,
  trackThemeChanged,
  trackAppInstalled,
  trackOfflineMode,
  hasUserConsent,
  hasAnsweredConsent,
  saveUserConsent,
  trackConsentChoice
}; 