import React, { useState, useEffect } from 'react';
import analytics from '../services/analytics';

const OfflineNotice: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        // Track coming back online
        analytics.trackEvent({ eventName: 'app_online' });
      }
      setIsOffline(false);
    };

    const handleOffline = () => {
      if (!isOffline) {
        // Track going offline
        analytics.trackOfflineMode();
      }
      setIsOffline(true);
    };

    // Initiate tracking for initial state
    if (isOffline && !wasOffline) {
      analytics.trackOfflineMode();
      setWasOffline(true);
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('app-online', handleOnline);
    document.addEventListener('app-offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('app-online', handleOnline);
      document.removeEventListener('app-offline', handleOffline);
    };
  }, [isOffline, wasOffline]);

  if (!isOffline) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#f44336',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 9999,
        textAlign: 'center',
        fontWeight: 'bold'
      }}
    >
      You are currently offline. Game progress will be saved locally.
    </div>
  );
};

export default OfflineNotice; 