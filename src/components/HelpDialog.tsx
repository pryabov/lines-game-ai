import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/HelpDialog.scss';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  const { translations } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="dialog-container help-dialog">
        <div className="dialog-header help-dialog-header">
          <h2>{translations.helpDialog.title}</h2>
        </div>
        <div className="dialog-content">
          <h3>{translations.helpDialog.rules}</h3>
          <ul>
            {translations.helpDialog.rulesItems.map((item, index) => (
              <li key={`rule-${index}`}>{item}</li>
            ))}
          </ul>
          
          <h3>{translations.helpDialog.scoring}</h3>
          <ul>
            {translations.helpDialog.scoringItems.map((item, index) => (
              <li key={`scoring-${index}`}>{item}</li>
            ))}
          </ul>
          
          <h3>{translations.helpDialog.tips}</h3>
          <ul>
            {translations.helpDialog.tipsItems.map((item, index) => (
              <li key={`tip-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="dialog-actions">
          <button className="primary-button" onClick={onClose}>
            {translations.helpDialog.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpDialog; 