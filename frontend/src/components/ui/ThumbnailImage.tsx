interface ThumbnailImageProps {
  thumbnailUrl?: string;
  imageUrl?: string;
  onClick: () => void;
  className?: string;
}

const ThumbnailImage = ({ thumbnailUrl, onClick, className }: ThumbnailImageProps) => {
  if (!thumbnailUrl) return null;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`shrink-0 overflow-hidden rounded-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand/50 ${className ?? ''}`}
      aria-label="View full-size image"
    >
      <img
        src={thumbnailUrl}
        alt="Thumbnail"
        className="w-12 h-12 object-cover"
        loading="lazy"
      />
    </button>
  );
};

export default ThumbnailImage;
