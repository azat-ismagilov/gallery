import {
  Autocomplete,
  Box,
  createFilterOptions,
  Paper,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { useAppContext } from "@/context/AppContext";
import { usePhotoInfo } from "@/context/PhotoInfoContext";
import { getPeopleData } from "@/services/dataLoader";
import type { PersonTag, Photo } from "@/types/gallery";
import FaceBox from "./FaceBox";

import "@/styles/Body.css";

const filterOptions = createFilterOptions<string>({ limit: 200 });

interface ImageWithFaceSelectionProps {
  photo: Photo;
  alt?: string;
  face: PersonTag | null;
  setFace: (person: PersonTag | null) => void;
}

const ImageWithFaceSelection = ({
  photo,
  alt = "",
  face,
  setFace,
}: ImageWithFaceSelectionProps) => {
  const { data } = useAppContext();
  const { photoInfo, editMode, appendPerson } = usePhotoInfo();
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [people, setPeople] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    void getPeopleData(data.year).then((peopleData) => {
      if (!isCancelled) {
        setPeople(peopleData);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [data.year]);

  function calculateImageSize(naturalWidth: number, naturalHeight: number) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    if (naturalWidth <= 0 || naturalHeight <= 0) {
      return { width: screenWidth, height: screenHeight };
    }
    const ratio = Math.min(
      screenWidth / naturalWidth,
      screenHeight / naturalHeight,
    );
    return {
      width: naturalWidth * ratio,
      height: naturalHeight * ratio,
    };
  }

  const { width, height } = calculateImageSize(photo.width, photo.height);

  function createPerson(name: string | null, currentCrop: Crop) {
    if (name) {
      const person: PersonTag = {
        name,
        position: {
          top: currentCrop.y / height,
          left: currentCrop.x / width,
          right: (currentCrop.x + currentCrop.width) / width,
          bottom: (currentCrop.y + currentCrop.height) / height,
        },
      };
      appendPerson(person);
      setCrop(undefined);
    }
  }

  return (
    <Box sx={{ width, height }}>
      <ReactCrop crop={crop} onChange={(c) => setCrop(c)} disabled={!editMode}>
        <img width={width} height={height} src={photo.url} alt={alt} />
        {photoInfo?.person.map((person) => (
          <FaceBox
            person={person}
            setFace={setFace}
            hidden={!editMode && face?.name !== person.name}
            key={`${person.name}-${person.position?.top ?? "none"}-${person.position?.left ?? "none"}`}
          />
        ))}
      </ReactCrop>
      {crop && crop.height !== 0 && (
        <Paper
          style={{
            position: "absolute",
            left: crop.x,
            top: crop.y + crop.height,
            width: Math.max(crop.width, 200),
          }}
          elevation={3}
        >
          <Autocomplete
            filterOptions={filterOptions}
            options={people}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} placeholder="Enter a name" />
            )}
            onChange={(_event, newValue) => createPerson(newValue, crop)}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ImageWithFaceSelection;
