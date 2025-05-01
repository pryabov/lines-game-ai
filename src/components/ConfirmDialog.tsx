import React from 'react';
import '../styles/ConfirmDialog.scss';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="dialog-content">
          <p>{message}</p>
        </div>
        <div className="dialog-actions">
          <button 
            className="dialog-button cancel-button" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="dialog-button confirm-button" 
            onClick={onConfirm}
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 