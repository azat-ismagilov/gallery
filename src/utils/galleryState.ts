import type { AppQueryState } from "@/types/gallery";

export interface FilterSelection {
  year?: string | null;
  event?: string | null;
  team?: string | null;
  person?: string | null;
}

export interface GalleryDefaults {
  lastYear: string;
  defaultEvent: string;
}

export function createDefaultGalleryState(
  defaults: GalleryDefaults,
): AppQueryState {
  return {
    year: defaults.lastYear,
    event: null,
    text: null,
    person: null,
    team: null,
    fullscreenPhotoId: null,
    slideShow: false,
  };
}

function withFallbackYear(
  state: AppQueryState,
  lastYear: string,
): AppQueryState {
  return state.year ? state : { ...state, year: lastYear };
}

export function applyYearFilter(
  year: string,
  defaults: GalleryDefaults,
): AppQueryState {
  return {
    ...createDefaultGalleryState(defaults),
    year,
    event: defaults.defaultEvent,
  };
}

export function applyTextSearch(
  prev: AppQueryState,
  text: string,
): AppQueryState {
  return {
    ...prev,
    year: null,
    event: null,
    text,
    person: null,
    team: null,
  };
}

export function applyEventFilter(
  prev: AppQueryState,
  event: string,
  lastYear: string,
): AppQueryState {
  return withFallbackYear(
    {
      ...prev,
      event,
      text: null,
      person: null,
      team: null,
    },
    lastYear,
  );
}

export function applyTeamFilter(
  prev: AppQueryState,
  team: string,
  lastYear: string,
): AppQueryState {
  return withFallbackYear(
    {
      ...prev,
      event: null,
      text: null,
      person: null,
      team,
    },
    lastYear,
  );
}

export function applyPersonFilter(
  prev: AppQueryState,
  person: string,
  lastYear: string,
): AppQueryState {
  return withFallbackYear(
    {
      ...prev,
      event: null,
      text: null,
      person,
      team: null,
    },
    lastYear,
  );
}

export function applyFilterSelection(
  prev: AppQueryState,
  filter: FilterSelection,
  defaults: GalleryDefaults,
): AppQueryState {
  const targetYear = filter.year ?? prev.year ?? defaults.lastYear;
  const hasSpecific =
    Boolean(filter.event) || Boolean(filter.team) || Boolean(filter.person);

  return {
    ...createDefaultGalleryState(defaults),
    year: targetYear,
    event: filter.event ?? (hasSpecific ? null : defaults.defaultEvent),
    team: filter.team ?? null,
    person: filter.person ?? null,
  };
}

export function getGalleryFilterKey(state: AppQueryState): string {
  return `${state.year ?? ""}|${state.event ?? ""}|${state.team ?? ""}|${state.person ?? ""}|${state.text ?? ""}`;
}
