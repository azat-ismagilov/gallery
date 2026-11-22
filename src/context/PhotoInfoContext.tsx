import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAppContext } from "@/context/AppContext";
import { getCachedPhotoInfo, getPhotoInfo } from "@/services/flickrApi";
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
    setFace(null);
    setEditMode(false);

    if (fullscreenPhotoId === null) {
      setPhotoInfo(null);
      setIsLoading(false);
      return;
    }

    // Hydrate instantaneously when metadata was already cached or prefetched.
    const cached = getCachedPhotoInfo(fullscreenPhotoId);
    if (cached) {
      const tags = cached.photo?.tags?.tag?.map((tag) => tag.raw);
      const description = cached.photo?.description?._content;
      setPhotoInfo(ParsePhotoInfo(tags, description));
      setIsLoading(false);
      return;
    }

    setPhotoInfo(null);
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

  const setEvent = useCallback((newEvents: string[]) => {
    setPhotoInfo((prev) => (prev ? { ...prev, event: newEvents } : prev));
  }, []);

  const setPerson = useCallback((newPerson: PersonTag[]) => {
    setPhotoInfo((prev) => (prev ? { ...prev, person: newPerson } : prev));
  }, []);

  const appendPerson = useCallback((newPerson: PersonTag) => {
    setPhotoInfo((prev) =>
      prev ? { ...prev, person: [...prev.person, newPerson] } : prev,
    );
  }, []);

  const setAlbum = useCallback((newAlbum: string[]) => {
    setPhotoInfo((prev) => (prev ? { ...prev, album: newAlbum } : prev));
  }, []);

  const setPhotographer = useCallback((newPhotographer: string[]) => {
    setPhotoInfo((prev) =>
      prev ? { ...prev, photographer: newPhotographer } : prev,
    );
  }, []);

  const setTeam = useCallback((newTeam: string[]) => {
    setPhotoInfo((prev) => (prev ? { ...prev, team: newTeam } : prev));
  }, []);

  const value = useMemo<PhotoInfoContextValue>(
    () => ({
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
    }),
    [
      photoInfo,
      isLoading,
      editMode,
      face,
      setEvent,
      setPerson,
      setAlbum,
      setTeam,
      setPhotographer,
      appendPerson,
    ],
  );

  return (
    <PhotoInfoContext.Provider value={value}>
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
