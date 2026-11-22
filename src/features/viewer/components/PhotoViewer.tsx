import { Box, Dialog } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";

import { useAppContext } from "@/features/gallery/state/AppContext";
import { useSlideshow } from "@/features/viewer/hooks/useSlideshow";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import { useLocalStorageBoolean } from "@/shared/hooks/useLocalStorage";
import type { Photo } from "@/types/gallery";
import PhotoInfoSidebar from "./PhotoInfoSidebar";
import PhotoStage from "./PhotoStage";
import PhotoViewerToolbar from "./PhotoViewerToolbar";

const DESKTOP_INFO_STORAGE_KEY = "gallery:infoSidebarOpen";
const MOBILE_INFO_PEEK_HEIGHT = 56;

interface PhotoViewerProps {
  photo: Photo;
  activeIndex: number | null;
  totalItems: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: (options?: { wrap?: boolean }) => void;
  onClose: () => void;
}

/**
 * Unified Material UI fullscreen photo viewer for desktop, mobile, and slideshow.
 *
 * Uses ONE shared component tree (`PhotoViewerToolbar` + `PhotoStage` +
 * `PhotoInfoSidebar`) whose flex direction adapts cleanly by viewport:
 * - Desktop (Google Photos style): horizontal split with a collapsible right
 *   info sidebar (open/closed state persisted in `localStorage`).
 * - Mobile (Adobe Lightroom style): vertical scrollable layout with the photo
 *   stage on top and the same info sidebar directly below at the bottom.
 */
const PhotoViewer = ({
  photo,
  activeIndex,
  totalItems,
  hasMore,
  isLoadingMore,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: PhotoViewerProps) => {
  const { desktop, isSlideShow, setIsSlideShow } = useAppContext();
  const { editMode, setEditMode, isPreviewingSuggestion } = usePhotoInfo();

  const [desktopInfoOpen, setDesktopInfoOpen] = useLocalStorageBoolean(
    DESKTOP_INFO_STORAGE_KEY,
    false,
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Pause slideshow automatically if the user enters tag edit mode or opens a suggestion preview.
  useEffect(() => {
    if ((editMode || isPreviewingSuggestion) && isSlideShow) {
      setIsSlideShow(false);
    }
  }, [editMode, isPreviewingSuggestion, isSlideShow, setIsSlideShow]);

  // On mobile, reset scroll position back to the photo when switching photos.
  // biome-ignore lint/correctness/useExhaustiveDependencies: photo.id intentionally triggers scroll reset on mobile navigation
  useEffect(() => {
    if (!desktop) {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [photo.id, desktop]);

  const handleSlideshowAdvance = useCallback(() => {
    onNext({ wrap: true });
  }, [onNext]);

  useSlideshow({
    active: isSlideShow,
    paused: editMode || isPreviewingSuggestion || isLoadingMore,
    totalItems,
    hasMore,
    resetKey: activeIndex ?? photo.id,
    onAdvance: handleSlideshowAdvance,
  });

  const handleToggleSlideshow = useCallback(() => {
    setIsSlideShow(!isSlideShow);
  }, [isSlideShow, setIsSlideShow]);

  const handleScrollToMobileInfo = useCallback(() => {
    const container = scrollContainerRef.current;
    const sidebar = sidebarRef.current;
    if (!container || !sidebar) {
      return;
    }
    if (container.scrollTop > 20) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sidebar.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleToggleInfo = useCallback(() => {
    if (desktop) {
      setDesktopInfoOpen((prev) => !prev);
    } else {
      handleScrollToMobileInfo();
    }
  }, [desktop, setDesktopInfoOpen, handleScrollToMobileInfo]);

  const showSidebar =
    !isSlideShow &&
    (!desktop || desktopInfoOpen || editMode || isPreviewingSuggestion);
  const showNavArrows = !isSlideShow && !editMode;

  return (
    <Dialog
      open
      fullScreen
      onClose={(_event, reason) => {
        if (reason !== "escapeKeyDown") {
          onClose();
        }
      }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#000",
            borderRadius: 0,
            overflow: "hidden",
          },
        },
      }}
    >
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          flexDirection: desktop ? "row" : "column",
          width: "100%",
          height: "100%",
          overflowX: "hidden",
          overflowY: desktop || isSlideShow ? "hidden" : "auto",
          bgcolor: "#000",
        }}
      >
        <Box
          sx={{
            position: "relative",
            flex: desktop ? "1 1 0%" : "0 0 auto",
            minWidth: 0,
            minHeight: 0,
            width: desktop ? undefined : "100%",
            height:
              desktop || isSlideShow
                ? "100%"
                : `calc(100dvh - ${MOBILE_INFO_PEEK_HEIGHT}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PhotoViewerToolbar
            photo={photo}
            activeIndex={activeIndex}
            totalItems={totalItems}
            hasMore={hasMore}
            isSlideShow={isSlideShow}
            editMode={editMode}
            infoOpen={desktop ? desktopInfoOpen : false}
            onClose={onClose}
            onToggleSlideshow={handleToggleSlideshow}
            onToggleInfo={handleToggleInfo}
            onExitEdit={() => setEditMode(false)}
          />

          <PhotoStage
            photo={photo}
            showNavArrows={showNavArrows}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={() => onNext()}
            hideFaces={isSlideShow}
          />
        </Box>

        {showSidebar && (
          <PhotoInfoSidebar
            ref={sidebarRef}
            photo={photo}
            desktop={desktop}
            onCloseSidebar={desktop ? handleToggleInfo : undefined}
            onFocusSidebar={!desktop ? handleScrollToMobileInfo : undefined}
          />
        )}
      </Box>
    </Dialog>
  );
};

export default PhotoViewer;
