import { useState } from 'react';
import { Clock, ArrowRightLeft, Calendar, Layers } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import { groupBy, formatAusDate } from '../../../utils/helpers';
import InlineErrorBanner from '../../ui/InlineErrorBanner';

/**
 * Shows two read-only sections for the authenticated customer:
 *   1. Pending Rentals  — items the customer has requested but admin has not yet approved.
 *   2. Pending Returns  — items the customer has submitted for return but admin has not yet confirmed.
 *
 * Customers can cancel a pending return (reverting the asset back to 'Rented')
 * but cannot act on pending rentals (those require admin approval).
 */
const PendingTab = ({
  assets,
  assetTypes,
  productGroups,
  currentUserId,
  updateAssetStatuses,
}: CustomerTabProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const pendingRentals = assets.filter(
    a => a.rentedByUserId === currentUserId && a.status === 'Pending Rental',
  );
  const pendingReturns = assets.filter(
    a => a.rentedByUserId === currentUserId && a.status === 'Pending Return',
  );

  const getType = (typeId: string) => assetTypes.find(t => t.id === typeId);
  const getGroupName = (typeId: string) => {
    const type = getType(typeId);
    return productGroups.find(g => g.id === type?.groupId)?.name ?? 'Uncategorised';
  };
  const getTypeName = (typeId: string) => getType(typeId)?.name ?? 'Unknown Product';

  /**
   * Reverts a pending return back to 'Rented', allowing the customer to keep
   * the asset and re-submit a return later.
   *
   * @param ids - Asset IDs to cancel the return for.
   */
  const handleCancelReturn = async (ids: string[]) => {
    setSubmitting(true);
    setApiError('');
    try {
      await updateAssetStatuses(ids, 'Rented');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'An error occurred. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reusable renderer for both the Pending Rentals and Pending Returns sections.
   * Assets are first grouped by return date, then by ProductGroup, then by AssetType,
   * giving a three-level hierarchy: Date → Group → Type → individual assets.
   *
   * @param sectionAssets  - The filtered asset list for this section.
   * @param emptyMessage   - Text shown when sectionAssets is empty.
   * @param renderAction   - Renders the action button (or null) for each asset row.
   */
  const renderSection = (
    sectionAssets: typeof pendingRentals,
    emptyMessage: string,
    renderAction: (assetId: string) => React.ReactNode,
  ) => {
    if (sectionAssets.length === 0) {
      return (
        <div className="card p-8 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-text-muted font-medium">{emptyMessage}</p>
        </div>
      );
    }

    const groupedByDate = groupBy(sectionAssets, a => a.returnDate ?? 'No Return Date');

    return (
      <div className="space-y-4">
        {Object.entries(groupedByDate)
          .sort()
          .map(([date, dateAssets]) => {
            const groupedByProductGroup = groupBy(dateAssets, a => getGroupName(a.typeId));

            return (
              <div key={date} className="card overflow-hidden">
                <div className="bg-surface-elevated/30 px-6 py-4 border-b border-border-default flex items-center gap-2">
                  <Calendar size={16} className="text-brand-light" />
                  <h3 className="font-bold text-text-primary">
                    Return by:{' '}
                    {date === 'No Return Date' ? date : formatAusDate(date)}
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {Object.entries(groupedByProductGroup).map(([groupName, groupAssets]) => {
                    const groupedByType = groupBy(groupAssets, a => a.typeId);

                    return (
                      <div key={groupName}>
                        <div className="flex items-center gap-2 mb-3">
                          <Layers size={14} className="text-brand-light" />
                          <h4 className="font-semibold text-text-secondary text-sm uppercase tracking-wider">
                            {groupName}
                          </h4>
                        </div>

                        <div className="space-y-4 pl-4 border-l-2 border-border-default">
                          {Object.entries(groupedByType).map(([typeId, typeAssets]) => (
                            <div key={typeId} className="border-l-4 border-brand/40 pl-4">
                              <h5 className="font-bold text-text-secondary mb-2">
                                {getTypeName(typeId)}
                              </h5>
                              <div className="space-y-2">
                                {typeAssets.map(asset => (
                                  <div
                                    key={asset.id}
                                    className="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-3
                                               bg-surface-elevated/20 border border-border-default p-3 rounded-lg"
                                  >
                                    <span className="text-sm font-medium text-text-secondary">
                                      {asset.name}
                                    </span>
                                    {renderAction(asset.id)}
                                  </div>
                                ))}
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
    );
  };

  return (
    <div className="space-y-10">
      <InlineErrorBanner message={apiError} />

      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Clock size={18} className="text-status-warning" />
          Pending Rentals
          <span className="text-xs font-normal text-text-subtle ml-1">
            — awaiting admin approval
          </span>
        </h2>
        {renderSection(
          pendingRentals,
          'No pending rental requests.',
          () => null,
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-brand-light" />
          Pending Returns
          <span className="text-xs font-normal text-text-subtle ml-1">
            — awaiting admin verification
          </span>
        </h2>
        {renderSection(
          pendingReturns,
          'No pending return requests.',
          (assetId) => (
            <button
              onClick={() => handleCancelReturn([assetId])}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                         bg-status-danger-dim/40 border border-status-danger/30 text-status-danger
                         hover:bg-status-danger-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed
                         w-full sm:w-auto justify-center shrink-0"
            >
              <ArrowRightLeft size={14} />
              Cancel Return
            </button>
          ),
        )}
      </section>
    </div>
  );
};

export default PendingTab;
