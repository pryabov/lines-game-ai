import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

interface ServiceWorkerState {
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  hasError: boolean;
  errorMessage: string;
  updateServiceWorker: () => void;
}

export function useServiceWorker(): ServiceWorkerState {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [workbox, setWorkbox] = useState<Workbox | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const wb = new Workbox('/service-worker.js');
        setWorkbox(wb);

        // Register the service worker
        wb.register()
          .then(() => {
            console.log('Service worker registered successfully');
            setIsRegistered(true);
          })
          .catch((error) => {
            console.error('Service worker registration failed:', error);
            setHasError(true);
            setErrorMessage(error.message);
          });

        // Listen for updates
        wb.addEventListener('waiting', () => {
          console.log('A new service worker is waiting to be activated');
          setIsUpdateAvailable(true);
        });

        // Listen for success
        wb.addEventListener('activated', () => {
          console.log('Service worker activated successfully');
        });

        // Listen for installation failure - redundant is a valid event
        wb.addEventListener('redundant', (event) => {
          console.error('Service worker became redundant', event);
          setHasError(true);
          setErrorMessage('Service worker installation failed');
        });

        // General error handling
        const handleError = (error: Error) => {
          console.error('Service worker error:', error);
          setHasError(true);
          setErrorMessage(error.message || 'Service worker error occurred');
        };

        // Use try-catch inside event handlers
        wb.addEventListener('installing', () => {
          try {
            console.log('Service worker installing');
          } catch (error) {
            handleError(error as Error);
          }
        });
      } catch (error: any) {
        console.error('Service worker setup failed:', error);
        setHasError(true);
        setErrorMessage(error.message);
      }
    }
  }, []);

  const updateServiceWorker = () => {
    if (workbox && isUpdateAvailable) {
      workbox.addEventListener('controlling', () => {
        console.log('New service worker is active, reloading page for fresh content');
        window.location.reload();
      });

      // Send message to the service worker to skip waiting
      workbox.messageSkipWaiting();
    }
  };

  return {
    isRegistered,
    isUpdateAvailable,
    hasError,
    errorMessage,
    updateServiceWorker,
  };
}
