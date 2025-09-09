import { useState, useEffect, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Distance minimale pour déclencher le geste
  verticalThreshold?: number; // Seuil vertical maximal pour considérer comme swipe horizontal
}

export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const { onSwipeLeft, onSwipeRight, threshold = 50, verticalThreshold = 30 } = options;
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    
    // Vérifier que le mouvement est principalement horizontal
    // ET que le mouvement vertical reste faible (pas un scroll)
    const isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY);
    const isNotVerticalScroll = Math.abs(deltaY) < verticalThreshold;
    const isSignificantHorizontalMovement = Math.abs(deltaX) > threshold;
    
    if (isHorizontalGesture && isNotVerticalScroll && isSignificantHorizontalMovement) {
      if (deltaX > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  }, [touchStart, touchEnd, threshold, verticalThreshold, onSwipeLeft, onSwipeRight]);

  const attachSwipeListeners = useCallback((element: HTMLElement | null): (() => void) | undefined => {
    if (!element) return undefined;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { attachSwipeListeners };
};
