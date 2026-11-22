import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAppContext } from "@/context/AppContext";
import { getPhotoInfo } from "@/services/flickrApi";
import type { PersonTag, PhotoInfo } from "@/types/gallery";
import { ParsePhotoInfo } from "@/utils/photoTags";

export interface PhotoInfoContextValue {
  photoInfo: PhotoInfo | null;
  isLoading: boolean;
  setPhotoInfo: (info: PhotoInfo | null) => void;
  editMode: boolean;
  setEditMode: (editing: boolean) => void;
  face: PersonTag | null;
  setFace: (person: PersonTag | null) => void;
  setEvent: (newEvents: string[]) => void;
  setPerson: (newPerson: PersonTag[]) => void;
  setAlbum: (newAlbum: string[]) => void;
  setTeam: (newTeam: string[]) => void;
  setPhotographer: (newPhotographer: string[]) => void;
  appendPerson: (newPerson: PersonTag) => void;
}

const PhotoInfoContext = createContext<PhotoInfoContextValue | null>(null);

const PhotoInfoProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useAppContext();

  const [photoInfo, setPhotoInfo] = useState<PhotoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [face, setFace] = useState<PersonTag | null>(null);

  useEffect(() => {
    const fullscreenPhotoId = data.fullscreenPhotoId;
    setPhotoInfo(null);
    setFace(null);
    setEditMode(false);

    if (fullscreenPhotoId === null) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    void getPhotoInfo(fullscreenPhotoId, { signal: controller.signal }).then(
      (response) => {
        if (controller.signal.aborted) {
          return;
        }
        setIsLoading(false);
        if (!response) {
          return;
        }
        const tags = response.photo?.tags?.tag?.map((tag) => tag.raw);
        const description = response.photo?.description?._content;
        setPhotoInfo(ParsePhotoInfo(tags, description));
      },
    );

    return () => {
      controller.abort();
    };
  }, [data.fullscreenPhotoId]);

  function setEvent(newEvents: string[]) {
    setPhotoInfo((prev) => (prev ? { ...prev, event: newEvents } : prev));
  }

  function setPerson(newPerson: PersonTag[]) {
    setPhotoInfo((prev) => (prev ? { ...prev, person: newPerson } : prev));
  }

  function appendPerson(newPerson: PersonTag) {
    setPhotoInfo((prev) =>
      prev ? { ...prev, person: [...prev.person, newPerson] } : prev,
    );
  }

  function setAlbum(newAlbum: string[]) {
    setPhotoInfo((prev) => (prev ? { ...prev, album: newAlbum } : prev));
  }

  function setPhotographer(newPhotographer: string[]) {
    setPhotoInfo((prev) =>
      prev ? { ...prev, photographer: newPhotographer } : prev,
    );
  }

  function setTeam(newTeam: string[]) {
    setPhotoInfo((prev) => (prev ? { ...prev, team: newTeam } : prev));
  }

  return (
    <PhotoInfoContext.Provider
      value={{
        photoInfo,
        isLoading,
        setPhotoInfo,
        editMode,
        setEditMode,
        face,
        setFace,
        setEvent,
        setPerson,
        setAlbum,
        setTeam,
        setPhotographer,
        appendPerson,
      }}
    >
      {children}
    </PhotoInfoContext.Provider>
  );
};

const usePhotoInfo = (): PhotoInfoContextValue => {
  const context = useContext(PhotoInfoContext);
  if (context === null) {
    throw new Error("usePhotoInfo must be called within PhotoInfoProvider");
  }
  return context;
};

export { PhotoInfoProvider, usePhotoInfo };
