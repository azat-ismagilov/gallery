import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton } from "@mui/material";

import { usePhotoInfo } from "@/context/PhotoInfoContext";
import type { Photo } from "@/types/gallery";
import ImageWithFaceSelection from "./ImageWithFaceSelection";
import PhotoInfoPanel from "./PhotoInfoPanel";
import ViewerControls from "./ViewerControls";

import "@/styles/Body.css";

interface LightboxProps {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

const Lightbox = ({
  photo,
  handleRotationLeft,
  handleRotationRight,
  leftArrow,
  rightArrow,
}: LightboxProps) => {
  const { editMode, face, setFace } = usePhotoInfo();

  return (
    <div className="wrapper">
      <ImageWithFaceSelection
        key={photo.id}
        photo={photo}
        alt="fullscreen"
        face={face}
        setFace={setFace}
      />
      {!editMode && <ViewerControls />}
      <PhotoInfoPanel photo={photo} setFace={setFace} />
      {leftArrow && !editMode && (
        <div className="overlay-arrows_left">
          <IconButton onClick={handleRotationLeft} aria-label="Previous photo">
            <ArrowForwardIosIcon style={{ transform: "scale(-1, 1)" }} />
          </IconButton>
        </div>
      )}
      {rightArrow && !editMode && (
        <div className="overlay-arrows_right">
          <IconButton onClick={handleRotationRight} aria-label="Next photo">
            <ArrowForwardIosIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default Lightbox;
