import React, { createContext, useContext, useEffect, useState, Dispatch, SetStateAction, ReactNode } from "react";

import { ParsePhotoInfo } from "../../../Util/PhotoInfoHelper";
import PhotoService from "../../../Util/PhotoService";
import { useAppContext } from "../../AppContext";

export interface Person {
  name: string;
  position?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

export interface PhotoInfo {
  event: string[];
  team: string[];
  person: Person[];
  album: string[];
  photographer: string[];
}

export interface PhotoInfoContextType {
  photoInfo: PhotoInfo | null;
  setPhotoInfo: Dispatch<SetStateAction<PhotoInfo | null>>;
  editMode: boolean;
  setEditMode: Dispatch<SetStateAction<boolean>>;
  face: Person | null;
  setFace: Dispatch<SetStateAction<Person | null>>;
  setEvents: (newEvents: string[]) => void;
  setPerson: (newPerson: Person[]) => void;
  setAlbum: (newAlbum: string[]) => void;
  setTeam: (newTeam: string[]) => void;
  setPhotographer: (newPhotographer: string[]) => void;
  appendPerson: (newPerson: Person) => void;
}

const PhotoInfoContext = createContext<PhotoInfoContextType>({} as PhotoInfoContextType);

export const PhotoInfoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fullscreenPhotoId } = useAppContext();

  const [photoInfo, setPhotoInfo] = useState<PhotoInfo | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [face, setFace] = useState<Person | null>(null);

  useEffect(() => {
    if (fullscreenPhotoId === null) {
      return;
    }
    PhotoService.getPhotoInfo(fullscreenPhotoId).then((response) => {
      const tags = response.data?.photo?.tags?.tag?.map(
        (tag: { raw: string }) => tag.raw,
      );
      const description = response.data?.photo?.description._content;
      const newPhotoInfo = ParsePhotoInfo(tags, description);
      setPhotoInfo(newPhotoInfo);
    });
  }, [fullscreenPhotoId]);

  const setEvents = (newEvents: string[]) => {
    setPhotoInfo((prevState) =>
      prevState ? { ...prevState, event: newEvents } : null,
    );
  };

  const setPerson = (newPerson: Person[]) => {
    setPhotoInfo((prevState) =>
      prevState ? { ...prevState, person: newPerson } : null,
    );
  };

  const appendPerson = (newPerson: Person) => {
    setPhotoInfo((prevState) =>
      prevState
        ? { ...prevState, person: [...prevState.person, newPerson] }
        : null,
    );
  };

  const setAlbum = (newAlbum: string[]) => {
    setPhotoInfo((prevState) =>
      prevState ? { ...prevState, album: newAlbum } : null,
    );
  };

  const setPhotographer = (newPhotographer: string[]) => {
    setPhotoInfo((prevState) =>
      prevState ? { ...prevState, photographer: newPhotographer } : null,
    );
  };

  const setTeam = (newTeam: string[]) => {
    setPhotoInfo((prevState) =>
      prevState ? { ...prevState, team: newTeam } : null,
    );
  };

  const contextValue: PhotoInfoContextType = {
    photoInfo,
    setPhotoInfo,
    editMode,
    setEditMode,
    face,
    setFace,
    setEvents,
    setPerson,
    setAlbum,
    setTeam,
    setPhotographer,
    appendPerson,
  };

  return (
    <PhotoInfoContext.Provider value={contextValue}>
      {children}
    </PhotoInfoContext.Provider>
  );
};

export const usePhotoInfo = (): PhotoInfoContextType => {
  const context = useContext(PhotoInfoContext);
  if (context === undefined) {
    throw new Error("usePhotoInfo must be used within a PhotoInfoProvider");
  }
  return context;
};
