import React from "react";

import { Stack } from "@mui/material";

import { GalleryConsts, places } from "../../consts";
import { ReactComponent as CalendarIcon } from "../../images/calender.svg";
import { ReactComponent as EventIcon } from "../../images/event.svg";
import { ReactComponent as PersonIcon } from "../../images/person.svg";
import { ReactComponent as TeamIcon } from "../../images/team.svg";
import { AppContextType, useAppContext } from "../AppContext";

import Search from "./Search";
import Selector from "./Selector";

interface Option {
  data: string;
  label: string;
}

const Filters: React.FC = () => {
  const {
    year,
    event,
    team,
    person,
    setYear,
    setEvent,
    setPerson,
    setTeam,
    desktop,
    events,
    people,
    teams,
  } = useAppContext() as AppContextType;

  const formatOptions = (a: string[]): Option[] => {
    return a.map((x) => ({
      data: x,
      label: x,
    }));
  };

  const formatYearOption = (a: GalleryConsts["places"]): Option[] => {
    return a.map(([year, place]) => ({
      data: year,
      label: `${year} ${place}`,
    }));
  };

  const selectItem = (item: Option | null, func: (value: string) => void) => {
    if (item === null) {
      setYear(year || "");
    } else {
      func(item.data);
    }
  };

  return (
    <Stack direction={desktop ? "row" : "column"} spacing={desktop ? 1 : 0.5}>
      {!desktop && (
        <Selector
          options={formatYearOption(places)}
          leftIcon={CalendarIcon}
          name="Select year"
          onChange={(selectedItem: Option | null) => {
            if (selectedItem && typeof selectedItem === "object") {
              const selectedYear = selectedItem.data;
              setYear(selectedYear);
            }
          }}
          value={year || ""}
          disableClearable
        />
      )}
      <Selector
        options={formatOptions(events)}
        name="Select event"
        leftIcon={EventIcon}
        onChange={(selectedItem: Option | null) => {
          if (selectedItem && typeof selectedItem === "object") {
            selectItem(selectedItem, setEvent);
          }
        }}
        value={event || ""}
      />
      <Selector
        options={formatOptions(teams)}
        name="Select team"
        leftIcon={TeamIcon}
        onChange={(selectedItem: Option | null) => {
          if (selectedItem && typeof selectedItem === "object") {
            selectItem(selectedItem, setTeam);
          }
        }}
        value={team || ""}
      />
      <Selector
        options={formatOptions(people)}
        name="Select person"
        leftIcon={PersonIcon}
        onChange={(selectedItem: Option | null) => {
          if (selectedItem && typeof selectedItem === "object") {
            selectItem(selectedItem, setPerson);
          }
        }}
        value={person || ""}
      />
      <Search />
    </Stack>
  );
};

export default Filters;
