import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import '../styles/SettingsDialog.scss';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="dialog-container settings-dialog">
        <div className="dialog-header settings-dialog-header">
          <h2>{t.settingsDialog.title}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>
        <div className="dialog-content">
          <div className="settings-section">
            <h3>{t.settingsDialog.appearance}</h3>
            <div className="setting-item">
              <span className="setting-label">{t.settingsDialog.theme}</span>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="settings-section">
            <h3>{t.settingsDialog.language}</h3>
            <div className="setting-item">
              <span className="setting-label">{t.settingsDialog.selectLanguage}</span>
              <LanguageSelector />
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="primary-button" onClick={onClose}>
            {t.settingsDialog.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
