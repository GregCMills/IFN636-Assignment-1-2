import { useState } from 'react';
import { Package, SlidersHorizontal } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import type { AssetStatus } from '../../../types/assets';

const ALL_STATUSES: AssetStatus[] = [
  'Available',
  'Rented',
  'Pending Rental',
  'Pending Return',
  'Maintenance',
];

const OverviewTab = ({ assets, assetTypes, productGroups }: AdminTabProps) => {
  const [statusFilter, setStatusFilter] = useState<AssetStatus>('Available');

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
        <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
          <Package size={40} className="text-text-subtle opacity-30" />
          <p className="text-text-muted text-lg font-medium">No Products Found</p>
          <p className="text-text-subtle text-sm">Add product groups and products in Asset Management.</p>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
