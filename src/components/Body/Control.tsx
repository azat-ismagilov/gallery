import React, { FC } from "react";

import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { IconButton, IconButtonProps, SvgIcon, SvgIconProps } from "@mui/material";

import { useAppContext } from "../../components/AppContext";

interface ControlProps extends Omit<IconButtonProps, 'onClick'> {}

const Control: FC<ControlProps> = (props) => {
  const { setFullscreenPhotoId, slideShow, setIsSlideShow } = useAppContext();

  const handleSlideShow = () => {
    setIsSlideShow(!slideShow);
  };

  return (
    <div className="control">
      <IconButton className="dismiss" onClick={handleSlideShow}>
        {slideShow ? (
          <PauseIcon className="icon-button" fontSize="large" />
        ) : (
          <PlayArrowIcon className="icon-button" fontSize="large" />
        )}
      </IconButton>
      <IconButton
        className="dismiss"
        onClick={() => setFullscreenPhotoId(null)}
      >
        <CloseIcon className="icon-button" fontSize="large" />
      </IconButton>
    </div>
  );
};

export default Control;
