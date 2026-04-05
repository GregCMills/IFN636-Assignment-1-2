import { useState } from 'react';
import { Users, Calendar, Check, X, Wrench, ArrowRightLeft } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import ConfirmModal from '../../ConfirmModal';
import { groupBy, formatAusDate } from '../../../utils/helpers';

interface PendingAction {
  ids: string[];
  label: string;
}

const PendingReturnTab = ({
  assets,
  assetTypes,
  updateAssetStatuses,
}: AdminTabProps) => {
  const [submitting, setSubmitting]         = useState(false);
  const [apiError,   setApiError]           = useState('');
  const [pendingDeny, setPendingDeny]       = useState<PendingAction | null>(null);

  const pending = assets.filter(a => a.status === 'Pending Return');

  /** Display name for a renter — prefer full name, fall back to email, then Clerk ID. */
  const getUserLabel = (userAssets: typeof pending) =>
    userAssets[0]?.rentedByUserName ||
    userAssets[0]?.rentedByUserEmail ||
    userAssets[0]?.rentedByUserId ||
    'Unknown User';

  const getTypeName = (id: string) =>
    assetTypes.find(t => t.id === id)?.name ?? 'Unknown Product';

  const withAction = async (fn: () => Promise<void>) => {
    setSubmitting(true);
    setApiError('');
    try {
      await fn();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'An error occurred';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = (ids: string[]) =>
    withAction(() => updateAssetStatuses(ids, 'Available', true));

  const handleMaintenance = (ids: string[]) =>
    withAction(() => updateAssetStatuses(ids, 'Maintenance', true));

  const handleDenyDirect = (ids: string[]) =>
    withAction(() => updateAssetStatuses(ids, 'Rented'));

  const handleDenyConfirmed = () => {
    if (!pendingDeny) return;
    const { ids } = pendingDeny;
    setPendingDeny(null);
    withAction(() => updateAssetStatuses(ids, 'Rented'));
  };

  if (pending.length === 0) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
        <ArrowRightLeft size={40} className="text-status-success opacity-40" />
        <p className="text-text-muted text-lg font-medium">No Pending Return Requests</p>
        <p className="text-text-subtle text-sm">All return requests have been processed.</p>
      </div>
    );
  }

  const groupedByUser = groupBy(pending, a => a.rentedByUserId ?? 'unknown');

  return (
    <>
      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-status-danger-dim/40 border border-status-danger/30 text-status-danger text-sm">
          {apiError}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedByUser).map(([userId, userAssets]) => {
          const groupedByType = groupBy(userAssets, a => a.typeId);
          const allUserIds    = userAssets.map(a => a.id);
          const userLabel     = getUserLabel(userAssets);

          return (
            <div key={userId} className="card overflow-hidden">
              {/* User-level header with bulk actions */}
              <div className="bg-surface-elevated/30 px-6 py-4 border-b border-border-default flex flex-wrap justify-between items-center gap-3">
                <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                  <Users size={18} className="text-brand-light" />
                  {userLabel}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApprove(allUserIds)}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                               bg-status-success-dim/40 border border-status-success/30 text-status-success
                               hover:bg-status-success-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={14} /> Approve All
                  </button>
                  <button
                    onClick={() => handleMaintenance(allUserIds)}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                               bg-status-warning-dim/40 border border-status-warning/30 text-status-warning
                               hover:bg-status-warning-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wrench size={14} /> Maintenance All
                  </button>
                  <button
                    onClick={() =>
                      setPendingDeny({
                        ids:   allUserIds,
                        label: `all ${allUserIds.length} return${allUserIds.length !== 1 ? 's' : ''} for ${userLabel}`,
                      })
                    }
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                               bg-status-danger-dim/40 border border-status-danger/30 text-status-danger
                               hover:bg-status-danger-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={14} /> Deny All
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {Object.entries(groupedByType).map(([typeId, typeAssets]) => {
                  const allTypeIds = typeAssets.map(a => a.id);
                  const typeName   = getTypeName(typeId);

                  return (
                    <div key={typeId} className="border-l-4 border-brand/40 pl-4">
                      {/* Type-level header with bulk actions (only shown when >1 unit) */}
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                        <h4 className="font-bold text-text-secondary">{typeName}</h4>
                        {typeAssets.length > 1 && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleApprove(allTypeIds)}
                              disabled={submitting}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                         bg-status-success-dim/40 border border-status-success/30 text-status-success
                                         hover:bg-status-success-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check size={12} /> Approve {typeName}
                            </button>
                            <button
                              onClick={() => handleMaintenance(allTypeIds)}
                              disabled={submitting}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                         bg-status-warning-dim/40 border border-status-warning/30 text-status-warning
                                         hover:bg-status-warning-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Wrench size={12} /> Maintenance {typeName}
                            </button>
                            <button
                              onClick={() =>
                                setPendingDeny({
                                  ids:   allTypeIds,
                                  label: `${allTypeIds.length} ${typeName} unit${allTypeIds.length !== 1 ? 's' : ''} for ${userLabel}`,
                                })
                              }
                              disabled={submitting}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                         bg-status-danger-dim/40 border border-status-danger/30 text-status-danger
                                         hover:bg-status-danger-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X size={12} /> Deny {typeName}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Individual asset rows */}
                      <div className="space-y-2">
                        {typeAssets.map(asset => (
                          <div
                            key={asset.id}
                            className="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-3
                                       bg-surface-elevated/20 border border-border-default p-3 rounded-lg"
                          >
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-sm font-medium text-text-secondary">{asset.name}</span>
                              {asset.returnDate && (
                                <span className="flex items-center gap-1 text-xs text-brand-subtle bg-brand-dim/40 border border-brand/20 px-2 py-0.5 rounded-full">
                                  <Calendar size={11} />
                                  Return: {formatAusDate(asset.returnDate)}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleApprove([asset.id])}
                                disabled={submitting}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                           bg-status-success-dim/40 border border-status-success/30 text-status-success
                                           hover:bg-status-success-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                onClick={() => handleMaintenance([asset.id])}
                                disabled={submitting}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                           bg-status-warning-dim/40 border border-status-warning/30 text-status-warning
                                           hover:bg-status-warning-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Wrench size={12} /> Maintenance
                              </button>
                              <button
                                onClick={() => handleDenyDirect([asset.id])}
                                disabled={submitting}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                           bg-status-danger-dim/40 border border-status-danger/30 text-status-danger
                                           hover:bg-status-danger-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X size={12} /> Deny
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={pendingDeny !== null}
        title="Deny Return Request?"
        message={`This will deny ${pendingDeny?.label ?? 'the selected return request(s)'} and mark the assets as still Rented.`}
        confirmLabel="Deny"
        onConfirm={handleDenyConfirmed}
        onCancel={() => setPendingDeny(null)}
      />
    </>
  );
};

export default PendingReturnTab;
