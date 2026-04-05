import { useState } from 'react';
import { Package, SlidersHorizontal } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import type { AssetStatus } from '../../../types/assets';
import EmptyState from '../../ui/EmptyState';

/** All valid status values — drives both the filter dropdown and the count query. */
const ALL_STATUSES: AssetStatus[] = [
  'Available',
  'Rented',
  'Pending Rental',
  'Pending Return',
  'Maintenance',
];

/**
 * Provides a high-level inventory overview grouped by ProductGroup and AssetType.
 * A status filter lets admins quickly scan how many units of each product model
 * are in a given state (e.g. how many MacBook Air M2s are currently Available).
 */
const OverviewTab = ({ assets, assetTypes, productGroups }: AdminTabProps) => {
  const [statusFilter, setStatusFilter] = useState<AssetStatus>('Available');

  /**
   * Counts how many assets of a given type currently match the selected status filter.
   *
   * @param typeId - The AssetType ID to count for.
   */
  const countForType = (typeId: string) =>
    assets.filter(a => a.typeId === typeId && a.status === statusFilter).length;

  return (
    <div className="space-y-8">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-text-muted shrink-0" />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as AssetStatus)}
          className="px-3 py-2 rounded-lg bg-surface-elevated border border-border-default
                     text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Groups */}
      {productGroups.map(group => {
        const typesInGroup = assetTypes.filter(t => t.groupId === group.id);
        if (typesInGroup.length === 0) return null;

        return (
          <div key={group.id}>
            <h2 className="text-lg font-bold text-text-primary border-b border-border-default pb-2 mb-4">
              {group.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {typesInGroup.map(type => {
                const count = countForType(type.id);
                return (
                  <div
                    key={type.id}
                    className="card p-6 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-text-muted text-sm font-medium mb-1">{type.name}</p>
                      <p className="text-3xl font-bold text-brand-light">{count}</p>
                    </div>
                    <Package size={32} className="text-text-subtle opacity-40 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {productGroups.every(g => assetTypes.filter(t => t.groupId === g.id).length === 0) && (
        <EmptyState
          icon={Package}
          iconClassName="text-text-subtle opacity-30"
          title="No Products Found"
          description="Add product groups and products in Asset Management."
        />
      )}
    </div>
  );
};

export default OverviewTab;
