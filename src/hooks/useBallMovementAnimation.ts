import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { ballMovementAnimationAtom } from '../atoms/gameAtoms';
import { storageService } from '../services/storageService';
import { BallMovementAnimation } from '../types';

export const useBallMovementAnimation = () => {
  const [ballMovementAnimation, setBallMovementAnimation] = useAtom(ballMovementAnimationAtom);

  // Initialize ball movement animation on mount
  useEffect(() => {
    const savedAnimation = storageService.getSetting('ballMovementAnimation');
    setBallMovementAnimation(savedAnimation);
  }, [setBallMovementAnimation]);

  // Save ball movement animation when it changes
  useEffect(() => {
    storageService.setSetting('ballMovementAnimation', ballMovementAnimation);
  }, [ballMovementAnimation]);

  const setBallAnimation = (animation: BallMovementAnimation) => {
    setBallMovementAnimation(animation);
  };

  return {
    ballMovementAnimation,
    setBallAnimation,
  };
};
