import { useState } from 'react';
import { CheckCircle, ArrowRightLeft, Calendar } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import { groupBy, formatAusDate } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';
import InlineErrorBanner from '../../ui/InlineErrorBanner';
import GroupedCard from '../../ui/GroupedCard';
import AssetRow from '../../ui/AssetRow';

const MyRentalsTab = ({ assets, assetTypes, currentUserId, updateAssetStatuses }: CustomerTabProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');

  const myRentals = assets.filter(
    a => a.status === 'Rented' && a.rentedByUserId === currentUserId,
  );

  const getTypeName = (id: string) =>
    assetTypes.find(t => t.id === id)?.name ?? 'Unknown Product';

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
                          <span className="text-sm font-medium text-text-secondary">{asset.name}</span>
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
                        </AssetRow>
                      ))}
                    </div>
                  </div>
                ))}
            </GroupedCard>
          );
        })}
      </div>
    </>
  );
};

export default MyRentalsTab;
