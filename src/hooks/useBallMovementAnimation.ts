import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { ballMovementAnimationAtom } from '../atoms/gameAtoms';
import { storageService } from '../services/storageService';
import { BallMovementAnimation } from '../types';

export const useBallMovementAnimation = () => {
  const [ballMovementAnimation, setBallMovementAnimation] = useAtom(ballMovementAnimationAtom);
  const isInitializedRef = useRef(false);

  // Initialize ball movement animation on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedAnimation = storageService.getSetting('ballMovementAnimation');
      setBallMovementAnimation(savedAnimation);
      isInitializedRef.current = true;
    }
  }, [setBallMovementAnimation]);

  // Save ball movement animation when it changes (but not on initial load)
  useEffect(() => {
    if (isInitializedRef.current) {
      storageService.setSetting('ballMovementAnimation', ballMovementAnimation);
    }
  }, [ballMovementAnimation]);

  const setBallAnimation = (animation: BallMovementAnimation) => {
    setBallMovementAnimation(animation);
  };

  return {
    ballMovementAnimation,
    setBallAnimation,
  };
};
