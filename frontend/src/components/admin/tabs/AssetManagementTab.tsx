import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import ConfirmModal from '../../ConfirmModal';

interface PendingDelete {
  action: () => Promise<void>;
  title: string;
  message: string;
  detail: string;
}

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Available':   return 'badge-available';
    case 'Rented':      return 'badge-rented';
    case 'Maintenance': return 'badge-maintenance';
    default:            return 'badge-pending';
  }
};

const AssetManagementTab = ({
  productGroups,
  assetTypes,
  assets,
  createProductGroup,
  deleteProductGroup,
  createAssetType,
  deleteAssetType,
  createAssets,
  deleteAsset,
}: AdminTabProps) => {
  const [newGroupName,    setNewGroupName]    = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(productGroups[0]?.id ?? null);
  const [newTypeName,     setNewTypeName]     = useState('');
  const [selectedTypeId,  setSelectedTypeId]  = useState<string | null>(null);
  const [unitPrefix,      setUnitPrefix]      = useState('Unit');
  const [unitQty,         setUnitQty]         = useState(1);
  const [submitting,      setSubmitting]      = useState(false);
  const [apiError,        setApiError]        = useState('');
  const [pendingDelete,   setPendingDelete]   = useState<PendingDelete | null>(null);

  // Keep selectedTypeId in sync when selected group changes
  useEffect(() => {
    const firstType = assetTypes.find(t => t.groupId === selectedGroupId);
    setSelectedTypeId(firstType?.id ?? null);
  }, [selectedGroupId, assetTypes]);

  // Seed the initial selected group once data loads
  useEffect(() => {
    if (!selectedGroupId && productGroups.length > 0) {
      setSelectedGroupId(productGroups[0].id);
    }
  }, [productGroups, selectedGroupId]);

  // Update prefix to first 3 letters of the selected product name
  useEffect(() => {
    const typeName = assetTypes.find(t => t.id === selectedTypeId)?.name ?? '';
    if (typeName) setUnitPrefix(typeName.slice(0, 3).toUpperCase());
  }, [selectedTypeId, assetTypes]);

  const withSubmit = async (fn: () => Promise<void>) => {
    setSubmitting(true);
    setApiError('');
    try {
      await fn();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'An error occurred';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Group handlers ─────────────────────────────────────────────────────────

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    withSubmit(async () => {
      const group = await createProductGroup(newGroupName.trim());
      setNewGroupName('');
      setSelectedGroupId(prev => prev ?? group.id);
    });
  };

  const handleDeleteGroup = (id: string) => {
    const typesInside = assetTypes.filter(t => t.groupId === id);
    const unitCount   = assets.filter(a => typesInside.some(t => t.id === a.typeId)).length;
    const group       = productGroups.find(g => g.id === id);

    const doDelete = async () => {
      await deleteProductGroup(id);
      if (selectedGroupId === id) setSelectedGroupId(productGroups.find(g => g.id !== id)?.id ?? null);
    };

    if (typesInside.length === 0) {
      withSubmit(doDelete);
      return;
    }

    setPendingDelete({
      action: doDelete,
      title:  `Delete "${group?.name}"?`,
      message: 'This group is not empty. Deleting it will permanently remove:',
      detail: [
        `${typesInside.length} product${typesInside.length !== 1 ? 's' : ''}`,
        unitCount > 0 ? `${unitCount} unit${unitCount !== 1 ? 's' : ''}` : '',
      ].filter(Boolean).join(' and '),
    });
  };

  // ── Type handlers ──────────────────────────────────────────────────────────

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !selectedGroupId) return;
    withSubmit(async () => {
      const type = await createAssetType(selectedGroupId, newTypeName.trim());
      setNewTypeName('');
      setSelectedTypeId(prev => prev ?? type.id);
    });
  };

  const handleDeleteType = (id: string) => {
    const unitsInside = assets.filter(a => a.typeId === id);
    const type        = assetTypes.find(t => t.id === id);

    const doDelete = async () => {
      await deleteAssetType(id);
      if (selectedTypeId === id) setSelectedTypeId(null);
    };

    if (unitsInside.length === 0) {
      withSubmit(doDelete);
      return;
    }

    setPendingDelete({
      action: doDelete,
      title:  `Delete "${type?.name}"?`,
      message: 'This product has units assigned to it. Deleting it will permanently remove:',
      detail: `${unitsInside.length} unit${unitsInside.length !== 1 ? 's' : ''}`,
    });
  };

  // ── Unit helpers ──────────────────────────────────────────────────────────

  /** Find the highest trailing number across all units in the current type. */
  const nextUnitNumber = (typeId: string | null): number => {
    if (!typeId) return 1;
    const existing = assets.filter(a => a.typeId === typeId);
    const max = existing.reduce((hi, unit) => {
      const m = unit.name.match(/(\d+)$/);
      return m ? Math.max(hi, parseInt(m[1], 10)) : hi;
    }, 0);
    return max + 1;
  };

  const fmtUnitName = (prefix: string, n: number) =>
    `${prefix.trim()} ${String(n).padStart(3, '0')}`;

  // ── Unit handlers ──────────────────────────────────────────────────────────

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId || !unitPrefix.trim()) return;
    withSubmit(async () => {
      const start = nextUnitNumber(selectedTypeId);
      const names = Array.from({ length: unitQty }, (_, i) =>
        fmtUnitName(unitPrefix, start + i)
      );
      await createAssets(selectedTypeId, names);
    });
  };

  const handleDeleteUnit = (id: string) => {
    withSubmit(async () => {
      await deleteAsset(id);
    });
  };

  const typesInGroup  = assetTypes.filter(t => t.groupId === selectedGroupId);
  const unitsInType   = assets.filter(a => a.typeId === selectedTypeId);
  const selectedGroup = productGroups.find(g => g.id === selectedGroupId);
  const selectedType  = assetTypes.find(t => t.id === selectedTypeId);

  return (
    <div className="flex flex-col gap-6">

      {apiError && (
        <div className="bg-status-danger-dim/40 border border-status-danger/30 text-status-danger px-4 py-3 rounded-lg text-sm">
          {apiError}
        </div>
      )}

      {/* ── Step 1: Product Group ──────────────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">1. Select Product Group</h2>

        <form onSubmit={handleAddGroup} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New group name…"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            className="input-base flex-1 text-sm"
            disabled={submitting}
          />
          <button type="submit" className="btn-primary p-2" disabled={submitting}>
            <Plus size={20} />
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {productGroups.map(group => (
            <div
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition border ${
                selectedGroupId === group.id
                  ? 'bg-surface-elevated border-border-strong shadow-inner'
                  : 'bg-surface-raised border-transparent hover:bg-surface-elevated/50'
              }`}
            >
              <span className="font-medium text-text-secondary truncate">{group.name}</span>
              <button
                onClick={e => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                className="text-text-subtle hover:text-status-danger transition shrink-0 ml-2"
                disabled={submitting}
                title="Delete group"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {productGroups.length === 0 && (
            <p className="text-text-subtle text-sm col-span-full">No groups yet. Add one above.</p>
          )}
        </div>
      </section>

      {/* ── Step 2: Product (Asset Type) ──────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          2. Select Product
          {selectedGroup && (
            <span className="text-text-muted font-normal text-base ml-2">in {selectedGroup.name}</span>
          )}
        </h2>

        {selectedGroupId ? (
          <>
            <form onSubmit={handleAddType} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New product name…"
                value={newTypeName}
                onChange={e => setNewTypeName(e.target.value)}
                className="input-base flex-1 text-sm"
                disabled={submitting}
              />
              <button type="submit" className="btn-primary p-2" disabled={submitting}>
                <Plus size={20} />
              </button>
            </form>

            {typesInGroup.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {typesInGroup.map(type => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedTypeId(type.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition border ${
                      selectedTypeId === type.id
                        ? 'bg-surface-elevated border-border-strong shadow-inner'
                        : 'bg-surface-raised border-transparent hover:bg-surface-elevated/50'
                    }`}
                  >
                    <span className="font-medium text-text-secondary truncate">{type.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteType(type.id); }}
                      className="text-text-subtle hover:text-status-danger transition shrink-0 ml-2"
                      disabled={submitting}
                      title="Delete product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-subtle text-sm">No products in this group yet.</p>
            )}
          </>
        ) : (
          <p className="text-text-muted text-sm">Select a group above to manage its products.</p>
        )}
      </section>

      {/* ── Step 3: Individual Units ───────────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          3. Manage Units
          {selectedType && (
            <span className="text-text-muted font-normal text-base ml-2">for {selectedType.name}</span>
          )}
        </h2>

        {selectedTypeId ? (
          <>
            {/* Add units form */}
            <form onSubmit={handleAddUnit} className="flex flex-wrap items-end gap-3 mb-6 max-w-2xl">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-muted">Name Prefix</label>
                <input
                  type="text"
                  value={unitPrefix}
                  onChange={e => setUnitPrefix(e.target.value)}
                  className="input-base w-28 text-sm"
                  disabled={submitting}
                  placeholder="Unit"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-muted">Next ID</label>
                <div className="input-base w-28 text-sm text-text-subtle select-none pointer-events-none">
                  {fmtUnitName(unitPrefix || 'Unit', nextUnitNumber(selectedTypeId))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-muted">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={unitQty}
                  onChange={e => setUnitQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-base w-20 text-sm"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="btn-primary flex items-center gap-2 px-4 text-sm whitespace-nowrap"
                disabled={submitting || !unitPrefix.trim()}
              >
                <Plus size={16} />
                Add {unitQty > 1 ? `${unitQty} Units` : 'Unit'}
              </button>
            </form>

            {unitsInType.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unitsInType.map(unit => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 card hover:bg-surface-elevated/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-text-primary truncate">{unit.name}</span>
                      <span className={statusBadgeClass(unit.status)}>{unit.status}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="text-text-subtle hover:text-status-danger transition p-1 shrink-0 ml-2"
                      disabled={submitting}
                      title="Delete unit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-subtle text-sm text-center py-6">
                No units added for this product yet.
              </p>
            )}
          </>
        ) : (
          <p className="text-text-muted text-sm">Select a product above to manage its units.</p>
        )}
      </section>

      <ConfirmModal
        isOpen={!!pendingDelete}
        title={pendingDelete?.title ?? ''}
        message={pendingDelete?.message ?? ''}
        detail={pendingDelete?.detail}
        confirmLabel="Yes, delete all"
        onConfirm={() => {
          if (!pendingDelete) return;
          setPendingDelete(null);
          withSubmit(pendingDelete.action);
        }}
        onCancel={() => setPendingDelete(null)}
      />

    </div>
  );
};

export default AssetManagementTab;
