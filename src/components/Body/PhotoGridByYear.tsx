import { useMemo } from "react";

import { places } from "../../consts";
import type { Photo } from "../../types";
import PhotoGrid from "./PhotoGrid";

interface PhotoGridByYearProps {
  photos: readonly Photo[];
  handleClick: (id: string) => void;
}

const PhotoGridByYear = ({ photos, handleClick }: PhotoGridByYearProps) => {
  const photosByYear = useMemo(() => {
    const grouped: Record<string, Photo[]> = {};
    for (const photo of photos) {
      const list = grouped[photo.year] ?? [];
      list.push(photo);
      grouped[photo.year] = list;
    }
    return grouped;
  }, [photos]);

  if (Object.keys(photosByYear).length < 2) {
    return <PhotoGrid photos={photos} handleClick={handleClick} />;
  }

  const compareYears = (a: [string, Photo[]], b: [string, Photo[]]): number => {
    const yearA = a[0];
    const yearB = b[0];
    const yearIndex = (targetYear: string) =>
      places.findIndex(({ year }) => year === targetYear);
    const indexDiff = yearIndex(yearB) - yearIndex(yearA);
    if (indexDiff !== 0) {
      return indexDiff;
    }
    return yearA.localeCompare(yearB);
  };

  return (
    <div>
      {Object.entries(photosByYear)
        .sort(compareYears)
        .reverse()
        .map(([year, yearPhotos]) => (
          <div key={year}>
            <h2 className="event-title">{year}</h2>
            <PhotoGrid photos={yearPhotos} handleClick={handleClick} />
          </div>
        ))}
    </div>
  );
};

export default PhotoGridByYear;
