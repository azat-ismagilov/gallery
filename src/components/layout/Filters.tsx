import { Stack } from "@mui/material";

import calendarIcon from "@/assets/icons/calendar.svg";
import eventIcon from "@/assets/icons/event.svg";
import personIcon from "@/assets/icons/person.svg";
import teamIcon from "@/assets/icons/team.svg";
import { places } from "@/config/gallery";
import { useAppContext } from "@/context/AppContext";
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

  function selectItem(
    item: SelectorOption | "clear" | null,
    setter: (value: string) => void,
  ) {
    if (item === "clear" || item === null) {
      if (data.year) {
        setYear(data.year);
      }
    } else {
      setter(item.data);
    }
  }

  const yearOptions = formatYearOption(places);
  const eventOptions = formatOptions(events);
  const teamOptions = formatOptions(teams);
  const personOptions = formatOptions(people);

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
          value={yearOptions.find((o) => o.data === data.year) ?? null}
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
        value={eventOptions.find((o) => o.data === data.event) ?? null}
      />
      <FilterSelector
        options={teamOptions}
        name="Select team"
        leftIcon={teamIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setTeam);
        }}
        value={teamOptions.find((o) => o.data === data.team) ?? null}
      />
      <FilterSelector
        options={personOptions}
        name="Select person"
        leftIcon={personIcon}
        onChange={(selectedItem) => {
          selectItem(selectedItem, setPerson);
        }}
        value={personOptions.find((o) => o.data === data.person) ?? null}
      />
      <SearchBar />
    </Stack>
  );
};

export default Filters;
