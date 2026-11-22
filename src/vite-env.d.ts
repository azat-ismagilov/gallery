/// <reference types="vite/client" />

declare module "@data/consts.js" {
  export const places: ReadonlyArray<readonly [string, string, string]>;
  export const api_key: string;
  export const user_id: string;
  export const title: string;
  export const description: string;
  export const FLICKR_IMAGE_PREFIX: string;
  export const SUGGESTIONS_EMAIL: string;
  export const TAG_EVENT: string;
  export const TAG_TEAM: string;
  export const TAG_ALBUM: string;
  export const TAG_PERSON: string;
  export const TAG_PHOTOGRAPHER: string;
  export const SVG_WIDTH: number;
  export const SVG_HEIGHT: number;
  export const PER_PAGE: number;
  export const LAST_YEAR: string;
  export const DEFAULT_EVENT: string;
}
