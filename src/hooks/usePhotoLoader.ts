import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { places, TAG_ALBUM } from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";
import {
  getAllWithEvent,
  getAllWithPerson,
  getAllWithTeam,
  getAllWithText,
} from "@/services/flickrApi";
import type {
  FlickrSearchPhoto,
  FlickrSearchResponse,
  GalleryPhotoItem,
  GallerySection,
  Photo,
} from "@/types/gallery";
import {
  buildGallerySections,
  extractAlbumYearFromTags,
  getNextEventName,
  type RawPhotoGroup,
} from "@/utils/gallerySections";
import UniqueList from "@/utils/uniqueList";

interface LoaderCursor {
  currentEvent: string | null;
  nextPage: number;
  totalPages: number;
  exhausted: boolean;
}

export interface PhotoLoaderResult {
  sections: GallerySection[];
  items: GalleryPhotoItem[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => Promise<void>;
}

function mapFlickrPhoto(raw: FlickrSearchPhoto): Photo {
  return {
    id: raw.id,
    url_preview: raw.url_m ?? raw.url_o ?? "",
    url: raw.url_l ?? raw.url_o ?? "",
    origin: raw.url_o ?? raw.url_l ?? "",
    width: Number(raw.width_l ?? raw.width_o ?? 0),
    height: Number(raw.height_l ?? raw.height_o ?? 0),
    year: extractAlbumYearFromTags(raw.tags, TAG_ALBUM, places),
  };
}

function mergeGroupPhotos(
  groups: RawPhotoGroup[],
  event: string | null,
  newPhotos: Photo[],
): RawPhotoGroup[] {
  if (newPhotos.length === 0) {
    return groups;
  }
  const existingIndex = groups.findIndex((g) => g.event === event);
  if (existingIndex === -1) {
    return [
      ...groups,
      { event, photos: UniqueList(newPhotos, (photo) => photo.id) },
    ];
  }
  return groups.map((group, idx) =>
    idx === existingIndex
      ? {
          ...group,
          photos: UniqueList(
            [...group.photos, ...newPhotos],
            (photo) => photo.id,
          ),
        }
      : group,
  );
}

const usePhotoLoader = (): PhotoLoaderResult => {
  const { data, events } = useAppContext();

  const [groups, setGroups] = useState<RawPhotoGroup[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const eventsRef = useRef<string[]>(events);
  const filtersRef = useRef({
    year: data.year,
    event: data.event,
    team: data.team,
    person: data.person,
    text: data.text,
  });

  const cursorRef = useRef<LoaderCursor>({
    currentEvent: data.event,
    nextPage: 1,
    totalPages: 1,
    exhausted: false,
  });
  const inFlightRef = useRef(false);
  const sessionIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || cursorRef.current.exhausted) {
      return;
    }

    const sessionId = sessionIdRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    inFlightRef.current = true;
    setIsLoading(true);

    try {
      const filters = filtersRef.current;

      // Loop allows seamlessly skipping past an empty event directly to the next event
      // without forcing an extra scroll/effect tick.
      while (sessionIdRef.current === sessionId) {
        const cursor = cursorRef.current;
        let targetEvent = cursor.currentEvent;
        let targetPage = cursor.nextPage;

        if (targetPage > cursor.totalPages) {
          const nextEvent = getNextEventName(eventsRef.current, targetEvent);
          if (nextEvent === null) {
            cursorRef.current = { ...cursor, exhausted: true };
            setHasMore(false);
            return;
          }
          targetEvent = nextEvent;
          targetPage = 1;
          cursorRef.current = {
            currentEvent: nextEvent,
            nextPage: 1,
            totalPages: 1,
            exhausted: false,
          };
        }

        let response: FlickrSearchResponse | null = null;
        const config = { signal: controller.signal };

        if (targetEvent && filters.year) {
          response = await getAllWithEvent(
            filters.year,
            targetEvent,
            targetPage,
            config,
          );
        } else if (filters.team && filters.year) {
          response = await getAllWithTeam(
            filters.year,
            filters.team,
            targetPage,
            config,
          );
        } else if (filters.person && filters.year) {
          response = await getAllWithPerson(
            filters.year,
            filters.person,
            targetPage,
            config,
          );
        } else if (filters.text) {
          response = await getAllWithText(filters.text, targetPage, config);
        } else {
          cursorRef.current = { ...cursorRef.current, exhausted: true };
          setHasMore(false);
          return;
        }

        if (sessionIdRef.current !== sessionId || controller.signal.aborted) {
          return;
        }

        if (!response) {
          // Network error: stop retrying automatically until next user scroll/action
          return;
        }

        const totalPages = response.photos.pages;
        const mappedPhotos = response.photos.photo.map(mapFlickrPhoto);
        const nextPage = targetPage + 1;
        const hasMoreInCurrent = nextPage <= totalPages;
        const nextEventAvailable =
          getNextEventName(eventsRef.current, targetEvent) !== null;

        cursorRef.current = {
          currentEvent: targetEvent,
          nextPage,
          totalPages,
          exhausted: !hasMoreInCurrent && !nextEventAvailable,
        };

        setHasMore(!cursorRef.current.exhausted);

        if (mappedPhotos.length > 0) {
          setGroups((prev) =>
            mergeGroupPhotos(prev, targetEvent, mappedPhotos),
          );
          return;
        }

        // Current page returned 0 photos; if another event exists, continue immediately
        if (cursorRef.current.exhausted) {
          return;
        }
      }
    } finally {
      if (sessionIdRef.current === sessionId) {
        inFlightRef.current = false;
        setIsLoading(false);
      }
    }
  }, []);

  // Reset pagination and immediately kick off the first page whenever filters change.
  useEffect(() => {
    abortControllerRef.current?.abort();
    sessionIdRef.current += 1;
    inFlightRef.current = false;

    filtersRef.current = {
      year: data.year,
      event: data.event,
      team: data.team,
      person: data.person,
      text: data.text,
    };

    cursorRef.current = {
      currentEvent: data.event,
      nextPage: 1,
      totalPages: 1,
      exhausted: false,
    };

    setGroups([]);
    setHasMore(true);
    setIsLoading(false);

    void loadMore();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [data.year, data.event, data.team, data.person, data.text, loadMore]);

  // Keep eventsRef up to date and re-evaluate exhaustion once events finish loading.
  useEffect(() => {
    eventsRef.current = events;
    const cursor = cursorRef.current;
    if (
      cursor.exhausted &&
      cursor.currentEvent !== null &&
      getNextEventName(events, cursor.currentEvent) !== null
    ) {
      cursorRef.current = { ...cursor, exhausted: false };
      setHasMore(true);
    }
  }, [events]);

  const { sections, items } = useMemo(
    () => buildGallerySections(groups, places),
    [groups],
  );

  return { sections, items, hasMore, isLoading, loadMore };
};

export default usePhotoLoader;
