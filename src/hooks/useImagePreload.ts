import { useEffect } from "react";

import type { GalleryPhotoItem } from "@/types/gallery";

/**
 * Preloads adjacent full-resolution images so Next/Prev and slideshow
 * transitions appear instantaneously.
 */
export function useImagePreload(
  items: readonly GalleryPhotoItem[],
  activeIndex: number | null,
): void {
  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const candidateIndices = [
      activeIndex + 1,
      activeIndex + 2,
      activeIndex - 1,
    ];
    const images: HTMLImageElement[] = [];

    for (const idx of candidateIndices) {
      const url = items[idx]?.photo.url;
      if (!url) {
        continue;
      }
      const img = new Image();
      img.src = url;
      images.push(img);
    }

    return () => {
      for (const img of images) {
        img.src = "";
      }
    };
  }, [items, activeIndex]);
}
