import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FaceIcon from "@mui/icons-material/Face";
import KeyIcon from "@mui/icons-material/Key";
import LinkIcon from "@mui/icons-material/Link";
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";
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
import { useAppContext } from "@/features/gallery/state/AppContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import { SerializePhotoInfo } from "@/features/viewer/utils/photoTags";
import {
  getPersonTagKey,
  type ListDiff,
  type PhotoInfoDiff,
} from "@/features/viewer/utils/suggestions";
import { useFlickrAuth } from "@/services/flickr/authStore";
import type { PersonTag, Photo } from "@/types/gallery";

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

function StringDiffSection({
  label,
  diff,
}: {
  label: string;
  diff: ListDiff<string>;
}) {
  if (
    diff.added.length === 0 &&
    diff.removed.length === 0 &&
    diff.unchanged.length === 0
  ) {
    return null;
  }

  return (
    <MetadataSection label={label}>
      {diff.unchanged.map((item) => (
        <Chip key={`same-${item}`} label={item} size="small" />
      ))}
      {diff.added.map((item) => (
        <Chip
          key={`add-${item}`}
          label={`+ ${item}`}
          size="small"
          color="success"
        />
      ))}
      {diff.removed.map((item) => (
        <Chip
          key={`del-${item}`}
          label={`- ${item}`}
          size="small"
          color="error"
          variant="outlined"
          sx={{ textDecoration: "line-through" }}
        />
      ))}
    </MetadataSection>
  );
}

function SuggestionDiffView({
  diff,
  setFace,
}: {
  diff: PhotoInfoDiff;
  setFace: (person: PersonTag | null) => void;
}) {
  const hasPeople =
    diff.person.added.length > 0 ||
    diff.person.removed.length > 0 ||
    diff.person.unchanged.length > 0;

  return (
    <Stack spacing={2}>
      <StringDiffSection label="Photographer" diff={diff.photographer} />
      <StringDiffSection label="Album" diff={diff.album} />
      <StringDiffSection label="Event" diff={diff.event} />
      <StringDiffSection label="Team" diff={diff.team} />
      {hasPeople && (
        <MetadataSection label="People">
          {diff.person.unchanged.map((person) => (
            <Chip
              key={`same-${getPersonTagKey(person)}`}
              label={person.name}
              size="small"
              icon={person.position ? <FaceIcon /> : undefined}
              onMouseEnter={() => setFace(person)}
              onMouseLeave={() => setFace(null)}
            />
          ))}
          {diff.person.added.map((person) => (
            <Chip
              key={`add-${getPersonTagKey(person)}`}
              label={`+ ${person.name}`}
              size="small"
              color="success"
              icon={person.position ? <FaceIcon /> : undefined}
              onMouseEnter={() => setFace(person)}
              onMouseLeave={() => setFace(null)}
            />
          ))}
          {diff.person.removed.map((person) => (
            <Chip
              key={`del-${getPersonTagKey(person)}`}
              label={`- ${person.name}`}
              size="small"
              color="error"
              variant="outlined"
              icon={person.position ? <FaceIcon /> : undefined}
              sx={{ textDecoration: "line-through" }}
              onMouseEnter={() => setFace(person)}
              onMouseLeave={() => setFace(null)}
            />
          ))}
        </MetadataSection>
      )}
    </Stack>
  );
}

export interface PhotoInfoSidebarProps {
  photo: Photo;
  desktop: boolean;
  /** Desktop: closes the collapsible right sidebar. */
  onCloseSidebar?: () => void;
  /** Mobile: smoothly scrolls the bottom info panel into view when header is tapped. */
  onFocusSidebar?: () => void;
}

/**
 * Unified MUI photo details, suggestion preview, and tag-editing sidebar
 * shared by desktop (Google Photos right rail) and mobile (Adobe Lightroom
 * scrollable bottom panel).
 */
