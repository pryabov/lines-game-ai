import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/ConsentDialog.scss';

interface ConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentDialog: React.FC<ConsentDialogProps> = ({ onAccept, onDecline }) => {
  const { translations } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Add animation when closing
  const handleClose = (accepted: boolean) => {
    setIsClosing(true);

    // Wait for animation to complete
    setTimeout(() => {
      setIsVisible(false);
      if (accepted) {
        onAccept();
      } else {
        onDecline();
      }
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`consent-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`consent-container ${isClosing ? 'closing' : ''}`}>
        <div className="consent-header">
          <h3>{translations.consentDialog.title}</h3>
        </div>
        <div className="consent-content">
          <p>{translations.consentDialog.description1}</p>
          <p>{translations.consentDialog.description2}</p>
          <p>{translations.consentDialog.description3}</p>
        </div>
        <div className="consent-actions">
          <button className="consent-button decline-button" onClick={() => handleClose(false)}>
            {translations.consentDialog.decline}
          </button>
          <button className="consent-button accept-button" onClick={() => handleClose(true)}>
            {translations.consentDialog.accept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentDialog;
