import { useEffect } from "react";

import type { Photo } from "@/types/gallery";
import ViewerControls from "./ViewerControls";

import "@/styles/Body.css";

interface SlideshowProps {
  photo: Photo;
  handleRotationRight: () => void;
}

const Slideshow = ({ photo, handleRotationRight }: SlideshowProps) => {
  useEffect(() => {
    const interval = setInterval(() => {
      handleRotationRight();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [handleRotationRight]);

  return (
    <div className="dismiss">
      <div className="wrapper">
        <ViewerControls />
        <div className="img-container">
          <img className="full" src={photo.url} alt="fullsize" />
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
