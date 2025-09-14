import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import ThemeToggle from '../ThemeToggle';
import LanguageSelector from '../LanguageSelector';
import BallAnimationSelector from '../BallAnimationSelector';
import './styles/SettingsDialog.scss';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { translations } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="dialog-container settings-dialog">
        <div className="dialog-header settings-dialog-header">
          <h2>{translations.settingsDialog.title}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>
        <div className="dialog-content">
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-label">{translations.settingsDialog.selectLanguage}</span>
              <LanguageSelector />
            </div>
            <div className="setting-item">
              <span className="setting-label">{translations.settingsDialog.theme}</span>
              <ThemeToggle />
            </div>
            <div className="setting-item">
              <span className="setting-label">{translations.settingsDialog.ballAnimation}</span>
              <BallAnimationSelector />
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="primary-button" onClick={onClose}>
            {translations.settingsDialog.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
