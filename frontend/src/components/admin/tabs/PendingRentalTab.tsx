import { useState } from 'react';
import { Users, Calendar, Check, X } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import ConfirmModal from '../../ConfirmModal';
import { groupBy, formatAusDate } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';
import InlineErrorBanner from '../../ui/InlineErrorBanner';
import GroupedCard from '../../ui/GroupedCard';
import AssetRow from '../../ui/AssetRow';
import ThumbnailImage from '../../ui/ThumbnailImage';
import ImageLightbox from '../../ui/ImageLightbox';

interface PendingDeny {
  ids: string[];
  label: string;
}

const PendingRentalTab = ({
  assets,
  assetTypes,
  updateAssetStatuses,
}: AdminTabProps) => {
  const [submitting, setSubmitting]   = useState(false);
  const [apiError,   setApiError]     = useState('');
  const [pendingDeny, setPendingDeny] = useState<PendingDeny | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const pending = assets.filter(a => a.status === 'Pending Rental');

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
    withAction(() => updateAssetStatuses(ids, 'Rented'));

  const handleDenyDirect = (ids: string[]) =>
    withAction(() => updateAssetStatuses(ids, 'Available', true));

  const handleDenyConfirmed = () => {
    if (!pendingDeny) return;
    const { ids } = pendingDeny;
    setPendingDeny(null);
    withAction(() => updateAssetStatuses(ids, 'Available', true));
  };

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={Check}
        iconClassName="text-status-success opacity-40"
        title="No Pending Rental Requests"
        description="All rental requests have been processed."
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
                <div className="flex gap-2">
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
                    onClick={() =>
                      setPendingDeny({
                        ids:   allUserIds,
                        label: `all ${allUserIds.length} rental${allUserIds.length !== 1 ? 's' : ''} for ${userLabel}`,
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
                          <div className="flex gap-2">
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
                              <ThumbnailImage
                                thumbnailUrl={asset.thumbnailUrl}
                                imageUrl={asset.imageUrl}
                                onClick={() => setLightboxUrl(asset.imageUrl ?? null)}
                              />
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
        title="Deny Rental Request?"
        message={`This will deny ${pendingDeny?.label ?? 'the selected rental request(s)'} and return the assets to Available.`}
        confirmLabel="Deny"
        onConfirm={handleDenyConfirmed}
        onCancel={() => setPendingDeny(null)}
      />

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </>
  );
};

export default PendingRentalTab;
