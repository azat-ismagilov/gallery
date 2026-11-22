import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FaceIcon from "@mui/icons-material/Face";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { forwardRef, useState } from "react";

import {
  FLICKR_IMAGE_PREFIX,
  places,
  SUGGESTIONS_EMAIL,
} from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";
import { usePhotoInfo } from "@/context/PhotoInfoContext";
import type { PersonTag, Photo } from "@/types/gallery";
import { SerializePhotoInfo } from "@/utils/photoTags";

interface MetadataSectionProps {
  label: string;
  children: React.ReactNode;
}

const MetadataSection = ({ label, children }: MetadataSectionProps) => (
  <Box>
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ display: "block", mb: 0.5, lineHeight: 1.4 }}
    >
      {label}
    </Typography>
    <Stack
      direction="row"
      spacing={0.75}
      useFlexGap
      sx={{ flexWrap: "wrap", alignItems: "center" }}
    >
      {children}
    </Stack>
  </Box>
);

export interface PhotoInfoSidebarProps {
  photo: Photo;
  desktop: boolean;
  /** Desktop: closes the collapsible right sidebar. */
  onCloseSidebar?: () => void;
  /** Mobile: smoothly scrolls the bottom info panel into view when header is tapped. */
  onFocusSidebar?: () => void;
}

/**
 * Unified MUI photo details & tag-editing sidebar shared by desktop and mobile.
 *
 * - On desktop (Google Photos layout): rendered as a 360px right-hand sidebar.
 * - On mobile (Adobe Lightroom layout): rendered directly below the photo stage
 *   in the vertically scrollable viewer container.
 */
