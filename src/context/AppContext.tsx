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
import { useSearchParams } from "react-router";

import { DEFAULT_EVENT, LAST_YEAR } from "@/config/gallery";
import {
  getEventData,
  getPeopleData,
  getTeamData,
} from "@/services/dataLoader";
import type { AppQueryState } from "@/types/gallery";
import { parseSearchParams, serializeSearchParams } from "@/utils/urlParams";

const defaultContext: AppQueryState = {
  year: LAST_YEAR,
  event: null,
  text: null,
  person: null,
  team: null,
  fullscreenPhotoId: null,
  slideShow: false,
};

export interface FilterSelection {
  year?: string | null;
  event?: string | null;
  team?: string | null;
  person?: string | null;
}

export interface AppContextValue {
  data: AppQueryState;
  setYear: (newYear: string) => void;
  setEvent: (newEvent: string) => void;
  setText: (newText: string) => void;
  setPerson: (newPerson: string) => void;
  setTeam: (newTeam: string) => void;
  selectFilter: (filter: FilterSelection) => void;
  setFullscreenPhotoId: (newFullscreenPhotoId: string | null) => void;
  isSlideShow: boolean;
  setIsSlideShow: (newIsSlideShow: boolean) => void;
  isOpenMenu: boolean;
  setIsOpenMenu: (open: boolean) => void;
  desktop: boolean;
  mobile: boolean;
  events: string[];
  people: string[];
  teams: string[];
}

const AppContext = createContext<AppContextValue | null>(null);

function attachYearIfNull(data: AppQueryState): AppQueryState {
  if (!data.year) {
    return { ...data, year: LAST_YEAR };
  }
  return data;
}

function getFilterKey(state: AppQueryState): string {
  return `${state.year ?? ""}|${state.event ?? ""}|${state.team ?? ""}|${state.person ?? ""}|${state.text ?? ""}`;
}

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<AppQueryState>(() => ({
    ...defaultContext,
    ...parseSearchParams(searchParams, DEFAULT_EVENT),
  }));

  const desktop = useMediaQuery("(min-width: 900px)");
  const mobile = !desktop;

  const [isOpenMenu, setIsOpenMenu] = useState(desktop);
  const prevFilterKeyRef = useRef<string>(getFilterKey(data));

  const isSlideShow = data.slideShow;

  useEffect(() => {
    setIsOpenMenu(desktop);
  }, [desktop]);

  // Synchronize app query state to URL search params.
  // Use `replace: true` when only the viewer photo/slideshow changed so stepping
  // through photos or running a slideshow does not pollute browser Back history.
  useEffect(() => {
    const nextParams = serializeSearchParams(data);
    const nextSearch = new URLSearchParams(nextParams).toString();
    const currentSearch = searchParams.toString();
    const nextFilterKey = getFilterKey(data);
    const filterChanged = nextFilterKey !== prevFilterKeyRef.current;
    prevFilterKeyRef.current = nextFilterKey;

    if (nextSearch !== currentSearch) {
      setSearchParams(nextParams, { replace: !filterChanged });
    }
  }, [data, searchParams, setSearchParams]);

  const setYear = useCallback((newYear: string) => {
    setData({
      ...defaultContext,
      year: newYear,
      event: DEFAULT_EVENT,
    });
  }, []);

  const setText = useCallback((newText: string) => {
    setData((prevState) => ({
      ...prevState,
      year: null,
      event: null,
      text: newText,
      person: null,
      team: null,
    }));
  }, []);

  const setEvent = useCallback((newEvent: string) => {
    setData((prevState) =>
      attachYearIfNull({
        ...prevState,
        event: newEvent,
        text: null,
        person: null,
        team: null,
      }),
    );
  }, []);

  const setPerson = useCallback((newPerson: string) => {
    setData((prevState) =>
      attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: newPerson,
        team: null,
      }),
    );
  }, []);

  const setTeam = useCallback((newTeam: string) => {
    setData((prevState) =>
      attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: null,
        team: newTeam,
      }),
    );
  }, []);

  const selectFilter = useCallback((filter: FilterSelection) => {
    setData((prevState) => {
      const targetYear = filter.year ?? prevState.year ?? LAST_YEAR;
      const hasSpecific =
        Boolean(filter.event) || Boolean(filter.team) || Boolean(filter.person);
      return {
        ...defaultContext,
        year: targetYear,
        event: filter.event ?? (hasSpecific ? null : DEFAULT_EVENT),
        team: filter.team ?? null,
        person: filter.person ?? null,
      };
    });
  }, []);

  const setFullscreenPhotoId = useCallback(
    (newFullscreenPhotoId: string | null) => {
      setData((prevState) =>
        prevState.fullscreenPhotoId === newFullscreenPhotoId
          ? prevState
          : { ...prevState, fullscreenPhotoId: newFullscreenPhotoId },
      );
    },
    [],
  );

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
      isSlideShow,
      setIsSlideShow,
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
      isSlideShow,
      setIsSlideShow,
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
