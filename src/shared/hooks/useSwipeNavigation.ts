import { type TouchEvent, useCallback, useRef } from "react";

export type SwipeDirection = "next" | "prev" | null;

const MIN_SWIPE_DISTANCE_PX = 50;
const HORIZONTAL_DOMINANCE_RATIO = 1.5;

/**
 * Pure gesture classifier that recognizes deliberate horizontal swipes while
 * ignoring short taps and vertical scrolls (so scrolling down to the mobile
 * Lightroom-style info sidebar remains smooth and unobstructed).
 */
export function detectHorizontalSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): SwipeDirection {
  const dx = endX - startX;
  const dy = endY - startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX < MIN_SWIPE_DISTANCE_PX) {
    return null;
  }
  if (absX < absY * HORIZONTAL_DOMINANCE_RATIO) {
    return null;
  }

  return dx < 0 ? "next" : "prev";
}

interface UseSwipeNavigationOptions {
  enabled: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function useSwipeNavigation({
  enabled,
  onNext,
  onPrev,
}: UseSwipeNavigationOptions) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 1) {
        touchStartRef.current = null;
        return;
      }
      const touch = e.touches[0];
      if (touch) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!enabled || !start || e.changedTouches.length !== 1) {
        return;
      }
      const touch = e.changedTouches[0];
      if (!touch) {
        return;
      }
      const direction = detectHorizontalSwipe(
        start.x,
        start.y,
        touch.clientX,
        touch.clientY,
      );
      if (direction === "next") {
        onNext();
      } else if (direction === "prev") {
        onPrev();
      }
    },
    [enabled, onNext, onPrev],
  );

  return { onTouchStart, onTouchEnd };
}
