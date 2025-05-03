import React, { useState, useEffect } from 'react';
import ConsentDialog from './ConsentDialog';
import analytics from '../services/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  useEffect(() => {
    // Check if the user has already answered the consent
    if (!analytics.hasAnsweredConsent()) {
      setShowConsentDialog(true);
    } else if (analytics.hasUserConsent()) {
      // If user has already consented, make sure we initialize analytics
      // This helps when the page is refreshed or revisited
      analytics.saveUserConsent(true);
      
      // Track page view on initial load
      analytics.trackPageView(window.location.pathname);
    }
  }, []);

  // Track page views when the route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (analytics.hasUserConsent()) {
        analytics.trackPageView(window.location.pathname);
      }
    };

    // Initial page view
    if (analytics.hasUserConsent()) {
      analytics.trackPageView(window.location.pathname);
    }

    // Listen for hash changes (for hash-based routing)
    window.addEventListener('hashchange', handleRouteChange);
    
    // Clean up
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const handleAccept = () => {
    analytics.trackConsentChoice(true);
    setShowConsentDialog(false);
    
    // Track initial page view after consent
    analytics.trackPageView(window.location.pathname);
  };

  const handleDecline = () => {
    analytics.trackConsentChoice(false);
    setShowConsentDialog(false);
  };

  return (
    <>
      {children}
      {showConsentDialog && (
        <ConsentDialog 
          onAccept={handleAccept} 
          onDecline={handleDecline} 
        />
      )}
    </>
  );
};

export default AnalyticsProvider; 