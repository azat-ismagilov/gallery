import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";

import { FLICKR_IMAGE_PREFIX } from "@/config/gallery";
import type { Photo } from "@/types/gallery";

interface PhotoViewerToolbarProps {
  photo: Photo;
  activeIndex: number | null;
  totalItems: number;
  hasMore: boolean;
  isSlideShow: boolean;
  editMode: boolean;
  infoOpen: boolean;
  onClose: () => void;
  onToggleSlideshow: () => void;
  onToggleInfo: () => void;
  onExitEdit: () => void;
}

/**
 * Shared top toolbar for the fullscreen photo viewer across desktop and mobile.
 */
const PhotoViewerToolbar = ({
  photo,
  activeIndex,
  totalItems,
  hasMore,
  isSlideShow,
  editMode,
  infoOpen,
  onClose,
  onToggleSlideshow,
  onToggleInfo,
  onExitEdit,
}: PhotoViewerToolbarProps) => {
  const counterLabel =
    activeIndex !== null && totalItems > 0
      ? `${activeIndex + 1} / ${totalItems}${hasMore ? "+" : ""}`
      : null;

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 1, sm: 2 },
        py: 1,
        flexShrink: 0,
        zIndex: 2,
        bgcolor: isSlideShow ? "transparent" : "rgba(0, 0, 0, 0.55)",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Tooltip title="Close (Esc)">
          <IconButton
            onClick={onClose}
            aria-label="Close photo viewer"
            sx={{ color: "common.white" }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
        {!isSlideShow && counterLabel && (
          <Typography
            variant="body2"
            sx={{ color: "grey.300", fontVariantNumeric: "tabular-nums" }}
          >
            {counterLabel}
          </Typography>
        )}
        {editMode && (
          <Chip
            label="Editing tags"
            color="primary"
            size="small"
            onDelete={onExitEdit}
          />
        )}
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        {!editMode && (
          <Tooltip
            title={
              isSlideShow ? "Pause slideshow (Space)" : "Play slideshow (Space)"
            }
          >
            <IconButton
              onClick={onToggleSlideshow}
              aria-label={isSlideShow ? "Pause slideshow" : "Play slideshow"}
              sx={{ color: "common.white" }}
            >
              {isSlideShow ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
        )}

        {!isSlideShow && !editMode && (
          <>
            <Tooltip title="Download original photo">
              <IconButton
                href={photo.origin}
                download
                target="_blank"
                rel="noreferrer"
                aria-label="Download photo"
                sx={{ color: "common.white" }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Open on Flickr">
              <IconButton
                href={`${FLICKR_IMAGE_PREFIX}${photo.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on Flickr"
                sx={{ color: "common.white" }}
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={infoOpen ? "Hide info" : "Show info"}>
              <IconButton
                onClick={onToggleInfo}
                aria-label={infoOpen ? "Hide photo info" : "Show photo info"}
                aria-pressed={infoOpen}
                color={infoOpen ? "primary" : "default"}
                sx={infoOpen ? undefined : { color: "common.white" }}
              >
                {infoOpen ? <InfoIcon /> : <InfoOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default PhotoViewerToolbar;
