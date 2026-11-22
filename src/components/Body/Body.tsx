import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Photo } from "../../types";
import usePhotoLoader from "../../Util/PhotoLoader";
import { useAppContext } from "../AppContext";
import MyModal from "./MyModal";
import PhotoGridByYear from "./PhotoGridByYear";

import "../../styles/Body.css";

const Body = () => {
  const { data, setFullscreenPhotoId, setIsSlideShow, desktop } =
    useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } =
    usePhotoLoader();

  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [rightArrow, setRightArrow] = useState(false);
  const [leftArrow, setLeftArrow] = useState(false);

  const handleClick = useCallback(
    (id: string) => {
      setFullscreenPhotoId(id);
    },
    [setFullscreenPhotoId],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !hasMorePhotos()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMorePhotos();
        }
      },
      { root, rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMorePhotos, loadMorePhotos]);

  useEffect(() => {
    const id = data.fullscreenPhotoId;
    if (id !== null) {
      const index = photosList.findIndex((photo) => photo.id === id);

      if (index === -1 && hasMorePhotos()) {
        void loadMorePhotos();
        return;
      }

      const photo = photosList[index] ?? null;
      setFullscreenIndex(index >= 0 ? index : null);
      setFullscreenPhoto(photo);

      setLeftArrow(index > 0);
      setRightArrow(
        (index >= 0 && index + 1 < photosList.length) || hasMorePhotos(),
      );

      if (index >= 0 && photosList.length <= index + 4 && hasMorePhotos()) {
        void loadMorePhotos();
      }
    } else {
      setFullscreenIndex(null);
      setFullscreenPhoto(null);
      setLeftArrow(false);
      setRightArrow(false);
    }
  }, [data.fullscreenPhotoId, photosList, hasMorePhotos, loadMorePhotos]);

  useEffect(() => {
    if (data.fullscreenPhotoId === null) {
      setIsSlideShow(false);
    }
  }, [data.fullscreenPhotoId, setIsSlideShow]);

  const handleRotationRight = useCallback(() => {
    if (fullscreenIndex === null || photosList.length === 0) {
      return;
    }
    let newIndex = fullscreenIndex + 1;
    if (newIndex >= photosList.length) {
      newIndex = 0;
    }
    const nextPhoto = photosList[newIndex];
    if (nextPhoto) {
      handleClick(nextPhoto.id);
    }
  }, [fullscreenIndex, photosList, handleClick]);

  const handleRotationLeft = useCallback(() => {
    if (fullscreenIndex === null || fullscreenIndex <= 0) {
      return;
    }
    const prevPhoto = photosList[fullscreenIndex - 1];
    if (prevPhoto) {
      handleClick(prevPhoto.id);
    }
  }, [fullscreenIndex, photosList, handleClick]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (fullscreenPhoto) {
        switch (e.key) {
          case "ArrowLeft":
            if (leftArrow) {
              handleRotationLeft();
            }
            break;
          case "ArrowRight":
            if (rightArrow) {
              handleRotationRight();
            }
            break;
          case "Escape":
            setFullscreenPhotoId(null);
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [
    fullscreenPhoto,
    leftArrow,
    rightArrow,
    handleRotationLeft,
    handleRotationRight,
    setFullscreenPhotoId,
  ]);

  return (
    <div className="body" ref={scrollRef}>
      {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
      {Array.from(photosByEvent).map(([event, photos]) => (
        <Box key={event ?? "__all__"}>
          {event && <Typography variant="h1">{event}</Typography>}
          <PhotoGridByYear photos={photos} handleClick={handleClick} />
        </Box>
      ))}
      {hasMorePhotos() && (
        <Box ref={sentinelRef}>
          <Typography variant="h1">Loading ...</Typography>
        </Box>
      )}
      {!hasMorePhotos() && photosList.length === 0 && (
        <Typography variant="h1">No photo</Typography>
      )}
      {fullscreenPhoto !== null && (
        <MyModal
          photo={fullscreenPhoto}
          handleRotationRight={handleRotationRight}
          handleRotationLeft={handleRotationLeft}
          rightArrow={rightArrow}
          leftArrow={leftArrow}
        />
      )}
    </div>
  );
};

export default Body;
