// Define the main type for consts files
export interface GalleryConsts {
  places: [string, string, string][];
  api_key: string;
  user_id: string;
  title: string;
  description: string;
  FLICKR_IMAGE_PREFIX: string;
  SUGGESTIONS_EMAIL: string;
  TAG_EVENT: string;
  TAG_TEAM: string;
  TAG_ALBUM: string;
  TAG_PERSON: string;
  TAG_PHOTOGRAPHER: string;
  SVG_WIDTH: number;
  SVG_HEIGHT: number;
  PER_PAGE: number;
  LAST_YEAR: string;
  DEFAULT_EVENT: string;
}

// Type declaration for import.meta
declare global {
  interface ImportMeta {
    env: {
      VITE_DATA_FOLDER: string;
      MODE: string;
    };
  }
}

// Get the data folder from environment variable
const dataFolder = import.meta.env.VITE_DATA_FOLDER || "defaultDataFolder";

// Function to load specific gallery consts
export const loadGalleryConsts = async (): Promise<GalleryConsts> => {
  const consts = await import(`../${dataFolder}/consts.js`);
  console.log(`Using ${dataFolder} folder for consts.js`);
  console.log(`Loaded \n${JSON.stringify(consts, undefined, 4)}`);

  return {
    places: consts.places.map(
      ([year, place, contestName]: [string, string, string]) => [
        year,
        place,
        contestName,
      ],
    ),
    api_key: consts.api_key,
    user_id: consts.user_id,
    title: consts.title,
    description: consts.description,
    FLICKR_IMAGE_PREFIX: consts.FLICKR_IMAGE_PREFIX,
    SUGGESTIONS_EMAIL: consts.SUGGESTIONS_EMAIL,
    TAG_EVENT: consts.TAG_EVENT,
    TAG_TEAM: consts.TAG_TEAM,
    TAG_ALBUM: consts.TAG_ALBUM,
    TAG_PERSON: consts.TAG_PERSON,
    TAG_PHOTOGRAPHER: consts.TAG_PHOTOGRAPHER,
    SVG_WIDTH: consts.SVG_WIDTH,
    SVG_HEIGHT: consts.SVG_HEIGHT,
    PER_PAGE: consts.PER_PAGE,
    LAST_YEAR: consts.LAST_YEAR,
    DEFAULT_EVENT: consts.DEFAULT_EVENT,
  };
};

export const getRawEventData = async (year: string): Promise<string> => {
  return (await import(`../${dataFolder}/${year}.event`)).default as string;
};

export const getRawTeamData = async (year: string): Promise<string> => {
  return (await import(`../${dataFolder}/${year}.team`)).default as string;
};

export const getRawPeopleData = async (year: string): Promise<string> => {
  return (await import(`../${dataFolder}/${year}.people`)).default as string;
};

// Development mode flag
export const DEBUG = import.meta.env.MODE === "development";

// Export loaded consts
export const loadedConsts = await loadGalleryConsts();
export const {
  places,
  api_key,
  user_id,
  title,
  description,
  FLICKR_IMAGE_PREFIX,
  SUGGESTIONS_EMAIL,
  TAG_EVENT,
  TAG_TEAM,
  TAG_ALBUM,
  TAG_PERSON,
  TAG_PHOTOGRAPHER,
  SVG_WIDTH,
  SVG_HEIGHT,
  PER_PAGE,
  LAST_YEAR,
  DEFAULT_EVENT,
} = loadedConsts;
