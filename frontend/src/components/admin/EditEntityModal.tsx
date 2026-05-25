import { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, ImageIcon, Undo2 } from 'lucide-react';

interface EditEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'group' | 'type' | 'asset';
  entity: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    pricePerDay?: number;
  };
  onSave: (
    entityType: 'group' | 'type' | 'asset',
    id: string,
    updates: { name?: string; description?: string; pricePerDay?: number },
  ) => Promise<void>;
  onUploadPhoto: (
    entityType: 'group' | 'type' | 'asset',
    id: string,
    file: File,
  ) => Promise<void>;
  onDeletePhoto: (
    entityType: 'group' | 'type' | 'asset',
    id: string,
  ) => Promise<void>;
  submitting: boolean;
}

type PendingPhotoAction =
  | { type: 'upload'; file: File; previewUrl: string }
  | { type: 'delete' };

const EditEntityModal = ({
  isOpen,
  onClose,
  entityType,
  entity,
  onSave,
  onUploadPhoto,
  onDeletePhoto,
  submitting,
}: EditEntityModalProps) => {
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description ?? '');
  const [pricePerDay, setPricePerDay] = useState(String(entity.pricePerDay ?? 0));
  const [uploading, setUploading] = useState(false);
  const [pendingPhotoAction, setPendingPhotoAction] = useState<PendingPhotoAction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync name/description when entity changes
  useEffect(() => {
    setName(entity.name);
    setDescription(entity.description ?? '');
    setPricePerDay(String(entity.pricePerDay ?? 0));
  }, [entity.name, entity.description, entity.pricePerDay]);

  // Reset pending photo action when a different entity is opened
  useEffect(() => {
    if (pendingPhotoAction?.type === 'upload') {
      URL.revokeObjectURL(pendingPhotoAction.previewUrl);
    }
    setPendingPhotoAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.id]);

  // Safety net: revoke any lingering object URL on unmount
  useEffect(() => {
    return () => {
      setPendingPhotoAction(prev => {
        if (prev?.type === 'upload') URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
    };
  }, []);

  if (!isOpen) return null;

  const entityLabel =
    entityType === 'group' ? 'Product Group' :
    entityType === 'type' ? 'Product' : 'Unit';

  // Which image to display in the modal
  const displayImageUrl: string | undefined =
    pendingPhotoAction?.type === 'upload'
      ? pendingPhotoAction.previewUrl
      : pendingPhotoAction?.type === 'delete'
        ? undefined
        : entity.imageUrl;

  const hasPhoto = !!displayImageUrl;
  const hasPendingPhotoChange = pendingPhotoAction !== null;

  const handleClose = () => {
    if (pendingPhotoAction?.type === 'upload') {
      URL.revokeObjectURL(pendingPhotoAction.previewUrl);
    }
    setPendingPhotoAction(null);
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setUploading(true);
    try {
      // 1. Execute deferred photo action first
      if (pendingPhotoAction?.type === 'upload') {
        await onUploadPhoto(entityType, entity.id, pendingPhotoAction.file);
      } else if (pendingPhotoAction?.type === 'delete') {
        await onDeletePhoto(entityType, entity.id);
      }

      // 2. Save name/description changes
      const updates: { name?: string; description?: string; pricePerDay?: number } = {};
      if (name.trim() !== entity.name) updates.name = name.trim();
      if (description !== (entity.description ?? '')) updates.description = description;
      if (entityType === 'type') {
        const newPrice = parseFloat(pricePerDay);
        if (!isNaN(newPrice) && newPrice !== (entity.pricePerDay ?? 0)) {
          updates.pricePerDay = newPrice;
        }
      }

      if (Object.keys(updates).length > 0 || hasPendingPhotoChange) {
        await onSave(entityType, entity.id, updates);
      }
    } finally {
      setUploading(false);
      setPendingPhotoAction(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke any previous preview URL
    if (pendingPhotoAction?.type === 'upload') {
      URL.revokeObjectURL(pendingPhotoAction.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingPhotoAction({ type: 'upload', file, previewUrl });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTogglePhotoDelete = () => {
    if (pendingPhotoAction) {
      // Undo any pending photo action
      if (pendingPhotoAction.type === 'upload') {
        URL.revokeObjectURL(pendingPhotoAction.previewUrl);
      }
      setPendingPhotoAction(null);
    } else if (entity.imageUrl) {
      // Mark the existing photo for deletion
      setPendingPhotoAction({ type: 'delete' });
    }
  };

  const busy = submitting || uploading;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-surface-raised border border-border-default w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        <button
          onClick={handleClose}
          disabled={busy}
          className="absolute top-4 right-4 z-[10] p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all shrink-0 shadow-lg"
        >
          <X size={18} />
        </button>

        {/* ── Top side: Full image ─────────────────────────────── */}
        <div className="relative w-full flex-1 bg-surface-elevated flex items-center justify-center group overflow-hidden border-b border-border-default/50">

          {/* Mesh gradient background */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-text-muted/10 blur-[100px] rounded-full" />
          </div>

          {/* Inner shadow for recessed depth */}
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)] pointer-events-none z-[2]" />

          {hasPhoto ? (
            <>
              <img
                src={displayImageUrl}
                alt={entity.name}
                className="absolute inset-0 z-[1] w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 z-[3] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-sm font-semibold backdrop-blur-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    {hasPendingPhotoChange ? 'Change' : 'Replace'}
                  </button>
                  <button
                    onClick={handleTogglePhotoDelete}
                    disabled={busy}
                    className={`p-2.5 rounded-xl backdrop-blur-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                      hasPendingPhotoChange
                        ? 'bg-blue-500/90 hover:bg-blue-500'
                        : 'bg-red-500/90 hover:bg-red-500'
                    }`}
                  >
                    {hasPendingPhotoChange ? <Undo2 size={18} /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="relative z-[1] flex flex-col items-center justify-center gap-3">
              <ImageIcon size={48} className="text-text-subtle" />
              <span className="text-text-muted text-sm">No photo</span>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-surface-raised border border-border-default text-text-secondary rounded-xl text-sm font-medium hover:bg-border-default transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={14} />
                  Upload
                </button>
                {hasPendingPhotoChange && (
                  <button
                    onClick={handleTogglePhotoDelete}
                    disabled={busy}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Undo2 size={14} />
                    Undo
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mobile label */}
          <div className="absolute top-4 left-4 z-[4] md:hidden bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-white/80 font-semibold border border-white/10">
            {hasPhoto ? 'Photo' : 'No Photo'}
          </div>
        </div>

        {/* ── Bottom side: Form ──────────────────────────────────── */}
        <div className="shrink-0 p-4 md:p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                Edit {entityLabel}
              </h2>
              <p className="text-text-muted text-sm mt-1">
                Update {entityLabel.toLowerCase()} details and imagery.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={busy}
          />

          {/* Fields */}
          <div className="space-y-4 flex-1">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-label uppercase tracking-widest ml-1">
                {entityLabel} Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base text-sm py-2"
                placeholder={`e.g. ${entityLabel}`}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-label uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-base text-sm resize-none py-2"
                rows={4}
                placeholder={`Describe this ${entityLabel.toLowerCase()}...`}
              />
            </div>

            {entityType === 'type' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-label uppercase tracking-widest ml-1">
                  Price Per Day (AUD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    className="input-base text-sm py-2 pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {/* Mobile-only photo controls (shown when no photo) */}
            {!hasPhoto && (
              <div className="md:hidden flex items-center gap-2 pt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Upload size={14} />
                  Upload Photo
                </button>
                {hasPendingPhotoChange && (
                  <button
                    onClick={handleTogglePhotoDelete}
                    disabled={busy}
                    className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Undo2 size={14} />
                    Undo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border-default/50">
            <button
              onClick={handleClose}
              disabled={busy}
              className="px-4 py-2 text-text-muted hover:text-text-primary font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={busy || !name.trim()}
              className="btn-primary px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEntityModal;
