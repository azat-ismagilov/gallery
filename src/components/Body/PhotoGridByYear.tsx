import React, { useMemo } from "react";

import { places } from "../../consts";

import PhotoGrid from "./PhotoGrid";

interface Photo {
  id: string;
  url_preview: string;
  year: string;
}

interface PhotoGridByYearProps {
  photos: Photo[];
  handleClick: (id: string) => void;
}

const PhotoGridByYear: React.FC<PhotoGridByYearProps> = ({
  photos,
  handleClick,
}) => {
  const photosByYear = useMemo(() => {
    const photosByYear: { [key: string]: Photo[] } = {};
    photos.forEach((photo) => {
      if (!photosByYear[photo.year]) {
        photosByYear[photo.year] = [];
      }
      photosByYear[photo.year].push(photo);
    });
    return photosByYear;
  }, [photos]);

  if (Object.keys(photosByYear).length < 2) {
    return <PhotoGrid photos={photos} handleClick={handleClick} />;
  }

  const compareYears = (a: string, b: string): number => {
    const yearIndex = (targetYear: string): number =>
      places.findIndex(([year]) => year === targetYear);
    const indexDiff = yearIndex(b) - yearIndex(a);
    if (indexDiff !== 0) {
      return indexDiff;
    }
    return a.localeCompare(b);
  };

  return (
    <div>
      {Object.entries(photosByYear)
        .sort(([yearA], [yearB]) => compareYears(yearA, yearB))
        .reverse()
        .map(([year, photos]) => (
          <div key={year}>
            <h2 className="event-title">{year}</h2>
            <PhotoGrid photos={photos} handleClick={handleClick} />
          </div>
        ))}
    </div>
  );
};

export default PhotoGridByYear;
