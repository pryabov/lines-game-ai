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
    }
  }, []);

  const handleAccept = () => {
    analytics.trackConsentChoice(true);
    setShowConsentDialog(false);
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