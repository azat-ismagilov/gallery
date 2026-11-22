import { Box, Typography } from "@mui/material";
import { useCallback, useRef } from "react";

import PhotoModal from "@/components/viewer/PhotoModal";
import { useAppContext } from "@/context/AppContext";
import { usePhotoInfo } from "@/context/PhotoInfoContext";
import { useGalleryNavigation } from "@/hooks/useGalleryNavigation";
import { useImagePreload } from "@/hooks/useImagePreload";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import usePhotoLoader from "@/hooks/usePhotoLoader";
import PhotoGrid from "./PhotoGrid";

import "@/styles/Body.css";

const GalleryBody = () => {
  const { data, setFullscreenPhotoId, setIsSlideShow, desktop } =
    useAppContext();
  const { editMode } = usePhotoInfo();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { sections, items, hasMore, isLoading, loadMore } = usePhotoLoader();

  const handleClose = useCallback(() => {
    setIsSlideShow(false);
  }, [setIsSlideShow]);

  const {
    activeIndex,
    activePhoto,
    hasPrev,
    hasNext,
    openAtIndex,
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

  const handleNext = useCallback(() => {
    goNext({ wrap: data.slideShow });
  }, [goNext, data.slideShow]);

  return (
    <div className="body" ref={scrollRef}>
      {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
      {sections.map((section) => (
        <Box key={section.key}>
          {section.title && <Typography variant="h1">{section.title}</Typography>}
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
        <PhotoModal
          photo={activePhoto}
          handleRotationRight={handleNext}
          handleRotationLeft={goPrev}
          rightArrow={hasNext}
          leftArrow={hasPrev}
        />
      )}
    </div>
  );
};

export default GalleryBody;
