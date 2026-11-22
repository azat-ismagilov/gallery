import { Autocomplete, TextField } from "@mui/material";
import { Fragment, type ReactNode } from "react";

import { places } from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";
import { usePhotoInfo } from "@/context/PhotoInfoContext";
import type { PersonTag } from "@/types/gallery";

function CommaSeparated({ items }: { items: ReactNode[] }) {
  return (
    <>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional separator around already-keyed nodes
        <Fragment key={index}>
          {index > 0 && ", "}
          {item}
        </Fragment>
      ))}
    </>
  );
}

const PhotographerInfo = () => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.photographer.length === 0) {
    return null;
  }

  const photographer = photoInfo.photographer.map((name) => (
    <span key={name}>{name}</span>
  ));

  return (
    <div>
      Photographer: <CommaSeparated items={photographer} />
    </div>
  );
};

const PhotographerEdit = () => {
  const { photoInfo, setPhotographer } = usePhotoInfo();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={photoInfo.photographer}
      onChange={(_event, newValue) => {
        setPhotographer(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Photographer" variant="filled" />
      )}
    />
  );
};

const AlbumInfo = () => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.album.length === 0) {
    return null;
  }

  const formatLink = (album: string) => `?album=${album}`.replaceAll(" ", "+");

  const albumLinks = photoInfo.album.map((album) => (
    <a key={album} href={formatLink(album)}>
      {album}
    </a>
  ));

  return (
    <div>
      Album: <CommaSeparated items={albumLinks} />
    </div>
  );
};

const AlbumEdit = () => {
  const { photoInfo, setAlbum } = usePhotoInfo();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={places.map(({ year }) => year)}
      value={photoInfo.album}
      onChange={(_event, newValue) => {
        setAlbum(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Album" variant="filled" />
      )}
    />
  );
};

const EventInfo = () => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.event.length === 0) {
    return null;
  }

  const formatLink = (event: string) =>
    `?album=${photoInfo.album[0] ?? ""}&event=${event}`.replaceAll(" ", "+");

  const eventLinks = photoInfo.event.map((event) => (
    <a key={event} href={formatLink(event)}>
      {event}
    </a>
  ));

  return (
    <div>
      Event: <CommaSeparated items={eventLinks} />
    </div>
  );
};

const EventEdit = () => {
  const { photoInfo, setEvent } = usePhotoInfo();
  const { events } = useAppContext();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={events}
      value={photoInfo.event}
      onChange={(_event, newValue) => {
        setEvent(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Event" variant="filled" />
      )}
    />
  );
};

const TeamInfo = () => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.team.length === 0) {
    return null;
  }

  const formatLink = (team: string) =>
    `?album=${photoInfo.album[0] ?? ""}&team=${team}`.replaceAll(" ", "+");

  const teamLinks = photoInfo.team.map((team) => (
    <a key={team} href={formatLink(team)}>
      {team}
    </a>
  ));

  return (
    <div>
      Team: <CommaSeparated items={teamLinks} />
    </div>
  );
};

const TeamEdit = () => {
  const { photoInfo, setTeam } = usePhotoInfo();
  const { teams } = useAppContext();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={teams}
      value={photoInfo.team}
      onChange={(_event, newValue) => {
        setTeam(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Team" variant="filled" />
      )}
    />
  );
};

const PersonInfo = ({
  setFace,
}: {
  setFace: (person: PersonTag | null) => void;
}) => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.person.length === 0) {
    return null;
  }

  const sortedPersons = [...photoInfo.person].sort(
    (a, b) => (a.position?.left ?? 1) - (b.position?.left ?? 1),
  );

  const formatLink = (person: PersonTag) =>
    `?album=${photoInfo.album[0] ?? ""}&person=${person.name}`.replaceAll(
      " ",
      "+",
    );

  const personLinks = sortedPersons.map((person) => (
    <a
      key={`${person.name}-${person.position?.left ?? "none"}`}
      href={formatLink(person)}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      {person.name}
    </a>
  ));

  return (
    <div>
      Person: <CommaSeparated items={personLinks} />
    </div>
  );
};

const PersonEdit = () => {
  const { photoInfo, setPerson } = usePhotoInfo();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      options={[] as PersonTag[]}
      value={photoInfo.person}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(a, b) =>
        a.name === b.name && a.position?.left === b.position?.left
      }
      onChange={(_event, newValue) => {
        setPerson(newValue);
      }}
      fullWidth={false}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Person"
          placeholder="Drag to add new face"
          variant="filled"
        />
      )}
    />
  );
};

export {
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
};
