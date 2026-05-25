import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Trash2, X, Calendar, Eye, DollarSign } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import axiosInstance from '../../../axiosConfig';
import ImageLightbox from '../../ui/ImageLightbox';
import AssetTypeDetailModal from '../AssetTypeDetailModal';

type Cart = Record<string, number>; // typeId → quantity

interface CostItem {
  typeId: string;
  typeName: string;
  quantity: number;
  pricePerDay: number;
  perUnitCost: number;
  lineTotal: number;
  breakdown: string;
}

interface CostEstimate {
  days: number;
  returnDate: string;
  items: CostItem[];
  grandTotal: number;
}

const BrowseTab = ({ assets, assetTypes, productGroups, requestRental }: CustomerTabProps) => {
  const [cart, setCart]               = useState<Cart>({});
  const [isCartOpen, setIsCartOpen]   = useState(false);
  const [returnDate, setReturnDate]   = useState('');
  const [cartError, setCartError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [detailType, setDetailType]   = useState<typeof assetTypes[number] | null>(null);

  // FR-03 filter state
  const [filterName, setFilterName]       = useState('');
  const [filterGroupId, setFilterGroupId] = useState('');
  const [filterStatus, setFilterStatus]   = useState<'all' | 'available' | 'unavailable'>('all');

  // FR-05 cost estimate state
  const [costEstimate, setCostEstimate]     = useState<CostEstimate | null>(null);
  const [costLoading, setCostLoading]       = useState(false);

  // Count available units per asset type
  const availableCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assetTypes.forEach(t => { counts[t.id] = 0; });
    assets.forEach(a => {
      if (a.status === 'Available') counts[a.typeId] = (counts[a.typeId] ?? 0) + 1;
    });
    return counts;
  }, [assets, assetTypes]);

  // FR-03 filtered data
  const filteredGroups = useMemo(() => {
    return productGroups.filter(g => !filterGroupId || g.id === filterGroupId);
  }, [productGroups, filterGroupId]);

  const filteredAssetTypes = useMemo(() => {
    return assetTypes.filter(t => {
      if (filterName && !t.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      const available = availableCounts[t.id] ?? 0;
      if (filterStatus === 'available' && available === 0) return false;
      if (filterStatus === 'unavailable' && available > 0) return false;
      return true;
    });
  }, [assetTypes, filterName, filterStatus, availableCounts]);

  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // FR-05 — fetch cost estimate whenever cart or return date changes
  useEffect(() => {
    if (!returnDate || Object.keys(cart).length === 0) {
      setCostEstimate(null);
      return;
    }

    const fetchCost = async () => {
      setCostLoading(true);
      try {
        const items = Object.entries(cart).map(([typeId, quantity]) => ({ typeId, quantity }));
        const response = await axiosInstance.post('/api/assets/calculate-cost', { items, returnDate });
        const data = response.data;
        if (data && typeof data.grandTotal === 'number') {
          setCostEstimate(data);
        } else {
          setCostEstimate(null);
        }
      } catch {
        setCostEstimate(null);
      } finally {
        setCostLoading(false);
      }
    };

    fetchCost();
  }, [cart, returnDate]);

  const addToCart = (typeId: string) => {
    if ((cart[typeId] ?? 0) < (availableCounts[typeId] ?? 0)) {
      setCart(prev => ({ ...prev, [typeId]: (prev[typeId] ?? 0) + 1 }));
    }
  };

  const removeFromCart = (typeId: string) => {
    setCart(prev => {
      const next = { ...prev, [typeId]: (prev[typeId] ?? 1) - 1 };
      if (next[typeId] <= 0) delete next[typeId];
      return next;
    });
  };

  const deleteFromCart = (typeId: string) => {
    setCart(prev => { const next = { ...prev }; delete next[typeId]; return next; });
  };

  const getTypeName = (typeId: string) =>
    assetTypes.find(t => t.id === typeId)?.name ?? 'Unknown';

  const handleRequestRent = async () => {
    if (!returnDate) { setCartError('Please select a return date.'); return; }
    setCartError('');
    setSubmitting(true);
    try {
      const items = Object.entries(cart).map(([typeId, quantity]) => ({ typeId, quantity }));
      await requestRental(items, returnDate);
      setCart({});
      setReturnDate('');
      setIsCartOpen(false);
    } catch {
      setCartError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Catalogue — grouped by product group */}
      <div className="space-y-16">
        {/* FR-03 Filter controls */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-end border border-border-default">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-text-muted mb-1">Search</label>
            <input
              type="text"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-md text-text-primary"
            />
          </div>
          <div className="min-w-[180px]">
            <label className="block text-xs text-text-muted mb-1">Category</label>
            <select
              value={filterGroupId}
              onChange={e => setFilterGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-md text-text-primary"
            >
              <option value="">All categories</option>
              {productGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-xs text-text-muted mb-1">Availability</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-md text-text-primary"
            >
              <option value="all">All</option>
              <option value="available">Available only</option>
              <option value="unavailable">Unavailable only</option>
            </select>
          </div>
          {(filterName || filterGroupId || filterStatus !== 'all') && (
            <button
              onClick={() => { setFilterName(''); setFilterGroupId(''); setFilterStatus('all'); }}
              className="px-4 py-2 bg-surface-elevated border border-border-default rounded-md text-text-secondary hover:bg-surface-raised"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredGroups.map(group => {
          const typesInGroup = filteredAssetTypes.filter(t => t.groupId === group.id);
          if (typesInGroup.length === 0) return null;

          return (
            <section key={group.id}>
              <div className="relative h-24 md:h-32 w-full rounded-2xl overflow-hidden mb-6 group border-2 border-white/40 shadow-2xl">
                {group.imageUrl ? (
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-brand/80 via-brand-dark to-surface-deep" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent flex items-center px-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight [text-shadow:_0_4px_8px_rgba(0,0,0,0.9)]">
                    {group.name}
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typesInGroup.map(type => {
                  const available = availableCounts[type.id] ?? 0;
                  const inCart    = cart[type.id] ?? 0;
                  return (
                    <div key={type.id} className="card relative overflow-hidden flex group h-32 border border-border-default">
                      {/* Left side: Square Image with Shadow + hover overlay */}
                      {type.imageUrl && (
                        <div className="aspect-square h-full shrink-0 relative z-20 shadow-[6px_0_15px_rgba(0,0,0,0.5)] border-r border-border-default overflow-hidden">
                          <img 
                            src={type.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightboxUrl(type.imageUrl ?? null)}
                          />
                          {/* Dark overlay + view button on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-[2px] z-20">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDetailType(type); }}
                              className="w-11 h-11 flex items-center justify-center bg-surface-elevated text-text-primary rounded-full transition-all duration-200 hover:bg-white hover:text-black hover:scale-110 shadow-xl border border-white/30"
                              aria-label={`View ${type.name} details`}
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Right side: Content */}
                      <div className="relative z-10 flex-1 p-3 min-w-0 flex flex-col justify-between bg-surface-raised text-right">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm md:text-base font-bold text-text-secondary line-clamp-2 leading-tight">{type.name}</h3>
                        </div>

                        <div className="flex flex-col items-end gap-2 mt-auto">
                          <p className={`text-[10px] md:text-xs font-medium ${available - inCart > 0 ? 'text-status-success' : 'text-text-subtle'}`}>
                            {available - inCart > 0 ? `${available - inCart} available` : 'None left'}
                          </p>
                          
                          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-lg border border-border-default shadow-sm relative">
                              {inCart > 0 && (
                                <div className="absolute -top-2 -left-2 w-5 h-5 bg-brand text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-surface-raised z-20 animate-in zoom-in duration-200">
                                  {inCart}
                                </div>
                              )}
                              <button
                                onClick={() => removeFromCart(type.id)}
                                disabled={inCart === 0}
                                className="w-8 h-8 md:w-7 md:h-7 flex items-center justify-center rounded-md border border-border-strong bg-surface-raised text-text-secondary hover:bg-surface-elevated transition-all disabled:opacity-30 disabled:cursor-not-allowed text-base font-medium active:scale-90"
                                aria-label={`Remove one ${type.name} from cart`}
                              >
                                −
                              </button>
                              <button
                                onClick={() => addToCart(type.id)}
                                disabled={available === 0 || inCart >= available}
                                className="w-8 h-8 md:w-7 md:h-7 flex items-center justify-center rounded-md border border-brand/40 bg-brand-dim text-brand-subtle hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-base font-medium active:scale-90"
                                aria-label={`Add one ${type.name} to cart`}
                              >
                                +
                              </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {productGroups.length === 0 && (
          <div className="card p-12 text-center text-text-muted">
            No products available at this time.
          </div>
        )}
      </div>

      {/* Floating cart button */}
      <button
        onClick={() => setIsCartOpen(true)}
        aria-label={`Open cart (${totalCartItems} items)`}
        className="fixed bottom-8 right-8 bg-brand text-white p-4 rounded-full shadow-lg hover:bg-brand-hover transition-transform hover:scale-105 z-40 flex items-center justify-center border border-brand-hover"
      >
        <ShoppingCart size={24} />
        {totalCartItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-status-danger text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-surface-base">
            {totalCartItems}
          </span>
        )}
      </button>

      {/* Cart modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-surface-deep/80 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setIsCartOpen(false); }}
        >
          <div className="bg-surface-raised border border-border-default rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="p-4 border-b border-border-default flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <ShoppingCart size={20} /> Your Cart
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-text-muted hover:text-text-primary transition"
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-4 overflow-y-auto flex-1">
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(cart).map(([typeId, qty]) => (
                    <div
                      key={typeId}
                      className="flex justify-between items-center bg-surface-elevated/50 p-3 rounded-lg border border-border-default"
                    >
                      <div>
                        <div className="text-text-secondary font-medium">{getTypeName(typeId)}</div>
                        <div className="text-sm text-text-muted">Quantity: {qty}</div>
                      </div>
                      <button
                        onClick={() => deleteFromCart(typeId)}
                        className="text-text-muted hover:text-status-danger p-2 transition rounded-md hover:bg-surface-elevated"
                        aria-label={`Remove ${getTypeName(typeId)} from cart`}
                        title="Remove from cart"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {/* Return date */}
                  <div className="pt-4 border-t border-border-default">
                    <label className="block text-sm font-medium text-text-label mb-2 flex items-center gap-1.5">
                      <Calendar size={14} className="text-brand-light" /> Return Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={returnDate}
                      onChange={e => { setReturnDate(e.target.value); setCartError(''); }}
                      className="input-base text-sm"
                    />
                  </div>

                  {/* FR-05 Cost estimate */}
                  {returnDate && Object.keys(cart).length > 0 && (
                    <div className="pt-4 border-t border-border-default">
                      <label className="block text-sm font-medium text-text-label mb-2 flex items-center gap-1.5">
                        <DollarSign size={14} className="text-brand-light" /> Estimated Cost
                      </label>
                      {costLoading ? (
                        <p className="text-text-muted text-sm">Calculating...</p>
                      ) : costEstimate ? (
                        <div className="bg-surface-elevated/50 p-3 rounded-lg border border-border-default space-y-2">
                          <p className="text-xs text-text-muted">
                            {costEstimate.days} day{costEstimate.days === 1 ? '' : 's'} rental
                          </p>
                          {costEstimate.items?.map(item => (
                            <div key={item.typeId} className="flex justify-between text-sm">
                              <span className="text-text-secondary">
                                {item.typeName} × {item.quantity}
                              </span>
                              <span className="text-text-primary font-medium">
                                ${item.lineTotal?.toFixed(2) ?? '0.00'}
                              </span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-border-default flex justify-between items-center">
                            <span className="text-text-secondary font-bold">Total</span>
                            <span className="text-brand-light font-bold text-lg">
                              ${costEstimate.grandTotal?.toFixed(2) ?? '0.00'}
                            </span>
                          </div>
                          {(costEstimate.days ?? 0) >= 7 && (
                            <p className="text-xs text-status-success italic">
                              {(costEstimate.days ?? 0) >= 30
                                ? 'Long-term discount applied (15% + 10%)'
                                : 'Weekly discount applied (10%)'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-text-muted text-sm">Cost unavailable</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-border-default bg-surface-base/50 rounded-b-xl">
              {cartError && (
                <p className="mb-3 text-status-danger text-sm text-center font-medium">{cartError}</p>
              )}
              <button
                onClick={handleRequestRent}
                disabled={Object.keys(cart).length === 0 || submitting}
                className="btn-primary w-full py-3"
              >
                {submitting ? 'Submitting…' : 'Request Rent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset type detail modal */}
      <AssetTypeDetailModal
        isOpen={detailType !== null}
        onClose={() => setDetailType(null)}
        onViewImage={(url) => { setLightboxUrl(url); }}
        assetType={detailType ?? { id: '', name: '', description: '', imageUrl: undefined }}
        availableCount={detailType ? (availableCounts[detailType.id] ?? 0) : 0}
        inCartCount={detailType ? (cart[detailType.id] ?? 0) : 0}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
      />

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </>
  );
};

export default BrowseTab;