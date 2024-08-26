import React, { FC } from "react";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton, SvgIcon, IconButtonProps, SvgIconProps } from "@mui/material";
import { Person } from "./PhotoInfo/PhotoInfoContext";

import Control from "./Control";
import ImageWithFaceSelection from "./ImageWithFaceSelection";
import { usePhotoInfo } from "./PhotoInfo/PhotoInfoContext";
import PhotoInfoPanel from "./PhotoInfo/PhotoInfoPanel";
import { Photo } from "../../types/Photo";

import "../../styles/Body.css";

interface LightboxProps {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

const Lightbox: FC<LightboxProps> = ({
  photo,
  handleRotationLeft,
  handleRotationRight,
  leftArrow,
  rightArrow,
}) => {
  const { editMode, face, setFace } = usePhotoInfo();

  return (
    <div className="wrapper">
      <ImageWithFaceSelection
        key={photo.id}
        photo={photo}
        alt="fullscreen image"
        face={face}
        setFace={setFace}
      />
      {!editMode && <Control />}
      <PhotoInfoPanel photo={photo} setFace={setFace} />
      {leftArrow && !editMode && (
        <div className="overlay-arrows_left">
          <IconButton onClick={handleRotationLeft}>
            <SvgIcon component={ArrowForwardIosIcon} sx={{ transform: "scale(-1, 1)" }} />
          </IconButton>
        </div>
      )}
      {rightArrow && !editMode && (
        <div className="overlay-arrows_right">
          <IconButton onClick={handleRotationRight}>
            <SvgIcon component={ArrowForwardIosIcon} />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default Lightbox;
