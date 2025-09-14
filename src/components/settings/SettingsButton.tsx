import React, { useState } from 'react';
import SettingsDialog from './SettingsDialog';

const SettingsButton: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <>
      <button 
        className="settings-button" 
        onClick={openSettings}
        aria-label="Open settings"
      >
        <i className="fas fa-cog settings-icon"></i>
      </button>
      <SettingsDialog isOpen={isSettingsOpen} onClose={closeSettings} />
    </>
  );
};

export default SettingsButton;
