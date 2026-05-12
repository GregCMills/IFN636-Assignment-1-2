import { useState } from 'react';
import { CheckCircle, ArrowRightLeft, Calendar } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import { groupBy, formatAusDate } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';
import InlineErrorBanner from '../../ui/InlineErrorBanner';
import GroupedCard from '../../ui/GroupedCard';
import AssetRow from '../../ui/AssetRow';
import ThumbnailImage from '../../ui/ThumbnailImage';
import ImageLightbox from '../../ui/ImageLightbox';

/**
 * Shows all assets currently rented by the authenticated customer, grouped by
 * return date and then by asset type. Customers can submit a return request for
 * individual assets, which transitions the asset to 'Pending Return' for admin
 * verification.
 */
const MyRentalsTab = ({ assets, assetTypes, currentUserId, updateAssetStatuses, requestExtension }: CustomerTabProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [submittingExtensionId, setSubmittingExtensionId] = useState<string | null>(null);
  const [extensionDates, setExtensionDates] = useState<Record<string, string>>({});
  const [apiError,   setApiError]   = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const myRentals = assets.filter(
    a => a.status === 'Rented' && a.rentedByUserId === currentUserId,
  );

  const getTypeName = (id: string) =>
    assetTypes.find(t => t.id === id)?.name ?? 'Unknown Product';

  /**
   * Moves the given assets to 'Pending Return' status, triggering an admin review.
   *
   * @param ids - Asset IDs to submit for return.
   */
  const handleSubmitReturn = async (ids: string[]) => {
    setSubmitting(true);
    setApiError('');
    try {
      await updateAssetStatuses(ids, 'Pending Return');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'An error occurred. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestExtension = async (assetId: string) => {
    const newReturnDate = extensionDates[assetId];
    if (!newReturnDate) {
      setApiError('Please select a new return date for the extension request.');
      return;
    }

    setSubmittingExtensionId(assetId);
    setApiError('');
    try {
      await requestExtension(assetId, newReturnDate);
      setExtensionDates(prev => ({ ...prev, [assetId]: '' }));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'An error occurred. Please try again.';
      setApiError(msg);
    } finally {
      setSubmittingExtensionId(null);
    }
  };

  if (myRentals.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        iconClassName="text-status-success opacity-40"
        title="No Active Rentals"
        description="You have no assets currently rented out."
      />
    );
  }

  // Group rentals by return date so the customer can see which items are due back first.
  const groupedByDate = groupBy(myRentals, a => a.returnDate ?? 'No Return Date');

  return (
    <>
      <InlineErrorBanner message={apiError} className="mb-4" />

      <div className="space-y-6">
        {Object.entries(groupedByDate).sort().map(([date, dateAssets]) => {
          const groupedByType = groupBy(dateAssets, a => a.typeId);

          return (
            <GroupedCard
              key={date}
              headerClassName="flex items-center gap-2"
              header={<>
                <Calendar size={16} className="text-brand-light" />
                <h3 className="font-bold text-text-primary">
                  Return by: {date === 'No Return Date' ? date : formatAusDate(date)}
                </h3>
              </>}
            >
              {Object.entries(groupedByType).map(([typeId, typeAssets]) => (
                  <div key={typeId} className="border-l-4 border-brand/40 pl-4">
                    <h4 className="font-bold text-text-secondary mb-3">{getTypeName(typeId)}</h4>
                    <div className="space-y-2">
                      {typeAssets.map(asset => (
                        <AssetRow key={asset.id}>
                          <div className="flex items-center gap-3 min-w-0">
                            <ThumbnailImage
                              thumbnailUrl={asset.thumbnailUrl}
                              imageUrl={asset.imageUrl}
                              onClick={() => setLightboxUrl(asset.imageUrl ?? null)}
                            />
                            <span className="text-sm font-medium text-text-secondary">{asset.name}</span>
                          </div>
                          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2">
                            {asset.extensionRequestedReturnDate ? (
                              <span className="text-xs font-medium text-brand-light">
                                Extension pending: {formatAusDate(asset.extensionRequestedReturnDate)}
                              </span>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <label htmlFor={`extension-date-${asset.id}`} className="sr-only">
                                  New return date for {asset.name}
                                </label>
                                <input
                                  id={`extension-date-${asset.id}`}
                                  type="date"
                                  value={extensionDates[asset.id] ?? ''}
                                  onChange={e => setExtensionDates(prev => ({ ...prev, [asset.id]: e.target.value }))}
                                  className="rounded-lg border border-surface-border bg-surface-panel px-2.5 py-1.5 text-sm text-text-primary"
                                  aria-label={`New return date for ${asset.name}`}
                                />
                                <button
                                  onClick={() => handleRequestExtension(asset.id)}
                                  disabled={submitting || submittingExtensionId === asset.id}
                                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-brand/30 text-brand-subtle
                                             bg-brand-dim/20 hover:bg-brand-dim/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Request Extension
                                </button>
                              </div>
                            )}

                            <button
                              onClick={() => handleSubmitReturn([asset.id])}
                              disabled={submitting}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                                         bg-brand-dim/40 border border-brand/30 text-brand-subtle
                                         hover:bg-brand-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed
                                         w-full sm:w-auto justify-center"
                            >
                              <ArrowRightLeft size={14} />
                              Submit Return
                            </button>
                          </div>
                        </AssetRow>
                      ))}
                    </div>
                  </div>
                ))}
            </GroupedCard>
          );
        })}
      </div>

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </>
  );
};

export default MyRentalsTab;
