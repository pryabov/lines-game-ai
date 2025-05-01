import React, { useEffect, useState } from 'react';
import '../styles/ConsentDialog.scss';

interface ConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentDialog: React.FC<ConsentDialogProps> = ({ onAccept, onDecline }) => {
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
          <h3>Analytics Consent</h3>
        </div>
        <div className="consent-content">
          <p>
            We use analytics to improve your game experience and track how our game is used.
            This helps us make better decisions about game features and improvements.
          </p>
          <p>
            We collect anonymous data about game usage, such as scores, theme preferences,
            and game events. We do not collect any personal information.
          </p>
        </div>
        <div className="consent-actions">
          <button 
            className="consent-button decline-button" 
            onClick={() => handleClose(false)}
          >
            Decline
          </button>
          <button 
            className="consent-button accept-button" 
            onClick={() => handleClose(true)}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentDialog; 