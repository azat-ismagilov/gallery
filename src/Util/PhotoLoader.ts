import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppContext } from "../components/AppContext";
import { TAG_ALBUM, places, GalleryConsts } from "../consts";
import PhotoService from "./PhotoService";
import UniqueList from "./UniqueList";
import { AxiosResponse } from "axios";

interface Photo {
  url_preview: string;
  url: string;
  width: number;
  height: number;
  id: string;
  origin: string;
  year: string;
}

type PhotosByEvent = Map<string, Photo[]>;

/**
 * Custom hook that loads photos based on the current app context.
 * @returns {Object} - An object containing the following properties:
 * - hasMorePhotos: A function that returns a boolean indicating whether there are more photos to load.
 * - loadMorePhotos: A function that loads more photos.
 * - photosByEvent: A Map object containing photo objects grouped by event.
 * - photosList: An array of all photo objects.
 */
export const usePhotoLoader = (): {
  hasMorePhotos: () => boolean;
  loadMorePhotos: () => Promise<void>;
  photosByEvent: PhotosByEvent;
  photosList: Photo[];
} => {
  const { year, event, text, team, person } = useAppContext();
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const loadPhotos = useCallback(async () => {
    let response: AxiosResponse<PhotoServiceResponse>;
    if (text) {
      response = await PhotoService.getAllWithText(text, page);
    } else if (team) {
      response = await PhotoService.getAllWithTeam(year || "", team, page);
    } else if (person) {
      response = await PhotoService.getAllWithPerson(year || "", person, page);
    } else {
      response = await PhotoService.getAllWithEvent(year || "", event || "", page);
    }

    const newPhotos = response.data.photos.photo.map((photo: PhotoData) => ({
      id: photo.id,
      url: photo.url_l || photo.url_c || photo.url_m,
      url_preview: photo.url_m,
      width: parseInt(photo.width_l || photo.width_c || photo.width_m),
      height: parseInt(photo.height_l || photo.height_c || photo.height_m),
      origin: photo.url_o,
      year: photo.tags.split(" ").find((tag: string) => tag.startsWith(TAG_ALBUM))?.split("$")[1] || "",
    }));

    setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
    setPage(prevPage => prevPage + 1);
    setHasMore(newPhotos.length > 0);
  }, [year, event, text, team, person, page]);

  useEffect(() => {
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    loadPhotos();
  }, [year, event, text, team, person]);

  const photosByEvent = useMemo(() => {
    const groupedPhotos = new Map<string, Photo[]>();
    photos.forEach(photo => {
      const eventName = photo.year || "Unknown";
      if (!groupedPhotos.has(eventName)) {
        groupedPhotos.set(eventName, []);
      }
      groupedPhotos.get(eventName)?.push(photo);
    });
    return groupedPhotos;
  }, [photos]);

  return {
    hasMorePhotos: () => hasMore,
    loadMorePhotos: loadPhotos,
    photosByEvent,
    photosList: photos,
  };
};

interface PhotoServiceResponse {
  photos: {
    photo: PhotoData[];
  };
}

interface PhotoData {
  id: string;
  url_l?: string;
  url_c?: string;
  url_m: string;
  width_l?: string;
  width_c?: string;
  width_m: string;
  height_l?: string;
  height_c?: string;
  height_m: string;
  url_o: string;
  tags: string;
}
