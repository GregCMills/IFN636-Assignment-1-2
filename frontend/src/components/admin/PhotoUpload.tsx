import { useRef, useState } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  hasExisting: boolean;
  disabled?: boolean;
}

const PhotoUpload = ({ onUpload, onDelete, hasExisting, disabled }: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="text-text-subtle hover:text-brand-light transition p-1 disabled:opacity-40 disabled:cursor-not-allowed"
        title={hasExisting ? 'Replace photo' : 'Upload photo'}
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
      </button>
      {hasExisting && onDelete && (
        <button
          onClick={onDelete}
          disabled={disabled || uploading}
          className="text-text-subtle hover:text-status-danger transition p-1 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete photo"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default PhotoUpload;
