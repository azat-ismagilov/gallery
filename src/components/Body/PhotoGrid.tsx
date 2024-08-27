import React from "react";

interface Photo {
  id: string;
  url_preview: string;
}

interface PhotoGridProps {
  photos: Photo[];
  handleClick: (id: string) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, handleClick }) => {
  return (
    <div className="masonry">
      {photos.map((photo) => (
        <figure key={photo.id} className="masonry-brick">
          <img
            className="preview"
            src={photo.url_preview}
            alt={photo.url_preview}
            onClick={() => handleClick(photo.id)}
          />
        </figure>
      ))}
    </div>
  );
};

export default PhotoGrid;
