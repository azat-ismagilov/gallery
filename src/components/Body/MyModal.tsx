import type { MouseEvent } from "react";

import { useAppContext } from "@/context/AppContext";
import type { Photo } from "@/types/gallery";
import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";

import "../../styles/Body.css";

interface MyModalProps {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

const MyModal = ({
  photo,
  handleRotationLeft,
  handleRotationRight,
  leftArrow,
  rightArrow,
}: MyModalProps) => {
  const { setFullscreenPhotoId, isSlideShow } = useAppContext();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains("dismiss")
    ) {
      setFullscreenPhotoId(null);
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard Escape is handled at window level in Body
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click dismisses modal
    <div
      className="overlay dismiss"
      onClick={handleClick}
      style={{ backgroundColor: isSlideShow ? "black" : "" }}
    >
      {isSlideShow ? (
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
