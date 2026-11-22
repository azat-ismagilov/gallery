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

export interface AppQueryState {
  year: string | null;
  event: string | null;
  text: string | null;
  person: string | null;
  team: string | null;
  fullscreenPhotoId: string | null;
  slideShow: boolean;
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
