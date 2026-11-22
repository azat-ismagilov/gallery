import { useEffect, useRef } from "react";

export const DEFAULT_SLIDESHOW_INTERVAL_MS = 3000;

export interface SlideshowGuardInput {
  active: boolean;
  paused: boolean;
  totalItems: number;
  hasMore: boolean;
}

/**
 * Pure guard determining whether the slideshow timer should run.
 * Avoids firing empty intervals when paused, editing, or when only a single photo exists.
 */
export function shouldRunSlideshow({
  active,
  paused,
  totalItems,
  hasMore,
}: SlideshowGuardInput): boolean {
  if (!active || paused) {
    return false;
  }
  return totalItems > 1 || hasMore;
}

interface UseSlideshowOptions extends SlideshowGuardInput {
  /** Changing this key resets the countdown timer (e.g. when the user manually flips photos). */
  resetKey: number | string | null;
  onAdvance: () => void;
  intervalMs?: number;
}

export function useSlideshow({
  active,
  paused,
  totalItems,
  hasMore,
  resetKey,
  onAdvance,
  intervalMs = DEFAULT_SLIDESHOW_INTERVAL_MS,
}: UseSlideshowOptions): void {
  const onAdvanceRef = useRef(onAdvance);

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  const running = shouldRunSlideshow({ active, paused, totalItems, hasMore });

  useEffect(() => {
    if (!running || resetKey === null) {
      return;
    }

    const timer = window.setInterval(() => {
      onAdvanceRef.current();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [running, resetKey, intervalMs]);
}
