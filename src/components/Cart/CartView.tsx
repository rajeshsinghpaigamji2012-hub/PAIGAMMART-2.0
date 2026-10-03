import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  Tag,
  Truck,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Check,
  X,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    setCurrentView,
    appliedCoupon,
    couponDiscount,
    applyCouponCode,
    removeCouponCode,
    openProduct,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalMrp = cart.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const totalSavings = totalMrp - subtotal + couponDiscount;

  const isFreeDelivery = subtotal >= 499;
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : 49;
  const finalPayable = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCouponCode(couponInput.trim().toUpperCase());
    setIsApplying(false);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
          Explore handcrafted treasures, pure ethnic sarees, brassware, and artisanal spices from verified Indian merchants.
        </p>
        <button
          onClick={() => setCurrentView('home')}
          className="mt-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-colors"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500">
            {cart.length} unique item{cart.length > 1 ? 's' : ''} in your cart
          </p>
        </div>

        {isFreeDelivery ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
            <Truck className="w-4 h-4" />
            <span>Eligible for FREE Express Delivery</span>
          </div>
        ) : (
          <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
            Add ₹{(499 - subtotal).toLocaleString('en-IN')} more for <strong>FREE Delivery</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const itemTotal = item.product.price * item.quantity;
            return (
              <div
                key={`${item.productId}-${item.selectedVariantId || 'default'}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-slate-300 transition-colors shadow-2xs"
              >
                {/* Product Image & Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    onClick={() => openProduct(item.product.id)}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                      {item.product.brand}
                    </span>
                    <h3
                      onClick={() => openProduct(item.product.id)}
                      className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-amber-600 cursor-pointer"
                    >
                      {item.product.title}
                    </h3>

                    {/* Variant badge if chosen */}
                    {(item.size || item.color) && (
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        Option: {item.size || item.color}
                      </span>
                    )}

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{item.product.mrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Quantity Stepper & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-black text-slate-900 font-mono block">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Save ₹{((item.product.mrp - item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Actions: Save for later & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        toggleWishlist(item.productId);
                        removeFromCart(item.productId);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                      title="Save for Later"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary & Coupon Engine */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Code Input */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Coupons & Offers
              </h3>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 font-mono">
                      {appliedCoupon}
                    </span>
                    <p className="text-[10px] text-emerald-700">
                      Applied! You saved ₹{couponDiscount}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeCouponCode}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (PAIGAM10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:border-amber-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
                >
                  {isApplying ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick Coupon Suggestions */}
            {!appliedCoupon && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyCouponCode('PAIGAM10')}
                  className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded hover:bg-amber-100"
                >
                  PAIGAM10 (10% Off)
                </button>
                <button
                  type="button"
                  onClick={() => applyCouponCode('FIRSTBUY')}
                  className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-100"
                >
                  FIRSTBUY (₹150 Off)
                </button>
              </div>
            )}
          </div>

          {/* Price Breakdown Bill */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Price Details ({cart.length} item{cart.length > 1 ? 's' : ''})
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span className="font-mono">₹{totalMrp.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Product Discount</span>
                <span className="font-mono">-₹{(totalMrp - subtotal).toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span className="font-mono">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-mono">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Total Amount</span>
                <span className="text-[10px] text-slate-400">Inclusive of GST</span>
              </div>
              <span className="text-xl font-black text-slate-900 font-mono">
                ₹{finalPayable.toLocaleString('en-IN')}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold text-center border border-emerald-200">
                You will save ₹{totalSavings.toLocaleString('en-IN')} on this order! 🎉
              </div>
            )}

            <button
              onClick={() => setCurrentView('checkout')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Safe & Secure Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
};
