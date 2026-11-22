import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { IconButton } from "@mui/material";

import { useAppContext } from "@/context/AppContext";

const Control = () => {
  const { setFullscreenPhotoId, isSlideShow, setIsSlideShow } = useAppContext();

  const toggleSlideShow = () => {
    setIsSlideShow(!isSlideShow);
  };

  return (
    <div className="control">
      <IconButton
        className="dismiss"
        onClick={toggleSlideShow}
        aria-label={isSlideShow ? "Pause slideshow" : "Start slideshow"}
      >
        {isSlideShow ? (
          <PauseIcon className="icon-button" fontSize="large" />
        ) : (
          <PlayArrowIcon className="icon-button" fontSize="large" />
        )}
      </IconButton>
      <IconButton
        className="dismiss"
        onClick={() => setFullscreenPhotoId(null)}
        aria-label="Close photo"
      >
        <CloseIcon className="icon-button" fontSize="large" />
      </IconButton>
    </div>
  );
};

export default Control;
