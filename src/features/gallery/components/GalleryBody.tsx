import { Box, Typography } from "@mui/material";
import { lazy, Suspense, useCallback, useEffect, useRef } from "react";

import { useAppContext } from "@/features/gallery/state/AppContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import { useGalleryNavigation } from "@/features/gallery/hooks/useGalleryNavigation";
import { useImagePreload } from "@/features/gallery/hooks/useImagePreload";
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import usePhotoLoader from "@/features/gallery/hooks/usePhotoLoader";
import { getGalleryFilterKey } from "@/features/gallery/state/galleryState";
import PhotoGrid from "./PhotoGrid";

import "@/features/gallery/gallery.css";

const PhotoViewer = lazy(() => import("@/features/viewer/components/PhotoViewer"));

const GalleryBody = () => {
  const { data, setFullscreenPhotoId, isSlideShow, setIsSlideShow, desktop } =
    useAppContext();
  const { editMode } = usePhotoInfo();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filterKey = getGalleryFilterKey(data);

  // biome-ignore lint/correctness/useExhaustiveDependencies: filterKey intentionally scrolls gallery back to top when filters change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [filterKey]);

  const { sections, items, hasMore, isLoading, loadMore } = usePhotoLoader();

  const handleClose = useCallback(() => {
    setIsSlideShow(false);
  }, [setIsSlideShow]);

  const handleToggleSlideshow = useCallback(() => {
    setIsSlideShow(!isSlideShow);
  }, [isSlideShow, setIsSlideShow]);

  const {
    activeIndex,
    activePhoto,
    hasPrev,
    hasNext,
    openAtIndex,
    close,
    goNext,
    goPrev,
  } = useGalleryNavigation({
    items,
    hasMore,
    isLoading,
    loadMore,
    urlPhotoId: data.fullscreenPhotoId,
    setUrlPhotoId: setFullscreenPhotoId,
    onClose: handleClose,
    onToggleSlideshow: handleToggleSlideshow,
    isEditing: editMode,
  });

  useImagePreload(items, activeIndex);

  const handleLoadMore = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  useInfiniteScroll({
    rootRef: scrollRef,
    sentinelRef,
    enabled: hasMore,
    onLoadMore: handleLoadMore,
  });

  return (
    <div className="body" ref={scrollRef}>
      {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
      {sections.map((section) => (
        <Box key={section.key}>
          {section.title && (
            <Typography variant="h1">{section.title}</Typography>
          )}
          <PhotoGrid items={section.items} onSelect={openAtIndex} />
        </Box>
      ))}
      {hasMore && (
        <Box ref={sentinelRef}>
          <Typography variant="h1">Loading ...</Typography>
        </Box>
      )}
      {!hasMore && !isLoading && items.length === 0 && (
        <Typography variant="h1">No photo</Typography>
      )}
      {activePhoto !== null && (
        <Suspense fallback={null}>
          <PhotoViewer
            photo={activePhoto}
            activeIndex={activeIndex}
            totalItems={items.length}
            hasMore={hasMore}
            isLoadingMore={isLoading}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={goPrev}
            onNext={goNext}
            onClose={close}
          />
        </Suspense>
      )}
    </div>
  );
};

export default GalleryBody;
