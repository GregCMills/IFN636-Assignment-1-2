import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  detail,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-raised border border-border-default rounded-xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-danger-dim/40">
              <AlertTriangle size={20} className="text-status-danger" />
            </div>
            <h3 className="text-base font-bold text-text-primary">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-text-subtle hover:text-text-primary transition -mt-1 -mr-1 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2">
          <p className="text-text-secondary text-sm">{message}</p>
          {detail && (
            <p className="text-text-muted text-sm bg-surface-elevated/50 rounded-lg px-3 py-2">
              {detail}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button onClick={onCancel} className="btn-ghost text-sm px-4 py-2">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-status-danger-dim/60 border border-status-danger/30 text-status-danger
                       px-4 py-2 rounded-lg text-sm font-medium
                       hover:bg-status-danger-dim hover:border-status-danger/50 transition"
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
