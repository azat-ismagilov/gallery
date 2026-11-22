import { useCallback, useEffect, useRef, useState } from "react";

import { getPhotoById } from "@/services/flickrApi";
import type { GalleryPhotoItem, Photo } from "@/types/gallery";
import { getNextPhotoIndex, getPrevPhotoIndex } from "@/utils/gallerySections";

const PREFETCH_THRESHOLD = 5;

interface UseGalleryNavigationOptions {
  items: readonly GalleryPhotoItem[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => Promise<void>;
  urlPhotoId: string | null;
  setUrlPhotoId: (id: string | null) => void;
  onClose?: () => void;
  onToggleSlideshow?: () => void;
  /** Disable arrow/escape keyboard shortcuts while user is typing in form inputs. */
  isEditing?: boolean;
}

export interface GalleryNavigationResult {
  activeIndex: number | null;
  activePhoto: Photo | null;
  hasPrev: boolean;
  hasNext: boolean;
  openAtIndex: (flatIndex: number) => void;
  close: () => void;
  goNext: (options?: { wrap?: boolean }) => void;
  goPrev: () => void;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName;
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Manages fullscreen photo selection strictly by `flatIndex` in the canonical
 * ordered `items` list while keeping `?photo=<id>` synchronized in the URL.
 *
 * Because navigation tracks the exact index rather than doing `findIndex(id)`
 * on every step, duplicate photo IDs across different events never jump back
 * or create infinite loops during Next/Prev or slideshow playback.
 */
export function useGalleryNavigation({
  items,
  hasMore,
  isLoading,
  loadMore,
  urlPhotoId,
  setUrlPhotoId,
  onClose,
  onToggleSlideshow,
  isEditing = false,
}: UseGalleryNavigationOptions): GalleryNavigationResult {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [fallbackPhoto, setFallbackPhoto] = useState<Photo | null>(null);
  const pendingAdvanceRef = useRef(false);

  const openAtIndex = useCallback(
    (flatIndex: number) => {
      const target = items[flatIndex];
      if (!target) {
        return;
      }
      pendingAdvanceRef.current = false;
      setFallbackPhoto(null);
      setActiveIndex(flatIndex);
      setUrlPhotoId(target.photo.id);
    },
    [items, setUrlPhotoId],
  );

  const close = useCallback(() => {
    pendingAdvanceRef.current = false;
    setActiveIndex(null);
    setFallbackPhoto(null);
    setUrlPhotoId(null);
    onClose?.();
  }, [setUrlPhotoId, onClose]);

  // Synchronize URL `?photo=<id>` into `activeIndex` ONLY when it doesn't
  // already match the currently selected index (e.g. initial deep link or
  // browser Back/Forward).
  useEffect(() => {
    if (urlPhotoId === null) {
      setActiveIndex(null);
      setFallbackPhoto(null);
      return;
    }

    if (activeIndex !== null && items[activeIndex]?.photo.id === urlPhotoId) {
      return;
    }

    const foundIndex = items.findIndex((item) => item.photo.id === urlPhotoId);
    if (foundIndex !== -1) {
      setFallbackPhoto(null);
      setActiveIndex(foundIndex);
      return;
    }

    if (hasMore) {
      if (!isLoading) {
        void loadMore();
      }
      return;
    }

    // All pages in the current filter are exhausted and the deep-linked photo
    // wasn't in the list — fetch it directly by Flickr photo ID as a fallback.
    const controller = new AbortController();
    void getPhotoById(urlPhotoId, { signal: controller.signal }).then(
      (photo) => {
        if (!controller.signal.aborted && photo) {
          setFallbackPhoto(photo);
        }
      },
    );
    return () => {
      controller.abort();
    };
  }, [urlPhotoId, activeIndex, items, hasMore, isLoading, loadMore]);

  // Proactively prefetch the next page when nearing the end of loaded items.
  useEffect(() => {
    if (
      activeIndex !== null &&
      hasMore &&
      !isLoading &&
      items.length - activeIndex <= PREFETCH_THRESHOLD
    ) {
      void loadMore();
    }
  }, [activeIndex, items.length, hasMore, isLoading, loadMore]);

  // If the user pressed Next at the very last loaded photo while more pages
  // were loading, complete the advance as soon as the new page arrives.
  useEffect(() => {
    if (
      pendingAdvanceRef.current &&
      activeIndex !== null &&
      activeIndex + 1 < items.length
    ) {
      pendingAdvanceRef.current = false;
      openAtIndex(activeIndex + 1);
    }
  }, [activeIndex, items.length, openAtIndex]);

  const goNext = useCallback(
    (options: { wrap?: boolean } = {}) => {
      if (activeIndex === null || items.length === 0) {
        return;
      }

      const nextIndex = getNextPhotoIndex(activeIndex, items.length, {
        wrap: options.wrap && !hasMore,
      });

      if (nextIndex !== null) {
        openAtIndex(nextIndex);
        return;
      }

      if (hasMore) {
        pendingAdvanceRef.current = true;
        if (!isLoading) {
          void loadMore();
        }
      }
    },
    [activeIndex, items.length, hasMore, isLoading, loadMore, openAtIndex],
  );

  const goPrev = useCallback(() => {
    if (activeIndex === null) {
      return;
    }
    const prevIndex = getPrevPhotoIndex(activeIndex);
    if (prevIndex !== null) {
      openAtIndex(prevIndex);
    }
  }, [activeIndex, openAtIndex]);

  const activePhoto =
    activeIndex !== null ? (items[activeIndex]?.photo ?? null) : fallbackPhoto;

  const hasPrev = activeIndex !== null && activeIndex > 0;
  const hasNext =
    activeIndex !== null && (activeIndex + 1 < items.length || hasMore);

  useEffect(() => {
    if (activePhoto === null) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableElement(e.target)) {
        return;
      }

      if (e.key === "Escape") {
        close();
        return;
      }

      if (isEditing) {
        return;
      }

      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        goNext();
      } else if (e.key === " " && onToggleSlideshow) {
        e.preventDefault();
        onToggleSlideshow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activePhoto,
    isEditing,
    hasPrev,
    hasNext,
    goPrev,
    goNext,
    close,
    onToggleSlideshow,
  ]);

  return {
    activeIndex,
    activePhoto,
    hasPrev,
    hasNext,
    openAtIndex,
    close,
    goNext,
    goPrev,
  };
}
