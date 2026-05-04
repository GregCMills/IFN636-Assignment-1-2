import { X, ImageIcon } from 'lucide-react';

interface AssetTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewImage: (imageUrl: string) => void;
  assetType: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  availableCount: number;
  inCartCount: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
}

const AssetTypeDetailModal = ({ 
  isOpen, 
  onClose, 
  onViewImage, 
  assetType,
  availableCount,
  inCartCount,
  onAddToCart,
  onRemoveFromCart
}: AssetTypeDetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-raised border border-border-default w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10] p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all shrink-0 shadow-lg"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* ── Top side: Full image ─────────────────────────────── */}
        <div className="relative w-full flex-1 bg-surface-elevated flex items-center justify-center overflow-hidden border-b border-border-default/50">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-text-muted/10 blur-[100px] rounded-full" />
          </div>

          {/* Inner shadow for recessed depth */}
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)] pointer-events-none z-[2]" />

          {assetType.imageUrl ? (
            <img
              src={assetType.imageUrl}
              alt={assetType.name}
              className="absolute inset-0 z-[1] w-full h-full object-cover cursor-pointer"
              onClick={() => onViewImage(assetType.imageUrl!)}
            />
          ) : (
            <div className="relative z-[1] flex flex-col items-center justify-center gap-3">
              <ImageIcon size={48} className="text-text-subtle" />
              <span className="text-text-muted text-sm">No photo</span>
            </div>
          )}
        </div>

        {/* ── Bottom side: Info ──────────────────────────────────── */}
        <div className="shrink-0 p-4 md:p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                {assetType.name}
              </h2>
              <p className="text-text-muted text-sm mt-1">
                Product details
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1">
            {assetType.description ? (
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {assetType.description}
              </p>
            ) : (
              <p className="text-text-muted text-sm italic">
                No description provided.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-default/50">
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${availableCount - inCartCount > 0 ? 'text-status-success' : 'text-text-subtle'}`}>
                {availableCount - inCartCount > 0 ? `${availableCount - inCartCount} available` : 'None left'}
              </span>
              {inCartCount > 0 && (
                <span className="text-xs text-brand-light font-medium">
                  {inCartCount} in cart
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 bg-surface-elevated p-1 rounded-xl border border-border-default">
              <button
                onClick={() => onRemoveFromCart(assetType.id)}
                disabled={inCartCount === 0}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-strong bg-surface-raised text-text-secondary hover:bg-surface-elevated transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xl font-medium active:scale-95"
                aria-label="Remove from cart"
              >
                −
              </button>
              
              <span className="w-8 text-center font-bold text-text-primary">
                {inCartCount}
              </span>

              <button
                onClick={() => onAddToCart(assetType.id)}
                disabled={availableCount === 0 || inCartCount >= availableCount}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-brand/40 bg-brand-dim text-brand-subtle hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xl font-medium active:scale-95"
                aria-label="Add to cart"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetTypeDetailModal;
