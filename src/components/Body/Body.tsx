import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Box, Typography } from "@mui/material";
import { usePhotoLoader } from "../../Util/PhotoLoader";
import { useAppContext } from "../AppContext";

import MyModal from "./MyModal";
import PhotoGridByYear from "./PhotoGridByYear";

import "../../styles/Body.css";

interface Photo {
  id: string;
  url: string;
  url_preview: string;
  width: number;
  height: number;
  origin: string;
  year: string;
}

type PhotosByEvent = Map<string, Photo[]>;

const Body: React.FC = () => {
  const { year, event, text, team, person, fullscreenPhotoId, setFullscreenPhotoId, setIsSlideShow, desktop } =
    useAppContext();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } =
    usePhotoLoader();

  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [rightArrow, setRightArrow] = useState<boolean>(false);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);

  const handleClick = (id: string): void => {
    setFullscreenPhotoId(id);
  };

  useEffect(() => {
    const id = fullscreenPhotoId;
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
  }, [fullscreenPhotoId, photosList, hasMorePhotos, loadMorePhotos]);

  useEffect(() => {
    if (fullscreenPhotoId === null) {
      setIsSlideShow(false);
    }
  }, [fullscreenPhotoId, setIsSlideShow]);

  const handleRotationRight = (): void => {
    if (fullscreenIndex === null) return;
    let newIndex = fullscreenIndex + 1;
    if (newIndex >= photosList.length) {
      newIndex = 0;
    }
    handleClick(photosList[newIndex].id);
  };

  const handleRotationLeft = (): void => {
    if (fullscreenIndex === null) return;
    handleClick(photosList[fullscreenIndex - 1].id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
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
    document.body.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenPhoto, leftArrow, rightArrow, setFullscreenPhotoId]);

  return (
    <div className="body" ref={scrollRef}>
      {desktop && text && <h1 style={{ width: "100%" }}>{text}</h1>}
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMorePhotos}
        hasMore={hasMorePhotos()}
        initialLoad={true}
        loader={
          <Typography variant="h1" key={0} component="div">
            Loading ...
          </Typography>
        }
        useWindow={false}
        getScrollParent={() => scrollRef.current}
      >
        {Array.from(photosByEvent).map(([event, photos]) => (
          <Box key={event} component="div">
            {event && <Typography variant="h1" component="h2">{event}</Typography>}
            <PhotoGridByYear photos={photos} handleClick={handleClick} />
          </Box>
        ))}
      </InfiniteScroll>
      {!hasMorePhotos() && photosList.length === 0 && (
        <Typography variant="h1" component="div">No photo</Typography>
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
