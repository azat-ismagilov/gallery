import { type RefObject, useEffect } from "react";

interface UseInfiniteScrollOptions {
  rootRef: RefObject<Element | null>;
  sentinelRef: RefObject<Element | null>;
  enabled: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export function useInfiniteScroll({
  rootRef,
  sentinelRef,
  enabled,
  onLoadMore,
  rootMargin = "300px",
}: UseInfiniteScrollOptions): void {
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = rootRef.current;
    if (!sentinel || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { root, rootMargin },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [rootRef, sentinelRef, enabled, onLoadMore, rootMargin]);
}
