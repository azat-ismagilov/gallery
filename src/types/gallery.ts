export interface Place {
  year: string;
  place: string;
  contestName: string;
}

export interface Photo {
  id: string;
  url_preview: string;
  url: string;
  width: number;
  height: number;
  origin: string;
  year: string;
}

export interface GalleryPhotoItem {
  /** Unique key per gallery position so identical photo IDs in different sections stay distinct. */
  entryKey: string;
  /** Zero-based position in the flattened visual order of the gallery. */
  flatIndex: number;
  sectionKey: string;
  photo: Photo;
}

export interface GallerySection {
  key: string;
  title: string | null;
  items: GalleryPhotoItem[];
}

export interface FacePosition {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PersonTag {
  name: string;
  position?: FacePosition;
}

export interface PhotoInfo {
  event: string[];
  team: string[];
  person: PersonTag[];
  album: string[];
  photographer: string[];
}

export type FaceDiffStatus = "unchanged" | "added" | "removed";

export interface AppQueryState {
  year: string | null;
  event: string | null;
  text: string | null;
  person: string | null;
  team: string | null;
  fullscreenPhotoId: string | null;
  slideShow: boolean;
  suggestion: string | null;
}

export interface FlickrAuthCredentials {
  apiKey: string;
  apiSecret: string;
  oauthToken: string;
  oauthTokenSecret: string;
}

export interface FlickrSearchPhoto {
  id: string;
  url_m?: string;
  url_c?: string;
  url_l?: string;
  url_o?: string;
  width_l?: number;
  width_o?: number;
  height_l?: number;
  height_o?: number;
  tags: string;
}

export interface FlickrSearchResponse {
  photos: {
    page: number;
    pages: number;
    perpage: number;
    total: number;
    photo: FlickrSearchPhoto[];
  };
  stat: string;
}

export interface FlickrPhotoInfoResponse {
  photo?: {
    id: string;
    description?: {
      _content?: string;
    };
    tags?: {
      tag?: Array<{
        raw: string;
      }>;
    };
  };
  stat: string;
}

export interface FlickrPhotoSize {
  label: string;
  width: number | string;
  height: number | string;
  source: string;
}

export interface FlickrPhotoSizesResponse {
  sizes?: {
    size?: FlickrPhotoSize[];
  };
  stat: string;
}
