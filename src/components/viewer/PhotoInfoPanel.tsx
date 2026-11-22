import Close from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import { useState } from "react";

import { FLICKR_IMAGE_PREFIX, SUGGESTIONS_EMAIL } from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";
import { usePhotoInfo } from "@/context/PhotoInfoContext";
import type { PersonTag, Photo } from "@/types/gallery";
import { SerializePhotoInfo } from "@/utils/photoTags";
import {
  AlbumEdit,
  AlbumInfo,
  EventEdit,
  EventInfo,
  PersonEdit,
  PersonInfo,
  PhotographerEdit,
  PhotographerInfo,
  TeamEdit,
  TeamInfo,
} from "./PhotoInfoDetails";

import "@/styles/PhotoInfo.css";

interface PhotoInfoPanelProps {
  setFace: (person: PersonTag | null) => void;
  photo: Photo;
}

const PhotoInfoPanel = ({ setFace, photo }: PhotoInfoPanelProps) => {
  const { desktop } = useAppContext();
  const { editMode, setEditMode, photoInfo } = usePhotoInfo();

  const [hidden, setHidden] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const toolTipsHidden = editMode;
  const changesPane = editMode && desktop;

  const photoLink = FLICKR_IMAGE_PREFIX + photo.id;
  const tags = SerializePhotoInfo(photoInfo).join(", ");

  function copyToClipboard() {
    setEditMode(false);
    void navigator.clipboard.writeText(tags);
    setSnackbarOpen(true);
  }

  const emailBody = `Photo link: ${photoLink}\n\nGallery link: ${window.location.href}\n\nTags: ${tags}`;
  const emailSubject = `Photo info update ${photo.id}`;

  const mailtoLink = `mailto:${SUGGESTIONS_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(SUGGESTIONS_EMAIL)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  function toggleHidden() {
    setHidden((prev) => !prev);
  }

  return (
    <div className="photoInfo">
      {!hidden && !changesPane && (
        <Box>
          <PhotographerInfo />
          <AlbumInfo />
          <EventInfo />
          <TeamInfo />
          <PersonInfo setFace={setFace} />
        </Box>
      )}

      {changesPane && (
        <Grid container spacing={1}>
          <Grid size={12}>
            <PersonEdit />
          </Grid>
          <Grid size={12}>
            <EventEdit />
          </Grid>
          <Grid size="auto">
            <TeamEdit />
          </Grid>
          <Grid size="auto">
            <PhotographerEdit />
          </Grid>
          <Grid size="auto">
            <AlbumEdit />
          </Grid>
        </Grid>
      )}

      <div className="control-bottom">
        {editMode && (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Send your suggestion using Gmail">
              <IconButton
                href={gmailLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => setEditMode(false)}
                aria-label="Send suggestion via Gmail"
              >
                <EmailIcon fontSize="large" color="error" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send your suggestion using your system mail provider">
              <IconButton
                href={mailtoLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => setEditMode(false)}
                aria-label="Send suggestion via email"
              >
                <EmailIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Copy tags to clipboard">
              <IconButton
                onClick={copyToClipboard}
                aria-label="Copy tags to clipboard"
              >
                <ContentCopyIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exit editing mode">
              <IconButton
                onClick={() => setEditMode(false)}
                aria-label="Exit editing mode"
              >
                <Close fontSize="large" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
        {!toolTipsHidden && (
          <Tooltip title="Edit photo info">
            <IconButton
              onClick={() => setEditMode(true)}
              aria-label="Edit photo info"
            >
              <EditIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {!toolTipsHidden && (
          <Tooltip title={`${hidden ? "Show" : "Hide"} photo info`}>
            <IconButton
              onClick={toggleHidden}
              aria-label={hidden ? "Show photo info" : "Hide photo info"}
            >
              {hidden ? (
                <VisibilityOffIcon fontSize="large" />
              ) : (
                <VisibilityIcon fontSize="large" />
              )}
            </IconButton>
          </Tooltip>
        )}
        {!toolTipsHidden && (
          <Tooltip title="Go to Flickr">
            <IconButton
              href={FLICKR_IMAGE_PREFIX + photo.id}
              target="_blank"
              rel="noreferrer"
              aria-label="Go to Flickr"
            >
              <OpenInNewIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {!toolTipsHidden && (
          <Tooltip title="Download photo">
            <IconButton
              href={photo.origin}
              download
              target="_blank"
              rel="noreferrer"
              aria-label="Download photo"
            >
              <DownloadIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
        >
          New tags copied to clipboard
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PhotoInfoPanel;
