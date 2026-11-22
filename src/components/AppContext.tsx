import useMediaQuery from "@mui/material/useMediaQuery";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "react-router";

import { DEFAULT_EVENT, LAST_YEAR } from "../consts";
import type { AppQueryState } from "../types";
import { getEventData, getPeopleData, getTeamData } from "../Util/DataLoader";

const defaultContext: AppQueryState = {
  year: LAST_YEAR,
  event: null,
  text: null,
  person: null,
  team: null,
  fullscreenPhotoId: null,
  slideShow: false,
};

export interface AppContextValue {
  data: AppQueryState;
  setYear: (newYear: string) => void;
  setEvent: (newEvent: string) => void;
  setText: (newText: string) => void;
  setPerson: (newPerson: string) => void;
  setTeam: (newTeam: string) => void;
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

function parseSearchParams(
  searchParams: URLSearchParams,
): Partial<AppQueryState> {
  const searchParamsData: Partial<AppQueryState> = {};
  const photoParam = searchParams.get("photo");
  if (photoParam !== null) {
    searchParamsData.fullscreenPhotoId = photoParam;
  }
  const slideshowParam = searchParams.get("slideshow");
  if (slideshowParam !== null) {
    searchParamsData.slideShow = slideshowParam === "true";
  }
  const queryParam = searchParams.get("query");
  if (queryParam !== null) {
    searchParamsData.text = decodeURIComponent(queryParam);
    searchParamsData.year = null;
  } else {
    const albumParam = searchParams.get("album");
    if (albumParam !== null) {
      searchParamsData.year = decodeURIComponent(albumParam);
    }
    const eventParam = searchParams.get("event");
    const teamParam = searchParams.get("team");
    const personParam = searchParams.get("person");
    if (eventParam !== null) {
      searchParamsData.event = decodeURIComponent(eventParam);
    } else if (teamParam !== null) {
      searchParamsData.team = decodeURIComponent(teamParam);
    } else if (personParam !== null) {
      searchParamsData.person = decodeURIComponent(personParam);
    } else {
      searchParamsData.event = DEFAULT_EVENT;
    }
  }
  return searchParamsData;
}

function serializeSearchParams({
  year,
  event,
  text,
  person,
  team,
  fullscreenPhotoId,
  slideShow,
}: AppQueryState): Record<string, string> {
  const searchParams: Record<string, string> = {};
  if (year !== null) {
    searchParams.album = year;
  }
  if (event !== null) {
    searchParams.event = event;
  }
  if (person !== null) {
    searchParams.person = person;
  }
  if (team !== null) {
    searchParams.team = team;
  }
  if (text !== null) {
    searchParams.query = text;
  }
  if (fullscreenPhotoId !== null) {
    searchParams.photo = fullscreenPhotoId;
  }
  if (slideShow) {
    searchParams.slideshow = "true";
  }
  return searchParams;
}

function attachYearIfNull(data: AppQueryState): AppQueryState {
  if (!data.year) {
    return { ...data, year: LAST_YEAR };
  }
  return data;
}

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<AppQueryState>(() => ({
    ...defaultContext,
    ...parseSearchParams(searchParams),
  }));

  const desktop = useMediaQuery("(min-width: 900px)");
  const mobile = !desktop;

  const [isOpenMenu, setIsOpenMenu] = useState(desktop);

  const isSlideShow = data.slideShow;

  useEffect(() => {
    setIsOpenMenu(desktop);
  }, [desktop]);

  useEffect(() => {
    setSearchParams(serializeSearchParams(data));
  }, [data, setSearchParams]);

  const setYear = (newYear: string) => {
    setData({
      ...defaultContext,
      year: newYear,
      event: DEFAULT_EVENT,
    });
  };

  const setText = (newText: string) => {
    setData((prevState) => ({
      ...prevState,
      year: null,
      event: null,
      text: newText,
      person: null,
      team: null,
    }));
  };

  const setEvent = (newEvent: string) => {
    setData((prevState) =>
      attachYearIfNull({
        ...prevState,
        event: newEvent,
        text: null,
        person: null,
        team: null,
      }),
    );
  };

  const setPerson = (newPerson: string) => {
    setData((prevState) =>
      attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: newPerson,
        team: null,
      }),
    );
  };

  const setTeam = (newTeam: string) => {
    setData((prevState) =>
      attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: null,
        team: newTeam,
      }),
    );
  };

  const setFullscreenPhotoId = (newFullscreenPhotoId: string | null) => {
    setData((prevState) => ({
      ...prevState,
      fullscreenPhotoId: newFullscreenPhotoId,
    }));
  };

  const setIsSlideShow = (newIsSlideShow: boolean) => {
    setData((prevState) => ({
      ...prevState,
      slideShow: newIsSlideShow,
    }));
  };

  const [events, setEvents] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    void getEventData(data.year).then((eventsData) => {
      if (!isCancelled) {
        setEvents(eventsData);
      }
    });

    void getPeopleData(data.year).then((peopleData) => {
      if (!isCancelled) {
        setPeople(peopleData);
      }
    });

    void getTeamData(data.year).then((teamData) => {
      if (!isCancelled) {
        setTeams(teamData);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [data.year]);

  return (
    <AppContext.Provider
      value={{
        data,
        setYear,
        setEvent,
        setText,
        setPerson,
        setTeam,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be called within AppContextProvider");
  }
  return context;
};

export { AppContextProvider, useAppContext };
