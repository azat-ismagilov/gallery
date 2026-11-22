import { useEffect } from "react";

import { prefetchPhotoInfo } from "@/services/flickr/api";
import type { GalleryPhotoItem } from "@/types/gallery";

/**
 * Preloads adjacent full-resolution images and prefetches neighbor photo
 * metadata so Next/Prev and slideshow transitions appear instantaneously.
 */
export function useImagePreload(
  items: readonly GalleryPhotoItem[],
  activeIndex: number | null,
): void {
  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const imageIndices = [activeIndex + 1, activeIndex + 2, activeIndex - 1];
    const images: HTMLImageElement[] = [];

    for (const idx of imageIndices) {
      const photo = items[idx]?.photo;
      if (!photo?.url) {
        continue;
      }
      const img = new Image();
      img.src = photo.url;
      images.push(img);
    }

    // Prefetch Flickr metadata for immediate neighbors so sidebar & face tags load in 0ms.
    for (const idx of [activeIndex + 1, activeIndex - 1]) {
      const id = items[idx]?.photo.id;
      if (id) {
        prefetchPhotoInfo(id);
      }
    }

    return () => {
      for (const img of images) {
        img.src = "";
      }
    };
  }, [items, activeIndex]);
}
