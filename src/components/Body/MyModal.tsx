import React from "react";

import { useAppContext } from "../AppContext";

import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";
import { Photo } from "../../types/Photo";

import "../../styles/Body.css";

interface MyModalProps {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

const MyModal: React.FC<MyModalProps> = ({
  photo,
  handleRotationLeft,
  handleRotationRight,
  leftArrow,
  rightArrow,
}) => {
  const { setFullscreenPhotoId, slideShow } = useAppContext();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof Element && e.target.classList.contains("dismiss")) {
      setFullscreenPhotoId(null);
    }
  };

  return (
    <div
      className="overlay dismiss"
      onClick={handleClick}
      style={{ backgroundColor: slideShow ? "black" : "" }}
    >
      {slideShow ? (
        <Slideshow photo={photo} handleRotationRight={handleRotationRight} />
      ) : (
        <Lightbox
          photo={photo}
          handleRotationRight={handleRotationRight}
          handleRotationLeft={handleRotationLeft}
          leftArrow={leftArrow}
          rightArrow={rightArrow}
        />
      )}
    </div>
  );
};

export default MyModal;
