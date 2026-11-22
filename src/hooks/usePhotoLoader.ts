import { useCallback, useEffect, useMemo, useState } from "react";

import { places, TAG_ALBUM } from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";
import {
  type ApiResponse,
  getAllWithEvent,
  getAllWithPerson,
  getAllWithTeam,
  getAllWithText,
} from "@/services/flickrApi";
import type { FlickrSearchResponse, Photo } from "@/types/gallery";
import UniqueList from "@/utils/uniqueList";

function albumFromTags(tags: string): string {
  const albumTag = TAG_ALBUM.toLowerCase();
  const tag = tags.split(" ").find((item) => item.startsWith(albumTag));
  if (tag === undefined) {
    return "Unknown";
  }
  const targetTag = tag.replaceAll(albumTag, "");
  const foundTag = places
    .map(({ year }) => year)
    .find((year) => year.toLowerCase().replace(/[-_\s]/g, "") === targetTag);
  return foundTag ?? "Unknown";
}

function appendPhotos(
  photosByEvent: Map<string | null, Photo[]>,
  event: string | null,
  photos: Photo[],
): Map<string | null, Photo[]> {
  const next = new Map(photosByEvent);
  const appendedEventPhotos = [...(next.get(event) ?? []), ...photos];
  next.set(
    event,
    UniqueList(appendedEventPhotos, (photo) => photo.id),
  );
  return next;
}

const usePhotoLoader = () => {
  const { data, events } = useAppContext();

  const [photosByEvent, setPhotosByEvent] = useState<
    Map<string | null, Photo[]>
  >(() => new Map());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [internalEvent, setInternalEvent] = useState<string | null>(data.event);
  const [fetching, setFetching] = useState(false);
  const [abortController, setAbortController] = useState(
    () => new AbortController(),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: abortController is reset inside this effect when filters change
  useEffect(() => {
    abortController.abort();
    setPhotosByEvent(new Map());
    setPage(1);
    setInternalEvent(data.event);
    setTotalPages(1);
    setAbortController(new AbortController());
  }, [data.year, data.event, data.text, data.team, data.person]);

  const getNextEvent = useCallback(
    (currentEvent: string | null): string | null => {
      if (currentEvent === null) {
        return null;
      }
      const index = events.indexOf(currentEvent);
      if (index === -1 || index + 1 < events.length) {
        return events[index + 1] ?? null;
      }
      return null;
    },
    [events],
  );

  const photosList = useMemo<Photo[]>(
    () => Array.from(photosByEvent.values()).flat(),
    [photosByEvent],
  );

  const hasMorePhotos = useCallback((): boolean => {
    return page <= totalPages || getNextEvent(internalEvent) !== null;
  }, [page, totalPages, getNextEvent, internalEvent]);

  const loadMorePhotos = useCallback(async () => {
    if (fetching) {
      return;
    }

    setFetching(true);

    const nextEvent = getNextEvent(internalEvent);
    if (page > totalPages && nextEvent !== null) {
      setPage(1);
      setTotalPages(1);
      setInternalEvent(nextEvent);
      setFetching(false);
      return;
    }

    const config = {
      signal: abortController.signal,
    };

    try {
      let response: ApiResponse<FlickrSearchResponse> | undefined;
      if (internalEvent && data.year) {
        response = await getAllWithEvent(
          data.year,
          internalEvent,
          page,
          config,
        );
      } else if (data.team && data.year) {
        response = await getAllWithTeam(data.year, data.team, page, config);
      } else if (data.person && data.year) {
        response = await getAllWithPerson(data.year, data.person, page, config);
      } else if (data.text) {
        response = await getAllWithText(data.text, page, config);
      }

      if (response) {
        const mappedPhotos: Photo[] = response.data.photos.photo.map(
          ({
            url_m,
            url_o,
            url_l,
            id,
            width_o,
            width_l,
            height_o,
            height_l,
            tags,
          }) => ({
            url_preview: url_m ?? url_o ?? "",
            url: url_l ?? url_o ?? "",
            width: Number(width_l ?? width_o ?? 0),
            height: Number(height_l ?? height_o ?? 0),
            id,
            origin: url_o ?? url_l ?? "",
            year: albumFromTags(tags),
          }),
        );
        const newPhotosByEvent = appendPhotos(
          photosByEvent,
          internalEvent,
          mappedPhotos,
        );
        setTotalPages(response.data.photos.pages);
        setPage(page + 1);
        setPhotosByEvent(newPhotosByEvent);
      }
    } finally {
      setFetching(false);
    }
  }, [
    fetching,
    getNextEvent,
    internalEvent,
    page,
    totalPages,
    abortController.signal,
    data.year,
    data.team,
    data.person,
    data.text,
    photosByEvent,
  ]);

  return { hasMorePhotos, loadMorePhotos, photosByEvent, photosList };
};

export default usePhotoLoader;
