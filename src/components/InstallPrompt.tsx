import React, { useState, useEffect } from 'react';
import analytics from '../services/analytics';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Function to detect if we're on a mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    // Don't show install prompt on desktop browsers
    if (!isMobileDevice()) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowPrompt(true);

      // Track that the install prompt was shown
      analytics.trackEvent({ eventName: 'install_prompt_shown' });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
      // Track that the app is already installed
      analytics.trackEvent({ eventName: 'app_already_installed' });
    }

    // Track app installed events
    const handleAppInstalled = () => {
      analytics.trackAppInstalled();
      setShowPrompt(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Track that the user clicked install
    analytics.trackEvent({ eventName: 'install_button_clicked' });

    // Show the browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        analytics.trackEvent({ eventName: 'install_accepted' });
      } else {
        console.log('User dismissed the install prompt');
        analytics.trackEvent({ eventName: 'install_rejected' });
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  const handleDismiss = () => {
    // Track that the user dismissed the prompt
    analytics.trackEvent({ eventName: 'install_prompt_dismissed' });

    setShowPrompt(false);
    // Store in local storage that the user dismissed the prompt
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 9998,
        maxWidth: '90%',
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        Install Lines Game on your device for the best experience!
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: 'white',
            color: '#4CAF50',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Not Now
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
