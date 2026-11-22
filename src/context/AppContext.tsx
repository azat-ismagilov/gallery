import useMediaQuery from "@mui/material/useMediaQuery";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { DEFAULT_EVENT, LAST_YEAR } from "@/config/gallery";
import {
  getEventData,
  getPeopleData,
  getTeamData,
} from "@/services/dataLoader";
import type { AppQueryState } from "@/types/gallery";
import {
  applyEventFilter,
  applyFilterSelection,
  applyPersonFilter,
  applyTeamFilter,
  applyTextSearch,
  applyYearFilter,
  createDefaultGalleryState,
  type FilterSelection,
  getGalleryFilterKey,
} from "@/utils/galleryState";
import { parseSearchParams, serializeSearchParams } from "@/utils/urlParams";

const galleryDefaults = {
  lastYear: LAST_YEAR,
  defaultEvent: DEFAULT_EVENT,
};

function isSettingsUrl(
  pathname: string,
  hash: string,
  searchParams: URLSearchParams,
): boolean {
  return (
    searchParams.get("settings") === "true" ||
    hash.toLowerCase() === "#settings" ||
    pathname.endsWith("/settings")
  );
}

export type { FilterSelection };

export interface AppContextValue {
  data: AppQueryState;
  setYear: (newYear: string) => void;
  setEvent: (newEvent: string) => void;
  setText: (newText: string) => void;
  setPerson: (newPerson: string) => void;
  setTeam: (newTeam: string) => void;
  selectFilter: (filter: FilterSelection) => void;
  setFullscreenPhotoId: (newFullscreenPhotoId: string | null) => void;
  setSuggestion: (encoded: string | null) => void;
  isSlideShow: boolean;
  setIsSlideShow: (newIsSlideShow: boolean) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isOpenMenu: boolean;
  setIsOpenMenu: (open: boolean) => void;
  desktop: boolean;
  mobile: boolean;
  events: string[];
  people: string[];
  teams: string[];
}

const AppContext = createContext<AppContextValue | null>(null);

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState<AppQueryState>(() => ({
    ...createDefaultGalleryState(galleryDefaults),
    ...parseSearchParams(searchParams, DEFAULT_EVENT),
  }));

  const [isSettingsOpen, setIsSettingsOpen] = useState(() =>
    isSettingsUrl(location.pathname, location.hash, searchParams),
  );

  useEffect(() => {
    if (isSettingsUrl(location.pathname, location.hash, searchParams)) {
      setIsSettingsOpen(true);
    }
  }, [location.pathname, location.hash, searchParams]);

  const desktop = useMediaQuery("(min-width: 900px)");
  const mobile = !desktop;

  const [isOpenMenu, setIsOpenMenu] = useState(desktop);
  const prevFilterKeyRef = useRef<string>(getGalleryFilterKey(data));

  const isSlideShow = data.slideShow;

  useEffect(() => {
    setIsOpenMenu(desktop);
  }, [desktop]);

  useEffect(() => {
    const nextParams = serializeSearchParams(data);
    if (isSettingsOpen) {
      nextParams.settings = "true";
    }
    const nextSearch = new URLSearchParams(nextParams).toString();
    const currentSearch = searchParams.toString();
    const nextFilterKey = getGalleryFilterKey(data);
    const filterChanged = nextFilterKey !== prevFilterKeyRef.current;
    prevFilterKeyRef.current = nextFilterKey;

    if (nextSearch !== currentSearch) {
      setSearchParams(nextParams, { replace: !filterChanged });
    }
  }, [data, isSettingsOpen, searchParams, setSearchParams]);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
    const nextParams = serializeSearchParams(data);
    const nextSearch = new URLSearchParams(nextParams).toString();
    const nextPath = location.pathname.endsWith("/settings")
      ? location.pathname.slice(0, -"/settings".length) || "/"
      : location.pathname;
    void navigate(
      {
        pathname: nextPath,
        search: nextSearch ? `?${nextSearch}` : "",
        hash: "",
      },
      { replace: true },
    );
  }, [data, location.pathname, navigate]);

  const setYear = useCallback((newYear: string) => {
    setData(applyYearFilter(newYear, galleryDefaults));
  }, []);

  const setText = useCallback((newText: string) => {
    setData((prevState) => applyTextSearch(prevState, newText));
  }, []);

  const setEvent = useCallback((newEvent: string) => {
    setData((prevState) => applyEventFilter(prevState, newEvent, LAST_YEAR));
  }, []);

  const setPerson = useCallback((newPerson: string) => {
    setData((prevState) => applyPersonFilter(prevState, newPerson, LAST_YEAR));
  }, []);

  const setTeam = useCallback((newTeam: string) => {
    setData((prevState) => applyTeamFilter(prevState, newTeam, LAST_YEAR));
  }, []);

  const selectFilter = useCallback((filter: FilterSelection) => {
    setData((prevState) =>
      applyFilterSelection(prevState, filter, galleryDefaults),
    );
  }, []);

  const setFullscreenPhotoId = useCallback(
    (newFullscreenPhotoId: string | null) => {
      setData((prevState) =>
        prevState.fullscreenPhotoId === newFullscreenPhotoId
          ? prevState
          : {
              ...prevState,
              fullscreenPhotoId: newFullscreenPhotoId,
              // Clear active suggestion when closing or switching to another photo.
              suggestion: null,
            },
      );
    },
    [],
  );

  const setSuggestion = useCallback((encoded: string | null) => {
    setData((prevState) =>
      prevState.suggestion === encoded
        ? prevState
        : { ...prevState, suggestion: encoded },
    );
  }, []);

  const setIsSlideShow = useCallback((newIsSlideShow: boolean) => {
    setData((prevState) =>
      prevState.slideShow === newIsSlideShow
        ? prevState
        : { ...prevState, slideShow: newIsSlideShow },
    );
  }, []);

  const [events, setEvents] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    void Promise.all([
      getEventData(data.year),
      getPeopleData(data.year),
      getTeamData(data.year),
    ]).then(([eventsData, peopleData, teamData]) => {
      if (!isCancelled) {
        setEvents(eventsData);
        setPeople(peopleData);
        setTeams(teamData);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [data.year]);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      setYear,
      setEvent,
      setText,
      setPerson,
      setTeam,
      selectFilter,
      setFullscreenPhotoId,
      setSuggestion,
      isSlideShow,
      setIsSlideShow,
      isSettingsOpen,
      openSettings,
      closeSettings,
      isOpenMenu,
      setIsOpenMenu,
      desktop,
      mobile,
      events,
      people,
      teams,
    }),
    [
      data,
      setYear,
      setEvent,
      setText,
      setPerson,
      setTeam,
      selectFilter,
      setFullscreenPhotoId,
      setSuggestion,
      isSlideShow,
      setIsSlideShow,
      isSettingsOpen,
      openSettings,
      closeSettings,
      isOpenMenu,
      desktop,
      mobile,
      events,
      people,
      teams,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be called within AppContextProvider");
  }
  return context;
};

export { AppContextProvider, useAppContext };
