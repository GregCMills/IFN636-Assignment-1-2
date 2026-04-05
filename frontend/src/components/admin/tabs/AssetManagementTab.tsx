import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import { generateId } from '../../../utils/helpers';

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Available':      return 'badge-available';
    case 'Rented':         return 'badge-rented';
    case 'Maintenance':    return 'badge-maintenance';
    default:               return 'badge-pending';
  }
};

const AssetManagementTab = ({
  productGroups,
  setProductGroups,
  assetTypes,
  setAssetTypes,
  assets,
  setAssets,
}: AdminTabProps) => {
  // --- Step 1: Product Group ---
  const [newGroupName, setNewGroupName]       = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(productGroups[0]?.id ?? null);

  // --- Step 2: Product (Asset Type) ---
  const [newTypeName, setNewTypeName]       = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  // --- Step 3: Individual Unit ---
  const [newUnitName, setNewUnitName] = useState('');

  // Keep selectedTypeId in sync when the selected group changes
  useEffect(() => {
    const firstType = assetTypes.find(t => t.groupId === selectedGroupId);
    setSelectedTypeId(firstType?.id ?? null);
  }, [selectedGroupId, assetTypes]);

  // --- Group handlers ---
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const group = { id: generateId(), name: newGroupName.trim() };
    setProductGroups(prev => [...prev, group]);
    setNewGroupName('');
    if (!selectedGroupId) setSelectedGroupId(group.id);
  };

  const handleDeleteGroup = (id: string) => {
    if (assetTypes.some(t => t.groupId === id)) {
      alert('Cannot delete: products exist in this group.');
      return;
    }
    setProductGroups(prev => prev.filter(g => g.id !== id));
    if (selectedGroupId === id) setSelectedGroupId(productGroups[0]?.id ?? null);
  };

  // --- Type handlers ---
  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || !selectedGroupId) return;
    const type = { id: generateId(), groupId: selectedGroupId, name: newTypeName.trim() };
    setAssetTypes(prev => [...prev, type]);
    setNewTypeName('');
    if (!selectedTypeId) setSelectedTypeId(type.id);
  };

  const handleDeleteType = (id: string) => {
    if (assets.some(a => a.typeId === id)) {
      alert('Cannot delete: units exist under this product.');
      return;
    }
    setAssetTypes(prev => prev.filter(t => t.id !== id));
    if (selectedTypeId === id) setSelectedTypeId(null);
  };

  // --- Unit handlers ---
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || !selectedTypeId) return;
    const unit = { id: generateId(), typeId: selectedTypeId, name: newUnitName.trim(), status: 'Available' as const };
    setAssets(prev => [...prev, unit]);
    setNewUnitName('');
  };

  const handleDeleteUnit = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const typesInGroup   = assetTypes.filter(t => t.groupId === selectedGroupId);
  const unitsInType    = assets.filter(a => a.typeId === selectedTypeId);
  const selectedGroup  = productGroups.find(g => g.id === selectedGroupId);
  const selectedType   = assetTypes.find(t => t.id === selectedTypeId);

  return (
    <div className="flex flex-col gap-6">

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
          />
          <button type="submit" className="btn-primary p-2">
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
                title="Delete group"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Step 2: Product (Asset Type) ──────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          2. Select Product
          {selectedGroup && (
            <span className="text-text-muted font-normal text-base ml-2">
              in {selectedGroup.name}
            </span>
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
              />
              <button type="submit" className="btn-primary p-2">
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
            <span className="text-text-muted font-normal text-base ml-2">
              for {selectedType.name}
            </span>
          )}
        </h2>

        {selectedTypeId ? (
          <>
            <form onSubmit={handleAddUnit} className="flex gap-2 mb-6 max-w-lg">
              <input
                type="text"
                placeholder="Unit identifier / serial no…"
                value={newUnitName}
                onChange={e => setNewUnitName(e.target.value)}
                className="input-base flex-1 text-sm"
              />
              <button type="submit" className="btn-primary flex items-center gap-2 px-4 text-sm whitespace-nowrap">
                <Plus size={16} /> Add Unit
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

    </div>
  );
};

export default AssetManagementTab;
