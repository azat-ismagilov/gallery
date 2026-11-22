import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton } from "@mui/material";
import { type MouseEvent, useCallback, useEffect } from "react";

import { useAppContext } from "@/context/AppContext";
import { usePhotoInfo } from "@/context/PhotoInfoContext";
import { useSlideshow } from "@/hooks/useSlideshow";
import type { Photo } from "@/types/gallery";
import ImageWithFaceSelection from "./ImageWithFaceSelection";
import PhotoInfoPanel from "./PhotoInfoPanel";
import ViewerControls from "./ViewerControls";

import "@/styles/Body.css";

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
 * Unified fullscreen viewer for both standard inspection and slideshow mode.
 * Slideshow is simply a playback state rather than a separate component tree,
 * so the image stage, keyboard navigation, and preloading remain seamless.
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
  const { isSlideShow, setIsSlideShow } = useAppContext();
  const { editMode, face, setFace } = usePhotoInfo();

  // Pause slideshow automatically if the user enters tag edit mode.
  useEffect(() => {
    if (editMode && isSlideShow) {
      setIsSlideShow(false);
    }
  }, [editMode, isSlideShow, setIsSlideShow]);

  const handleSlideshowAdvance = useCallback(() => {
    onNext({ wrap: true });
  }, [onNext]);

  useSlideshow({
    active: isSlideShow,
    paused: editMode || isLoadingMore,
    totalItems,
    hasMore,
    resetKey: activeIndex ?? photo.id,
    onAdvance: handleSlideshowAdvance,
  });

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains("dismiss")
    ) {
      onClose();
    }
  };

  const showChrome = !isSlideShow && !editMode;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape, Space, and Arrow keys are handled in useGalleryNavigation
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click dismisses fullscreen viewer
    <div
      className="overlay dismiss"
      onClick={handleBackdropClick}
      style={{ backgroundColor: isSlideShow ? "black" : undefined }}
    >
      <div className="wrapper">
        <ImageWithFaceSelection
          key={photo.id}
          photo={photo}
          alt={`Photo ${photo.id}`}
          face={isSlideShow ? null : face}
          setFace={setFace}
        />
        {!editMode && <ViewerControls />}
        {!isSlideShow && <PhotoInfoPanel photo={photo} setFace={setFace} />}
        {showChrome && hasPrev && (
          <div className="overlay-arrows_left">
            <IconButton onClick={onPrev} aria-label="Previous photo">
              <ArrowForwardIosIcon style={{ transform: "scale(-1, 1)" }} />
            </IconButton>
          </div>
        )}
        {showChrome && hasNext && (
          <div className="overlay-arrows_right">
            <IconButton onClick={() => onNext()} aria-label="Next photo">
              <ArrowForwardIosIcon />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoViewer;
