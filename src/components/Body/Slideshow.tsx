import React, { useEffect, FC } from "react";

import Control from "./Control";
import { Photo } from "../../types/Photo";

import "../../styles/Body.css";

interface SlideshowProps {
  photo: Photo;
  handleRotationRight: () => void;
}

const Slideshow: FC<SlideshowProps> = ({
  photo,
  handleRotationRight,
}) => {
  useEffect(() => {
    const interval = window.setInterval(() => {
      handleRotationRight();
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [handleRotationRight]);

  return (
    <div className="dismiss">
      <div className="wrapper">
        <Control />
        <div className="img-container">
          <img className="full" src={photo.url} alt="fullsize" />
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
