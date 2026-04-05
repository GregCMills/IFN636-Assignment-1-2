import { useState } from 'react';
import { Wrench, Check } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import { groupBy } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';
import InlineErrorBanner from '../../ui/InlineErrorBanner';
import GroupedCard from '../../ui/GroupedCard';
import AssetRow from '../../ui/AssetRow';

const MaintenanceTab = ({
  assets,
  assetTypes,
  productGroups,
  updateAssetStatuses,
}: AdminTabProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');

  const maintenance = assets.filter(a => a.status === 'Maintenance');

  const getTypeName = (id: string) =>
    assetTypes.find(t => t.id === id)?.name ?? 'Unknown Product';

  const getGroupName = (id: string) =>
    productGroups.find(g => g.id === id)?.name ?? 'Unknown Type';

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

  const handleMarkAvailable = (ids: string[]) =>
    withAction(() => updateAssetStatuses(ids, 'Available'));

  if (maintenance.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        iconClassName="text-status-warning opacity-40"
        title="No Assets in Maintenance"
        description="All assets are available or in use."
      />
    );
  }

  const groupedByProductType = groupBy(
    maintenance,
    a => assetTypes.find(t => t.id === a.typeId)?.groupId ?? 'unknown',
  );

  return (
    <>
      <InlineErrorBanner message={apiError} className="mb-4" />

      <div className="space-y-6">
        {Object.entries(groupedByProductType).map(([groupId, groupAssets]) => {
          const groupName    = getGroupName(groupId);
          const allGroupIds  = groupAssets.map(a => a.id);
          const groupedByType = groupBy(groupAssets, a => a.typeId);

          return (
            <GroupedCard
              key={groupId}
              header={<>
                <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                  <Wrench size={18} className="text-status-warning" />
                  {groupName}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="badge-maintenance">
                    {groupAssets.length} unit{groupAssets.length !== 1 ? 's' : ''}
                  </span>
                  {groupAssets.length > 1 && (
                    <button
                      onClick={() => handleMarkAvailable(allGroupIds)}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg
                                 bg-status-success-dim/40 border border-status-success/30 text-status-success
                                 hover:bg-status-success-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={14} /> Mark All Available
                    </button>
                  )}
                </div>
              </>}
            >
              {Object.entries(groupedByType).map(([typeId, typeAssets]) => {
                  const typeName   = getTypeName(typeId);
                  const allTypeIds = typeAssets.map(a => a.id);

                  return (
                    <div key={typeId} className="border-l-4 border-status-warning/40 pl-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h4 className="font-bold text-text-secondary">{typeName}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge-maintenance">
                            {typeAssets.length} unit{typeAssets.length !== 1 ? 's' : ''}
                          </span>
                          {typeAssets.length > 1 && (
                            <button
                              onClick={() => handleMarkAvailable(allTypeIds)}
                              disabled={submitting}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                         bg-status-success-dim/40 border border-status-success/30 text-status-success
                                         hover:bg-status-success-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check size={12} /> Mark All Available
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {typeAssets.map(asset => (
                          <AssetRow key={asset.id}>
                            <span className="text-sm font-medium text-text-secondary">{asset.name}</span>
                            <button
                              onClick={() => handleMarkAvailable([asset.id])}
                              disabled={submitting}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                                         bg-status-success-dim/40 border border-status-success/30 text-status-success
                                         hover:bg-status-success-dim/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check size={12} /> Mark Available
                            </button>
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
    </>
  );
};

export default MaintenanceTab;
