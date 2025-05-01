import React from 'react';
import { useServiceWorker } from '../hooks/useServiceWorker';

const UpdateNotification: React.FC = () => {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4285f4',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        maxWidth: '90%',
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <div style={{ marginBottom: '8px', textAlign: 'center' }}>
        A new version of Lines Game is available!
      </div>
      <button
        onClick={updateServiceWorker}
        style={{
          backgroundColor: 'white',
          color: '#4285f4',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Update Now
      </button>
    </div>
  );
};

export default UpdateNotification; 