const PhotoInfoSidebar = forwardRef<HTMLDivElement, PhotoInfoSidebarProps>(
  ({ photo, desktop, onCloseSidebar, onFocusSidebar }, ref) => {
    const { events, teams, selectFilter } = useAppContext();
    const {
      photoInfo,
      isLoading,
      editMode,
      setEditMode,
      face,
      setFace,
      setEvent,
      setTeam,
      setAlbum,
      setPhotographer,
      setPerson,
    } = usePhotoInfo();

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const primaryAlbum = photoInfo?.album[0];
    const photoLink = `${FLICKR_IMAGE_PREFIX}${photo.id}`;
    const serializedTags = SerializePhotoInfo(photoInfo).join(", ");
    const emailSubject = `Photo info update ${photo.id}`;
    const emailBody = `Photo link: ${photoLink}\n\nGallery link: ${window.location.href}\n\nTags: ${serializedTags}`;

    const mailtoLink = `mailto:${SUGGESTIONS_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(SUGGESTIONS_EMAIL)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const handleCopyTags = () => {
      void navigator.clipboard.writeText(serializedTags);
      setEditMode(false);
      setSnackbarOpen(true);
    };

    const sortedPeople: PersonTag[] = photoInfo
      ? [...photoInfo.person].sort(
          (a, b) => (a.position?.left ?? 1) - (b.position?.left ?? 1),
        )
      : [];

    const hasAnyMetadata = Boolean(
      photoInfo &&
        (photoInfo.photographer.length > 0 ||
          photoInfo.album.length > 0 ||
          photoInfo.event.length > 0 ||
          photoInfo.team.length > 0 ||
          photoInfo.person.length > 0),
    );

    return (
      <Paper
        ref={ref}
        square
        sx={{
          width: desktop ? 360 : "100%",
          flexShrink: 0,
          height: desktop ? "100%" : "auto",
          minHeight: desktop ? undefined : "50dvh",
          overflowY: desktop ? "auto" : "visible",
          borderRadius: 0,
          borderLeft: desktop ? 1 : 0,
          borderTop: desktop ? 0 : 1,
          borderColor: "divider",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header bar — doubles as the bottom peek bar on mobile (Lightroom-style) */}
        <Stack
          direction="row"
          onClick={!desktop ? onFocusSidebar : undefined}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            height: 56,
            flexShrink: 0,
            cursor: !desktop && onFocusSidebar ? "pointer" : "default",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {!desktop && <ExpandLessIcon fontSize="small" color="action" />}
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Info
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            {photoInfo && (
              <Tooltip title={editMode ? "Exit edit mode" : "Edit photo tags"}>
                <IconButton
                  size="small"
                  color={editMode ? "primary" : "default"}
                  aria-label={editMode ? "Exit edit mode" : "Edit photo tags"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(!editMode);
                  }}
                >
                  {editMode ? <CloseIcon /> : <EditIcon />}
                </IconButton>
              </Tooltip>
            )}
            {desktop && onCloseSidebar && (
              <Tooltip title="Close info sidebar">
                <IconButton
                  size="small"
                  aria-label="Close info sidebar"
                  onClick={onCloseSidebar}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <Divider />

        {/* Sidebar content */}
        <Box sx={{ p: 2, flex: "1 1 auto" }}>
          {isLoading ? (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", py: 3 }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading photo details...
              </Typography>
            </Stack>
          ) : !photoInfo ? (
            <Typography variant="body2" color="text.secondary">
              No metadata available for this photo.
            </Typography>
          ) : editMode ? (
            <Stack spacing={2}>
              <Typography variant="caption" color="text.secondary">
                Edit tags below or drag a rectangle directly on the photo to tag
                a face, then copy or email your suggested update.
              </Typography>

              <Autocomplete
                multiple
                options={[] as PersonTag[]}
                value={photoInfo.person}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) =>
                  a.name === b.name && a.position?.left === b.position?.left
                }
                onChange={(_event, newValue) => setPerson(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="People"
                    placeholder="Drag on photo to add face"
                    variant="filled"
                    size="small"
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={events}
                value={photoInfo.event}
                onChange={(_event, newValue) => setEvent(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Event"
                    variant="filled"
                    size="small"
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={teams}
                value={photoInfo.team}
                onChange={(_event, newValue) => setTeam(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Team"
                    variant="filled"
                    size="small"
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={[] as string[]}
                value={photoInfo.photographer}
                onChange={(_event, newValue) => setPhotographer(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Photographer"
                    variant="filled"
                    size="small"
                  />
                )}
              />

              <Autocomplete
                multiple
                freeSolo
                options={places.map(({ year }) => year)}
                value={photoInfo.album}
                onChange={(_event, newValue) => setAlbum(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Album"
                    variant="filled"
                    size="small"
                  />
                )}
              />

              <Divider />

              <Stack spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyTags}
                  fullWidth
                >
                  Copy tags to clipboard
                </Button>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon color="error" />}
                    href={gmailLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setEditMode(false)}
                    fullWidth
                  >
                    Gmail
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EmailOutlinedIcon />}
                    href={mailtoLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setEditMode(false)}
                    fullWidth
                  >
                    Email
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          ) : !hasAnyMetadata ? (
            <Typography variant="body2" color="text.secondary">
              No tags recorded for this photo yet.
            </Typography>
          ) : (
            <Stack spacing={2.5}>
              {photoInfo.photographer.length > 0 && (
                <MetadataSection label="Photographer">
                  {photoInfo.photographer.map((name) => (
                    <Chip key={name} label={name} size="small" />
                  ))}
                </MetadataSection>
              )}

              {photoInfo.album.length > 0 && (
                <MetadataSection label="Album">
                  {photoInfo.album.map((album) => (
                    <Chip
                      key={album}
                      label={album}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => selectFilter({ year: album })}
                    />
                  ))}
                </MetadataSection>
              )}

              {photoInfo.event.length > 0 && (
                <MetadataSection label="Event">
                  {photoInfo.event.map((event) => (
                    <Chip
                      key={event}
                      label={event}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() =>
                        selectFilter({ year: primaryAlbum, event })
                      }
                    />
                  ))}
                </MetadataSection>
              )}

              {photoInfo.team.length > 0 && (
                <MetadataSection label="Team">
                  {photoInfo.team.map((team) => (
                    <Chip
                      key={team}
                      label={team}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => selectFilter({ year: primaryAlbum, team })}
                    />
                  ))}
                </MetadataSection>
              )}

              {sortedPeople.length > 0 && (
                <MetadataSection label="People">
                  {sortedPeople.map((person) => {
                    const isHighlighted = face?.name === person.name;
                    return (
                      <Chip
                        key={`${person.name}-${person.position?.left ?? "none"}`}
                        label={person.name}
                        size="small"
                        icon={person.position ? <FaceIcon /> : undefined}
                        color={isHighlighted ? "warning" : "default"}
                        variant={isHighlighted ? "filled" : "outlined"}
                        clickable
                        onMouseEnter={() => setFace(person)}
                        onMouseLeave={() => setFace(null)}
                        onClick={() =>
                          selectFilter({
                            year: primaryAlbum,
                            person: person.name,
                          })
                        }
                      />
                    );
                  })}
                </MetadataSection>
              )}
            </Stack>
          )}
        </Box>

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
      </Paper>
    );
  },
);

PhotoInfoSidebar.displayName = "PhotoInfoSidebar";

export default PhotoInfoSidebar;
