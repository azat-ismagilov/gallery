import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Autocomplete,
  Box,
  createFilterOptions,
  IconButton,
  Paper,
  TextField,
} from "@mui/material";
import { type SyntheticEvent, useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { useAppContext } from "@/context/AppContext";
import { usePhotoInfo } from "@/context/PhotoInfoContext";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import type { PersonTag, Photo } from "@/types/gallery";
import { type Dimensions, fitDimensions } from "@/utils/imageFit";
import FaceBox from "./FaceBox";

const filterOptions = createFilterOptions<string>({ limit: 200 });

interface PhotoStageProps {
  photo: Photo;
  showNavArrows: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  hideFaces?: boolean;
}

/**
 * Responsive photo stage shared by desktop and mobile layouts.
 * Measures its actual container via ResizeObserver so opening/closing the
 * desktop sidebar or resizing the viewport keeps the image and face rectangles
 * accurately aligned.
 */
const PhotoStage = ({
  photo,
  showNavArrows,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  hideFaces = false,
}: PhotoStageProps) => {
  const { people } = useAppContext();
  const { photoInfo, editMode, face, setFace, appendPerson } = usePhotoInfo();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [loadedSize, setLoadedSize] = useState<Dimensions | null>(null);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);

  // Reset crop and loaded dimensions whenever the displayed photo changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: photo.id intentionally resets per-photo transient UI state
  useEffect(() => {
    setCrop(undefined);
    setLoadedSize(null);
  }, [photo.id]);

  // Observe stage container size so image & face boxes rescale seamlessly when
  // the desktop sidebar toggles or the window resizes.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setContainerSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const naturalWidth = photo.width > 0 ? photo.width : (loadedSize?.width ?? 0);
  const naturalHeight =
    photo.height > 0 ? photo.height : (loadedSize?.height ?? 0);

  const fitted = fitDimensions(
    naturalWidth,
    naturalHeight,
    containerSize.width,
    containerSize.height,
  );

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setLoadedSize({ width: img.naturalWidth, height: img.naturalHeight });
    }
  };

  const handleCreatePerson = (name: string | null, currentCrop: Crop) => {
    if (!name || fitted.width <= 0 || fitted.height <= 0) {
      return;
    }
    const person: PersonTag = {
      name: name.trim(),
      position: {
        top: currentCrop.y / fitted.height,
        left: currentCrop.x / fitted.width,
        right: (currentCrop.x + currentCrop.width) / fitted.width,
        bottom: (currentCrop.y + currentCrop.height) / fitted.height,
      },
    };
    if (person.name !== "") {
      appendPerson(person);
    }
    setCrop(undefined);
  };

  const swipeHandlers = useSwipeNavigation({
    enabled: !editMode,
    onNext: () => {
      if (hasNext) {
        onNext();
      }
    },
    onPrev: () => {
      if (hasPrev) {
        onPrev();
      }
    },
  });

  return (
    <Box
      ref={containerRef}
      {...swipeHandlers}
      sx={{
        position: "relative",
        flex: "1 1 0%",
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        touchAction: editMode ? "none" : "pan-y",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: fitted.width > 0 ? fitted.width : "auto",
          height: fitted.height > 0 ? fitted.height : "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          disabled={!editMode}
        >
          <Box
            component="img"
            src={photo.url}
            alt={`Photo ${photo.id}`}
            onLoad={handleImageLoad}
            sx={{
              display: "block",
              width: fitted.width > 0 ? fitted.width : "auto",
              height: fitted.height > 0 ? fitted.height : "auto",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
          {!hideFaces &&
            photoInfo?.person.map((person) => (
              <FaceBox
                person={person}
                setFace={setFace}
                hidden={!editMode && face?.name !== person.name}
                key={`${person.name}-${person.position?.top ?? "none"}-${person.position?.left ?? "none"}`}
              />
            ))}
        </ReactCrop>

        {editMode && crop && crop.width > 4 && crop.height > 4 && (
          <Paper
            elevation={6}
            sx={{
              position: "absolute",
              left: Math.min(crop.x, Math.max(0, fitted.width - 220)),
              top: Math.min(
                crop.y + crop.height + 4,
                Math.max(0, fitted.height - 64),
              ),
              width: Math.max(crop.width, 220),
              zIndex: 10,
            }}
          >
            <Autocomplete
              filterOptions={filterOptions}
              options={people}
              freeSolo
              autoHighlight
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  autoFocus
                  placeholder="Enter a name"
                />
              )}
              onChange={(_event, newValue) =>
                handleCreatePerson(newValue, crop)
              }
            />
          </Paper>
        )}
      </Box>

      {showNavArrows && hasPrev && (
        <IconButton
          onClick={onPrev}
          aria-label="Previous photo"
          size="large"
          sx={{
            position: "absolute",
            left: { xs: 8, md: 16 },
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "rgba(0, 0, 0, 0.45)",
            color: "common.white",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.75)" },
          }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>
      )}

      {showNavArrows && hasNext && (
        <IconButton
          onClick={onNext}
          aria-label="Next photo"
          size="large"
          sx={{
            position: "absolute",
            right: { xs: 8, md: 16 },
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "rgba(0, 0, 0, 0.45)",
            color: "common.white",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.75)" },
          }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>
      )}
    </Box>
  );
};

export default PhotoStage;
