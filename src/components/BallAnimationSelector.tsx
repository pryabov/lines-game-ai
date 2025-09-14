import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { ballMovementAnimationAtom } from '../atoms/gameAtoms';
import { useLanguage } from '../hooks/useLanguage';
import { BallMovementAnimation } from '../types';
import '../styles/BallAnimationSelector.scss';

const BallAnimationSelector: React.FC = () => {
  const [selectedAnimation, setSelectedAnimation] = useAtom(ballMovementAnimationAtom);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const animationOptions: { value: BallMovementAnimation; label: string }[] = [
    { value: 'step-by-step', label: t.settingsDialog.ballAnimationStepByStep },
    { value: 'show-path-then-move', label: t.settingsDialog.ballAnimationShowPath },
    { value: 'instant-move', label: t.settingsDialog.ballAnimationInstant },
  ];

  const selectedOption = animationOptions.find(option => option.value === selectedAnimation);

  const handleSelect = (animation: BallMovementAnimation) => {
    setSelectedAnimation(animation);
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
              className={`animation-option ${option.value === selectedAnimation ? 'active' : ''}`}
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
