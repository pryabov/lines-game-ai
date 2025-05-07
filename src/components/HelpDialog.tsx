import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/HelpDialog.scss';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="dialog-container help-dialog">
        <div className="dialog-header help-dialog-header">
          <h2>{t.helpDialog.title}</h2>
        </div>
        <div className="dialog-content">
          <h3>{t.helpDialog.rules}</h3>
          <ul>
            {t.helpDialog.rulesItems.map((item, index) => (
              <li key={`rule-${index}`}>{item}</li>
            ))}
          </ul>
          
          <h3>{t.helpDialog.scoring}</h3>
          <ul>
            {t.helpDialog.scoringItems.map((item, index) => (
              <li key={`scoring-${index}`}>{item}</li>
            ))}
          </ul>
          
          <h3>{t.helpDialog.tips}</h3>
          <ul>
            {t.helpDialog.tipsItems.map((item, index) => (
              <li key={`tip-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="dialog-actions">
          <button className="primary-button" onClick={onClose}>
            {t.helpDialog.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpDialog; 