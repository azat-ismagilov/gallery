import { useEffect, useRef, useState } from "react";

import { Box, Typography } from "@mui/material";

import usePhotoLoader from "../../Util/PhotoLoader";
import "../../consts";
import { useAppContext } from "../AppContext";

import MyModal from "./MyModal";
import PhotoGridByYear from "./PhotoGridByYear";

import "../../styles/Body.css";

const Body = () => {
  const { data, setFullscreenPhotoId, setIsSlideShow, desktop } =
    useAppContext();
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } =
    usePhotoLoader();

  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [rightArrow, setRightArrow] = useState(null);
  const [leftArrow, setLeftArrow] = useState(null);

  const handleClick = (id) => {
    setFullscreenPhotoId(id);
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !hasMorePhotos()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMorePhotos();
        }
      },
      { root, rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMorePhotos, loadMorePhotos]);

  useEffect(() => {
    const id = data.fullscreenPhotoId;
    if (id != null) {
      const index = photosList.findIndex((photo) => photo.id === id);

      if (index === -1 && hasMorePhotos()) {
        loadMorePhotos();
        return;
      }

      const photo = photosList[index];
      setFullscreenIndex(index);
      setFullscreenPhoto(photo);

      setLeftArrow(index !== 0);
      setRightArrow(index + 1 < photosList.length || hasMorePhotos());

      if (photosList.length <= index + 4 && hasMorePhotos()) {
        loadMorePhotos();
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
  }, [data.fullscreenPhotoId]);

  const handleRotationRight = () => {
    let newIndex = fullscreenIndex + 1;
    if (newIndex >= photosList.length) {
      newIndex = 0;
    }
    handleClick(photosList[newIndex].id);
  };

  const handleRotationLeft = () => {
    handleClick(photosList[fullscreenIndex - 1].id);
  };

  useEffect(() => {
    const target = document.getElementsByTagName("body")[0];
    const listener = (e) => {
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
    target.onkeydown = listener;
    return () => {
      target.removeEventListener("onkeydown", listener);
    };
  }, [fullscreenPhoto]);

  return (
    <div className="body" ref={scrollRef}>
      {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
      {Array.from(photosByEvent).map(([event, photos]) => (
        <Box key={event}>
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
      {fullscreenPhoto != null && (
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
