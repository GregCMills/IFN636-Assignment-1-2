import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageLightbox = ({ imageUrl, onClose }: ImageLightboxProps) => {
  useEffect(() => {
    if (!imageUrl) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[70] p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all shrink-0 shadow-lg"
          aria-label="Close lightbox"
        >
          <X size={18} />
        </button>
        <img
          src={imageUrl}
          alt="Full-size preview"
          className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
