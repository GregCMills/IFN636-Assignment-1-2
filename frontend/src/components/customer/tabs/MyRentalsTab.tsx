import { useState } from 'react';
import { CheckCircle, ArrowRightLeft, Calendar } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import { groupBy, formatAusDate } from '../../../utils/helpers';

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
      <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
        <CheckCircle size={40} className="text-status-success opacity-40" />
        <p className="text-text-muted text-lg font-medium">No Active Rentals</p>
        <p className="text-text-subtle text-sm">You have no assets currently rented out.</p>
      </div>
    );
  }

  const groupedByDate = groupBy(myRentals, a => a.returnDate ?? 'No Return Date');

  return (
    <>
      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-status-danger-dim/40 border border-status-danger/30 text-status-danger text-sm">
          {apiError}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedByDate).sort().map(([date, dateAssets]) => {
          const groupedByType = groupBy(dateAssets, a => a.typeId);

          return (
            <div key={date} className="card overflow-hidden">
              <div className="bg-surface-elevated/30 px-6 py-4 border-b border-border-default flex items-center gap-2">
                <Calendar size={16} className="text-brand-light" />
                <h3 className="font-bold text-text-primary">
                  Return by: {date === 'No Return Date' ? date : formatAusDate(date)}
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {Object.entries(groupedByType).map(([typeId, typeAssets]) => (
                  <div key={typeId} className="border-l-4 border-brand/40 pl-4">
                    <h4 className="font-bold text-text-secondary mb-3">{getTypeName(typeId)}</h4>
                    <div className="space-y-2">
                      {typeAssets.map(asset => (
                        <div
                          key={asset.id}
                          className="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-3
                                     bg-surface-elevated/20 border border-border-default p-3 rounded-lg"
                        >
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
    </>
  );
};

export default MyRentalsTab;