const PhotoInfoSidebar = forwardRef<HTMLDivElement, PhotoInfoSidebarProps>(
  ({ photo, desktop, onCloseSidebar, onFocusSidebar }, ref) => {
    const { events, teams, selectFilter, openSettings } = useAppContext();
    const { isAuthenticated } = useFlickrAuth();
    const {
      photoInfo,
      suggestedPhotoInfo,
      isPreviewingSuggestion,
      activeDiff,
      isLoading,
      isSaving,
      saveError,
      editMode,
      setEditMode,
      face,
      setFace,
      setEvent,
      setTeam,
      setAlbum,
      setPhotographer,
      setPerson,
      resetDraft,
      loadSuggestionIntoEditor,
      dismissSuggestion,
      buildSuggestionPreviewUrl,
      saveToFlickr,
    } = usePhotoInfo();

    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    const primaryAlbum = photoInfo?.album[0];
    const photoLink = `${FLICKR_IMAGE_PREFIX}${photo.id}`;
    const serializedTags = SerializePhotoInfo(photoInfo).join(", ");
    const previewUrl = buildSuggestionPreviewUrl();

    const emailSubject = `Photo info update ${photo.id}`;
    const emailBody = [
      `Photo link: ${photoLink}`,
      previewUrl
        ? `Preview & approve link: ${previewUrl}`
        : `Gallery link: ${window.location.href}`,
      `Tags: ${serializedTags}`,
    ].join("\n\n");

    const mailtoLink = `mailto:${SUGGESTIONS_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(SUGGESTIONS_EMAIL)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const handleCopyTags = () => {
      void navigator.clipboard.writeText(serializedTags);
      setSnackbarMessage("Tags copied to clipboard");
    };

    const handleCopyPreviewLink = () => {
      if (!previewUrl) {
        return;
      }
      void navigator.clipboard.writeText(previewUrl);
      setSnackbarMessage("Suggestion preview link copied to clipboard");
    };

    const handleSaveToFlickr = async (targetInfo = photoInfo ?? undefined) => {
      const result = await saveToFlickr(targetInfo);
      if (result.ok) {
        setSnackbarMessage("Photo tags updated on Flickr");
      }
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
              {isPreviewingSuggestion ? "Suggested changes" : "Info"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            {isAuthenticated && (
              <Tooltip title="Flickr write token active (Settings)">
                <IconButton
                  size="small"
                  color="success"
                  aria-label="Flickr settings"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSettings();
                  }}
                >
                  <KeyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {photoInfo && !isPreviewingSuggestion && (
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
          ) : isPreviewingSuggestion && activeDiff && suggestedPhotoInfo ? (
            <Stack spacing={2}>
              <Alert severity="info">
                {activeDiff.hasChanges
                  ? "Review the suggested additions (+) and removals (-) below."
                  : "This suggestion matches the current photo tags."}
              </Alert>

              {saveError && <Alert severity="error">{saveError}</Alert>}

              <SuggestionDiffView diff={activeDiff} setFace={setFace} />

              <Divider />

              <Stack spacing={1}>
                {isAuthenticated ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <CheckIcon />
                      )
                    }
                    disabled={isSaving || !activeDiff.hasChanges}
                    onClick={() => {
                      void handleSaveToFlickr(suggestedPhotoInfo);
                    }}
                    fullWidth
                  >
                    {isSaving ? "Applying to Flickr..." : "Approve & apply"}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<KeyIcon />}
                    onClick={openSettings}
                    fullWidth
                  >
                    Add Flickr token to approve
                  </Button>
                )}

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={loadSuggestionIntoEditor}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={dismissSuggestion}
                    fullWidth
                  >
                    Dismiss
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          ) : editMode ? (
            <Stack spacing={2}>
              <Typography variant="caption" color="text.secondary">
                Edit tags below or drag a rectangle directly on the photo to tag
                a face.
              </Typography>

              {saveError && <Alert severity="error">{saveError}</Alert>}

              <Autocomplete
                multiple
                options={[] as PersonTag[]}
                value={photoInfo.person}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) =>
                  getPersonTagKey(a) === getPersonTagKey(b)
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

              {activeDiff?.hasChanges && (
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, bgcolor: "background.paper" }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">Preview changes</Typography>
                    <Button
                      size="small"
                      startIcon={<RestoreIcon />}
                      onClick={resetDraft}
                    >
                      Reset
                    </Button>
                  </Stack>
                  <SuggestionDiffView diff={activeDiff} setFace={setFace} />
                </Paper>
              )}

              <Divider />

              <Stack spacing={1}>
                {isAuthenticated && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    disabled={isSaving || !activeDiff?.hasChanges}
                    onClick={() => {
                      void handleSaveToFlickr(photoInfo);
                    }}
                    fullWidth
                  >
                    {isSaving ? "Saving to Flickr..." : "Save to Flickr"}
                  </Button>
                )}

                <Button
                  variant={isAuthenticated ? "outlined" : "contained"}
                  startIcon={<LinkIcon />}
                  disabled={!previewUrl}
                  onClick={handleCopyPreviewLink}
                  fullWidth
                >
                  Copy suggestion preview link
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyTags}
                  fullWidth
                >
                  Copy raw tags
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
                        key={getPersonTagKey(person)}
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
          open={snackbarMessage !== null}
          autoHideDuration={2500}
          onClose={() => setSnackbarMessage(null)}
        >
          <Alert
            onClose={() => setSnackbarMessage(null)}
            severity="success"
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    );
  },
);

PhotoInfoSidebar.displayName = "PhotoInfoSidebar";

export default PhotoInfoSidebar;
