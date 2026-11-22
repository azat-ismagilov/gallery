import type { GalleryPhotoItem } from "@/types/gallery";

interface PhotoGridProps {
  items: readonly GalleryPhotoItem[];
  onSelect: (flatIndex: number) => void;
}

export default function PhotoGrid({ items, onSelect }: PhotoGridProps) {
  return (
    <div className="masonry">
      {items.map((item) => (
        <figure key={item.entryKey} className="masonry-brick">
          <button
            type="button"
            onClick={() => onSelect(item.flatIndex)}
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
              src={item.photo.url_preview}
              alt={`Gallery ${item.photo.id}`}
              loading="lazy"
            />
          </button>
        </figure>
      ))}
    </div>
  );
}
