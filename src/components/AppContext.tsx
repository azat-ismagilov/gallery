import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import useMediaQuery from "@mui/material/useMediaQuery";

import { getEventData, getPeopleData, getTeamData } from "../Util/DataLoader";
import { DEFAULT_EVENT, LAST_YEAR } from "../consts";

interface DefaultContext {
  year: string | null;
  event: string | null;
  text: string | null;
  person: string | null;
  team: string | null;
  fullscreenPhotoId: string | null;
  slideShow: boolean;
}

const defaultContext: DefaultContext = {
  year: LAST_YEAR,
  event: null,
  text: null,
  person: null,
  team: null,
  fullscreenPhotoId: null,
  slideShow: false,
};

interface AppContextType extends DefaultContext {
  setYear: (newYear: string) => void;
  setEvent: (newEvent: string) => void;
  setText: (newText: string) => void;
  setPerson: (newPerson: string) => void;
  setTeam: (newTeam: string) => void;
  setFullscreenPhotoId: (newFullscreenPhotoId: string | null) => void;
  setIsSlideShow: (newIsSlideShow: boolean) => void;
  isOpenMenu: boolean;
  setIsOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  desktop: boolean;
  mobile: boolean;
  events: string[];
  people: string[];
  teams: string[];
}

const AppContext = createContext<AppContextType | null>(null);

function parseSearchParams(
  searchParams: URLSearchParams,
): Partial<DefaultContext> {
  const searchParamsData: Partial<DefaultContext> = {};
  if (searchParams.has("photo")) {
    searchParamsData.fullscreenPhotoId = searchParams.get("photo");
  }
  if (searchParams.has("slideshow")) {
    searchParamsData.slideShow = searchParams.get("slideshow") === "true";
  }
  if (searchParams.has("query")) {
    searchParamsData.text = decodeURIComponent(searchParams.get("query") || "");
    searchParamsData.year = null;
  } else {
    if (searchParams.has("album")) {
      searchParamsData.year = decodeURIComponent(
        searchParams.get("album") || "",
      );
    }
    if (searchParams.has("event")) {
      searchParamsData.event = decodeURIComponent(
        searchParams.get("event") || "",
      );
    } else if (searchParams.has("team")) {
      searchParamsData.team = decodeURIComponent(
        searchParams.get("team") || "",
      );
    } else if (searchParams.has("person")) {
      searchParamsData.person = decodeURIComponent(
        searchParams.get("person") || "",
      );
    } else {
      searchParamsData.event = DEFAULT_EVENT;
    }
  }
  return searchParamsData;
}

function serializeSearchParams(data: DefaultContext): Record<string, string> {
  const searchParams: Record<string, string> = {};
  if (data.year != null) {
    searchParams.album = data.year;
  }
  if (data.event != null) {
    searchParams.event = data.event;
  }
  if (data.person != null) {
    searchParams.person = data.person;
  }
  if (data.team != null) {
    searchParams.team = data.team;
  }
  if (data.text != null) {
    searchParams.query = data.text;
  }
  if (data.fullscreenPhotoId != null) {
    searchParams.photo = data.fullscreenPhotoId;
  }
  if (data.slideShow) {
    searchParams.slideshow = "true";
  }
  return searchParams;
}

function attachYearIfNull(
  data: Partial<DefaultContext>,
): Partial<DefaultContext> {
  if (!data.year) {
    data.year = LAST_YEAR;
  }
  return data;
}

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<DefaultContext>({
    ...defaultContext,
    ...parseSearchParams(searchParams),
  });

  const desktop = useMediaQuery("(min-width: 900px)");
  const mobile = !desktop;

  const [isOpenMenu, setIsOpenMenu] = useState(desktop);

  const isSlideShow = data.slideShow;

  useEffect(() => {
    if (desktop) {
      setIsOpenMenu(true);
    } else {
      setIsOpenMenu(false);
    }
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
    setData((prevState) => ({
      ...defaultContext,
      ...attachYearIfNull({
        ...prevState,
        event: newEvent,
        text: null,
        person: null,
        team: null,
      }),
    }));
  };

  const setPerson = (newPerson: string) => {
    setData((prevState) => ({
      ...defaultContext,
      ...attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: newPerson,
        team: null,
      }),
    }));
  };

  const setTeam = (newTeam: string) => {
    setData((prevState) => ({
      ...defaultContext,
      ...attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: null,
        team: newTeam,
      }),
    }));
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

    getEventData(data.year || "").then((eventsData) => {
      if (!isCancelled) {
        setEvents(eventsData);
      }
    });

    getPeopleData(data.year || "").then((peopleData) => {
      if (!isCancelled) {
        setPeople(peopleData);
      }
    });

    getTeamData(data.year || "").then((teamData) => {
      if (!isCancelled) {
        setTeams(teamData);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [data.year]);

  const contextValue: AppContextType = {
    ...data,
    setYear,
    setEvent,
    setText,
    setPerson,
    setTeam,
    setFullscreenPhotoId,
    slideShow: isSlideShow,
    setIsSlideShow,
    isOpenMenu,
    setIsOpenMenu,
    desktop,
    mobile,
    events,
    people,
    teams,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined || context === null) {
    throw new Error("useAppContext must be called within AppContextProvider");
  }
  return context;
};

export { AppContextProvider, useAppContext, AppContextType };
