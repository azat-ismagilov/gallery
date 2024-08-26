import React, { FC, useEffect, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  Autocomplete,
  Box,
  Paper,
  TextField,
  createFilterOptions,
  AutocompleteRenderInputParams,
  BoxProps,
  PaperProps,
  AutocompleteProps,
  TextFieldProps,
} from "@mui/material";
import { SxProps, Theme } from "@mui/system";

import { getPeopleData } from "../../Util/DataLoader";
import { useAppContext } from "../AppContext";

import FaceDiv from "./FaceDiv";
import { usePhotoInfo } from "./PhotoInfo/PhotoInfoContext";

import "../../styles/Body.css";

interface Photo {
  width: number;
  height: number;
  url: string;
}

interface PersonPosition {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Person {
  name: string;
  position?: PersonPosition;
}

interface ImageWithFaceSelectionProps {
  photo: Photo;
  alt?: string;
  face: Person | null;
  setFace: (person: Person | null) => void;
}

const ImageWithFaceSelection: FC<ImageWithFaceSelectionProps> = ({
  photo,
  alt = "",
  face,
  setFace,
}) => {
  const { year } = useAppContext();
  const { photoInfo, editMode, appendPerson } = usePhotoInfo();
  const [crop, setCrop] = useState<Crop>();

  const [people, setPeople] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    getPeopleData(year || "").then((peopleData) => {
      if (!isCancelled) {
        setPeople(peopleData);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [year]);

  function calculateImageSize(
    naturalWidth: number,
    naturalHeight: number,
  ): { width: number; height: number } {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
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

  function createPerson(name: string | null, crop: Crop) {
    if (name && crop.width && crop.height) {
      const person: Person = {
        name: name,
        position: {
          top: (crop.y || 0) / height,
          left: (crop.x || 0) / width,
          right: ((crop.x || 0) + crop.width) / width,
          bottom: ((crop.y || 0) + crop.height) / height,
        },
      };
      appendPerson(person);
      setCrop(undefined);
    }
  }

  const filterOptions = createFilterOptions<string>({ limit: 200 });

  return (
    <Box sx={{ width, height }} component="div">
      <ReactCrop crop={crop} onChange={(c: Crop) => setCrop(c)} disabled={!editMode}>
        <img width={width} height={height} src={photo.url} alt={alt} />
        {photoInfo?.person?.map((person) => (
          <FaceDiv
            person={person}
            setFace={setFace}
            hidden={!editMode && face?.name !== person.name}
            key={person.name + (person.position?.top ?? 0)}
          />
        ))}
      </ReactCrop>
      {crop && crop.height !== 0 && (
        <Paper
          sx={{
            position: "absolute",
            left: crop.x,
            top: crop.y && crop.height ? crop.y + crop.height : 0,
            width: Math.max(crop.width || 0, 200),
          }}
          elevation={3}
        >
          <Autocomplete<string, false, false, true>
            filterOptions={filterOptions}
            options={people}
            freeSolo
            renderInput={(params: AutocompleteRenderInputParams) => (
              <TextField {...params} placeholder="Enter a name" />
            )}
            onChange={(_, newValue: string | null) => createPerson(newValue, crop)}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ImageWithFaceSelection;
