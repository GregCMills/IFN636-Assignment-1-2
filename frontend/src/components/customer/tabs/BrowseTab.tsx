import { useState, useMemo } from 'react';
import { ShoppingCart, Trash2, X, Calendar } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import ThumbnailImage from '../../ui/ThumbnailImage';
import ImageLightbox from '../../ui/ImageLightbox';

type Cart = Record<string, number>; // typeId → quantity

const BrowseTab = ({ assets, assetTypes, productGroups, requestRental }: CustomerTabProps) => {
  const [cart, setCart]               = useState<Cart>({});
  const [isCartOpen, setIsCartOpen]   = useState(false);
  const [returnDate, setReturnDate]   = useState('');
  const [cartError, setCartError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Count available units per asset type
  const availableCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assetTypes.forEach(t => { counts[t.id] = 0; });
    assets.forEach(a => {
      if (a.status === 'Available') counts[a.typeId] = (counts[a.typeId] ?? 0) + 1;
    });
    return counts;
  }, [assets, assetTypes]);

  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

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
      <div className="space-y-8">
        {productGroups.map(group => {
          const typesInGroup = assetTypes.filter(t => t.groupId === group.id);
          if (typesInGroup.length === 0) return null;

          return (
            <section key={group.id}>
              <h2 className="text-xl font-bold text-text-primary mb-4 pb-2 border-b border-border-default">
                {group.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typesInGroup.map(type => {
                  const available = availableCounts[type.id] ?? 0;
                  const inCart    = cart[type.id] ?? 0;
                  return (
                    <div key={type.id} className="card relative overflow-hidden flex group h-32">
                      {/* Left side: Square Image with Shadow */}
                      {type.imageUrl && (
                        <div className="aspect-square h-full shrink-0 relative z-20 shadow-[6px_0_15px_rgba(0,0,0,0.5)] border-r border-border-default">
                          <img 
                            src={type.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightboxUrl(type.imageUrl ?? null)}
                          />
                        </div>
                      )}

                      {/* Right side: Content */}
                      <div className="relative z-10 flex-1 p-2 min-w-0 flex flex-col justify-between items-end text-right bg-surface-raised">
                        <h3 className="text-base font-bold text-text-secondary line-clamp-2 leading-tight">{type.name}</h3>

                        <div className="flex flex-col items-end gap-1">
                          <p className={`text-sm ${available > 0 ? 'text-status-success' : 'text-text-subtle'}`}>
                            {available > 0 ? `${available} available` : 'None available'}
                          </p>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium text-brand-light">
                              {inCart > 0 ? `${inCart} in cart` : ''}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeFromCart(type.id)}
                                disabled={inCart === 0}
                                className="w-8 h-8 flex items-center justify-center rounded border border-border-strong bg-surface-elevated text-text-secondary hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed text-lg leading-none"
                                aria-label={`Remove one ${type.name} from cart`}
                              >
                                −
                              </button>
                              <button
                                onClick={() => addToCart(type.id)}
                                disabled={available === 0 || inCart >= available}
                                className="w-8 h-8 flex items-center justify-center rounded border border-brand/40 bg-brand-dim text-brand-subtle hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed text-lg leading-none"
                                aria-label={`Add one ${type.name} to cart`}
                              >
                                +
                              </button>
                            </div>
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

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </>
  );
};

export default BrowseTab;
