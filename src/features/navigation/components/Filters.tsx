import { Stack } from "@mui/material";
import { useCallback, useMemo } from "react";

import calendarIcon from "@/assets/icons/calendar.svg";
import eventIcon from "@/assets/icons/event.svg";
import personIcon from "@/assets/icons/person.svg";
import teamIcon from "@/assets/icons/team.svg";
import { places } from "@/config/gallery";
import { useAppContext } from "@/features/gallery/state/AppContext";
import type { Place } from "@/types/gallery";
import FilterSelector, { type SelectorOption } from "./FilterSelector";
import SearchBar from "./SearchBar";

function formatOptions(items: readonly string[]): SelectorOption[] {
  return items.map((item) => ({ data: item, label: item }));
}

function formatYearOption(items: readonly Place[]): SelectorOption[] {
  return items.map(({ year, place }) => ({
    data: year,
    label: `${year} ${place}`,
  }));
}

const yearOptions: SelectorOption[] = formatYearOption(places);

const Filters = () => {
  const {
    data,
    setYear,
    setEvent,
    setPerson,
    setTeam,
    desktop,
    events,
    people,
    teams,
  } = useAppContext();

  const selectItem = useCallback(
    (
      item: SelectorOption | "clear" | null,
      setter: (value: string) => void,
    ) => {
      if (item === "clear" || item === null) {
        if (data.year) {
          setYear(data.year);
        }
      } else {
        setter(item.data);
      }
    },
    [data.year, setYear],
  );

  const eventOptions = useMemo(() => formatOptions(events), [events]);
  const teamOptions = useMemo(() => formatOptions(teams), [teams]);
  const personOptions = useMemo(() => formatOptions(people), [people]);

  const selectedYear = useMemo(
    () => yearOptions.find((o) => o.data === data.year) ?? null,
    [data.year],
  );
  const selectedEvent = useMemo(
    () => eventOptions.find((o) => o.data === data.event) ?? null,
    [eventOptions, data.event],
  );
  const selectedTeam = useMemo(
    () => teamOptions.find((o) => o.data === data.team) ?? null,
    [teamOptions, data.team],
  );
  const selectedPerson = useMemo(
    () => personOptions.find((o) => o.data === data.person) ?? null,
    [personOptions, data.person],
  );

  return (
    <Stack direction={desktop ? "row" : "column"} spacing={desktop ? 1 : 0.5}>
      {!desktop && (
        <FilterSelector
          options={yearOptions}
          leftIcon={calendarIcon}
          name="Select year"
          onChange={(selectedItem) => {
            if (selectedItem && selectedItem !== "clear") {
              setYear(selectedItem.data);
            }
          }}
          value={selectedYear}
          disableClearable
        />
      )}
      <FilterSelector
        options={eventOptions}
        name="Select event"
        leftIcon={eventIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setEvent);
        }}
        value={selectedEvent}
      />
      <FilterSelector
        options={teamOptions}
        name="Select team"
        leftIcon={teamIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setTeam);
        }}
        value={selectedTeam}
      />
      <FilterSelector
        options={personOptions}
        name="Select person"
        leftIcon={personIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setPerson);
        }}
        value={selectedPerson}
      />
      <SearchBar />
    </Stack>
  );
};

export default Filters;
