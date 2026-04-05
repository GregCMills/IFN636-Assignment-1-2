import { Users, Calendar } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import { groupBy, formatAusDate } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';

const RentedTab = ({
  assets,
  assetTypes,
}: AdminTabProps) => {
  const rented = assets.filter(a => a.status === 'Rented');

  /** Display name for a renter — prefer full name, fall back to email, then Clerk ID. */
  const getUserLabel = (userAssets: typeof rented) =>
    userAssets[0]?.rentedByUserName ||
    userAssets[0]?.rentedByUserEmail ||
    userAssets[0]?.rentedByUserId ||
    'Unknown User';

  const getTypeName = (id: string) =>
    assetTypes.find(t => t.id === id)?.name ?? 'Unknown Product';

  if (rented.length === 0) {
    return (
      <EmptyState
        title="No Assets Currently Rented"
        description="There are no active rentals at this time."
      />
    );
  }

  const groupedByUser = groupBy(rented, a => a.rentedByUserId ?? 'unknown');

  return (
    <div className="space-y-6">
      {Object.entries(groupedByUser).map(([userId, userAssets]) => {
        const groupedByType = groupBy(userAssets, a => a.typeId);
        const userLabel     = getUserLabel(userAssets);

        return (
          <div key={userId} className="card overflow-hidden">
            <div className="bg-surface-elevated/30 px-6 py-4 border-b border-border-default flex flex-wrap items-center gap-3">
              <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                <Users size={18} className="text-brand-light" />
                {userLabel}
              </h3>
              <span className="ml-auto badge-rented">
                {userAssets.length} unit{userAssets.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {Object.entries(groupedByType).map(([typeId, typeAssets]) => {
                const typeName = getTypeName(typeId);

                return (
                  <div key={typeId} className="border-l-4 border-brand/40 pl-4">
                    <h4 className="font-bold text-text-secondary mb-3">{typeName}</h4>
                    <div className="space-y-2">
                      {typeAssets.map(asset => (
                        <div
                          key={asset.id}
                          className="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-3
                                     bg-surface-elevated/20 border border-border-default p-3 rounded-lg"
                        >
                          <span className="text-sm font-medium text-text-secondary">{asset.name}</span>
                          {asset.returnDate && (
                            <span className="flex items-center gap-1 text-xs text-brand-subtle bg-brand-dim/40 border border-brand/20 px-2 py-0.5 rounded-full">
                              <Calendar size={11} />
                              Return by: {formatAusDate(asset.returnDate)}
                            </span>
                          )}
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

export default RentedTab;
