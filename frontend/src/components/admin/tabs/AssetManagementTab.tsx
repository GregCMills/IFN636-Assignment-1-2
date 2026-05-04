import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import ConfirmModal from '../../ConfirmModal';
import InlineErrorBanner from '../../ui/InlineErrorBanner';
import ImageLightbox from '../../ui/ImageLightbox';
import EditEntityModal from '../EditEntityModal';

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
  uploadPhoto,
  deletePhoto,
  updateEntity,
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
  const [lightboxUrl,     setLightboxUrl]     = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{
    entityType: 'group' | 'type' | 'asset';
    entityId: string;
  } | null>(null);

  // Derive the full entity from the live data arrays so photo uploads/deletes
  // are reflected immediately without needing to close and reopen the modal.
  const editEntity = useMemo(() => {
    if (!editTarget) return null;
    switch (editTarget.entityType) {
      case 'group': return productGroups.find(g => g.id === editTarget.entityId) ?? null;
      case 'type':  return assetTypes.find(t => t.id === editTarget.entityId) ?? null;
      case 'asset': return assets.find(a => a.id === editTarget.entityId) ?? null;
    }
    return null;
  }, [editTarget, productGroups, assetTypes, assets]);

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

  /**
   * withSubmit wraps an async form submission or handler function, providing common
   * UX feedback: it sets submitting=true during the request, clears API errors, 
   * and captures/display errors from the API/fn if they occur. It ensures the submitting
   * flag is reset after completion or any exception.
   * 
   * Usage: withSubmit(async () => {... your API logic ...});
   */
  const withSubmit = async (fn: () => Promise<void>) => {
    setSubmitting(true);     // Show loading state on form/buttons
    setApiError('');         // Clear any prior API error
    try {
      await fn();            // Run the provided async handler
    } catch (err: unknown) {
      // Try to surface error returned by API (axios style), fallback to generic
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'An error occurred';
      setApiError(msg);
    } finally {
      setSubmitting(false);  // Always turn off loading state after completion
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

      <InlineErrorBanner message={apiError} />

      {/* ── Step 1: Product Group ──────────────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">1. Select Product Group</h2>

        <form onSubmit={handleAddGroup} className="flex gap-2 mb-8 max-w-md">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {productGroups.map(group => {
            const isSelected = selectedGroupId === group.id;
            return (
              <div
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`group relative aspect-video bg-surface-base/50 border rounded-xl overflow-hidden hover:border-brand transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-brand shadow-2xl scale-[1.02] ring-4 ring-brand/20'
                    : 'border-border-default'
                }`}
              >
                {/* Image or No Image placeholder */}
                {group.imageUrl ? (
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                    onClick={e => { e.stopPropagation(); setLightboxUrl(group.imageUrl ?? null); }}
                  />
                ) : null}

                {/* Title with gradient overlay */}
                <div className="absolute top-0 inset-x-0 pt-4 pb-10 bg-gradient-to-b from-black/90 to-transparent flex flex-col items-center z-10 pointer-events-none">
                  <span className="text-white text-sm font-bold tracking-wide drop-shadow-lg px-4 truncate">{group.name}</span>
                  {group.description && (
                    <span className="text-white/70 text-xs mt-0.5 px-4 line-clamp-1">{group.description}</span>
                  )}
                </div>

                {/* Hover action buttons */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-[2px] z-20 pt-4">
                  <button
                    onClick={e => { e.stopPropagation(); setEditTarget({ entityType: 'group', entityId: group.id }); }}
                    disabled={submitting}
                    className="w-11 h-11 flex items-center justify-center bg-surface-elevated text-text-primary rounded-full transition-all duration-200 hover:bg-white hover:text-black hover:scale-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit group"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                    disabled={submitting}
                    className="w-11 h-11 flex items-center justify-center bg-surface-elevated text-text-primary rounded-full transition-all duration-200 hover:bg-red-600 hover:text-white hover:scale-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete group"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {typesInGroup.map(type => {
                  const isSelected = selectedTypeId === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setSelectedTypeId(type.id)}
                      className={`group relative aspect-video bg-surface-base/50 border rounded-xl overflow-hidden hover:border-brand transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-2 border-brand shadow-2xl scale-[1.02] ring-4 ring-brand/20'
                          : 'border-border-default'
                      }`}
                    >
                      {type.imageUrl ? (
                        <img
                          src={type.imageUrl}
                          alt={type.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                          onClick={e => { e.stopPropagation(); setLightboxUrl(type.imageUrl ?? null); }}
                        />
                      ) : null}

                      <div className="absolute top-0 inset-x-0 pt-4 pb-10 bg-gradient-to-b from-black/90 to-transparent flex flex-col items-center z-10 pointer-events-none">
                        <span className="text-white text-sm font-bold tracking-wide drop-shadow-lg px-4 truncate">{type.name}</span>
                        {type.description && (
                          <span className="text-white/70 text-xs mt-0.5 px-4 line-clamp-1">{type.description}</span>
                        )}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-[2px] z-20 pt-4">
                        <button
                          onClick={e => { e.stopPropagation(); setEditTarget({ entityType: 'type', entityId: type.id }); }}
                          disabled={submitting}
                          className="w-11 h-11 flex items-center justify-center bg-surface-elevated text-text-primary rounded-full transition-all duration-200 hover:bg-white hover:text-black hover:scale-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit product"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteType(type.id); }}
                          disabled={submitting}
                          className="w-11 h-11 flex items-center justify-center bg-surface-elevated text-text-primary rounded-full transition-all duration-200 hover:bg-red-600 hover:text-white hover:scale-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete product"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {unitsInType.map(unit => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-4 bg-surface-base/50 border border-border-default rounded-xl hover:bg-surface-base transition group cursor-pointer"
                    onClick={() => setLightboxUrl(unit.imageUrl ?? null)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-text-primary truncate">{unit.name}</span>
                        {unit.description && (
                          <span className="text-text-muted text-xs truncate">{unit.description}</span>
                        )}
                      </div>
                      <span className={statusBadgeClass(unit.status)}>{unit.status}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button
                        onClick={e => { e.stopPropagation(); setEditTarget({ entityType: 'asset', entityId: unit.id }); }}
                        disabled={submitting}
                        className="text-text-muted hover:text-brand-light transition opacity-0 group-hover:opacity-100 p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Edit unit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteUnit(unit.id); }}
                        disabled={submitting}
                        className="text-text-muted hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Delete unit"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />

      {editEntity && editTarget && (
        <EditEntityModal
          isOpen={!!editEntity}
          onClose={() => setEditTarget(null)}
          entityType={editTarget.entityType}
          entity={editEntity}
          onSave={async (entityType, id, updates) => {
            await updateEntity(entityType, id, updates);
            setEditTarget(null);
          }}
          onUploadPhoto={uploadPhoto}
          onDeletePhoto={deletePhoto}
          submitting={submitting}
        />
      )}

    </div>
  );
};

export default AssetManagementTab;
