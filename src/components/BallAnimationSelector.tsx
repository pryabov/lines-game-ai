import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useBallMovementAnimation } from '../hooks/useBallMovementAnimation';
import { BallMovementAnimation } from '../types';
import '../styles/BallAnimationSelector.scss';

const BallAnimationSelector: React.FC = () => {
  const { ballMovementAnimation, setBallAnimation } = useBallMovementAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const { translations } = useLanguage();

  const animationOptions: { value: BallMovementAnimation; label: string }[] = [
    { value: 'step-by-step', label: translations.settingsDialog.ballAnimationStepByStep },
    { value: 'show-path-then-move', label: translations.settingsDialog.ballAnimationShowPath },
    { value: 'instant-move', label: translations.settingsDialog.ballAnimationInstant },
  ];

  const selectedOption = animationOptions.find(option => option.value === ballMovementAnimation);

  const handleSelect = (animation: BallMovementAnimation) => {
    setBallAnimation(animation);
    setIsOpen(false);
  };

  return (
    <div className="ball-animation-selector">
      <button
        className="animation-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select ball movement animation"
      >
        <span className="animation-label">{selectedOption?.label}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} animation-arrow`}></i>
      </button>
      
      {isOpen && (
        <div className="animation-dropdown">
          {animationOptions.map((option) => (
            <button
              key={option.value}
              className={`animation-option ${option.value === ballMovementAnimation ? 'active' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <span className="option-name">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BallAnimationSelector;
