import type { Photo } from "@/types/gallery";

interface PhotoGridProps {
  photos: readonly Photo[];
  handleClick: (id: string) => void;
}

export default function PhotoGrid({ photos, handleClick }: PhotoGridProps) {
  return (
    <div className="masonry">
      {photos.map((photo) => {
        return (
          <figure key={photo.id} className="masonry-brick">
            <button
              type="button"
              onClick={() => handleClick(photo.id)}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                padding: 0,
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              <img
                className="preview"
                src={photo.url_preview}
                alt={`Gallery ${photo.id}`}
                loading="lazy"
              />
            </button>
          </figure>
        );
      })}
    </div>
  );
}
