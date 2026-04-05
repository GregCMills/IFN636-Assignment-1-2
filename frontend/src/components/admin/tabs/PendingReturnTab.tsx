import { useState } from 'react';
import { Users, Calendar, Check, X, Wrench, ArrowRightLeft } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import ConfirmModal from '../../ConfirmModal';
import { groupBy, formatAusDate } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';
import InlineErrorBanner from '../../ui/InlineErrorBanner';
import GroupedCard from '../../ui/GroupedCard';
import AssetRow from '../../ui/AssetRow';

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
      <EmptyState
        icon={ArrowRightLeft}
        iconClassName="text-status-success opacity-40"
        title="No Pending Return Requests"
        description="All return requests have been processed."
      />
    );
  }

  const groupedByUser = groupBy(pending, a => a.rentedByUserId ?? 'unknown');

  return (
    <>
      <InlineErrorBanner message={apiError} className="mb-4" />

      <div className="space-y-6">
        {Object.entries(groupedByUser).map(([userId, userAssets]) => {
          const groupedByType = groupBy(userAssets, a => a.typeId);
          const allUserIds    = userAssets.map(a => a.id);
          const userLabel     = getUserLabel(userAssets);

          return (
            <GroupedCard
              key={userId}
              header={<>
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
              </>}
            >
              {Object.entries(groupedByType).map(([typeId, typeAssets]) => {
                  const allTypeIds = typeAssets.map(a => a.id);
                  const typeName   = getTypeName(typeId);

                  return (
                    <div key={typeId} className="border-l-4 border-brand/40 pl-4">
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

                      <div className="space-y-2">
                        {typeAssets.map(asset => (
                          <AssetRow key={asset.id}>
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
                          </AssetRow>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </GroupedCard>
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
