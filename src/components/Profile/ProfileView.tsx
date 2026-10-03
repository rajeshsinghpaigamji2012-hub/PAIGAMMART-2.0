import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  MapPin,
  Heart,
  Package,
  ShieldCheck,
  Store,
  Plus,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  Lock,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    wishlist,
    products,
    openProduct,
    addToCart,
    toggleWishlist,
    setCurrentView,
    setActiveRole,
    addAddress,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wishlist'>('wishlist');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Address inputs
  const [newFullName, setNewFullName] = useState(user.name);
  const [newPhone, setNewPhone] = useState(user.phone);
  const [newPin, setNewPin] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('Mumbai');
  const [newState, setNewState] = useState('Maharashtra');

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || !newLine1) {
      showToast('Address and PIN are required', 'error');
      return;
    }
    addAddress({
      fullName: newFullName,
      phone: newPhone,
      pincode: newPin,
      addressLine1: newLine1,
      city: newCity,
      state: newState,
      addressType: 'home',
      isDefault: false,
    });
    setIsAddingAddress(false);
    setNewLine1('');
    setNewPin('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5" /> {user.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveRole('seller');
              setCurrentView('seller_dashboard');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Switch to Seller</span>
          </button>
        </div>
      </div>

      {/* TABS: Wishlist | Addresses | Profile Info */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'wishlist'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Wishlist ({wishlistedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({user.savedAddresses.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 mt-1">
                Save items you like to track prices and buy anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
                >
                  <div
                    onClick={() => openProduct(p.id)}
                    className="cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full aspect-4/3 object-cover rounded-xl mb-3 border border-slate-100"
                    />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                      {p.brand}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{p.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">
                        {p.discountPercent}% OFF
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-3 rounded-xl text-xs transition-colors shadow-2xs text-center"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Your Delivery Addresses</h3>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Address
              </button>
            )}
          </div>

          {isAddingAddress && (
            <form onSubmit={handleSaveAddress} className="p-5 bg-white border-2 border-amber-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Add New Delivery Location</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 text-xs"
                  required
                />
                <input
                  type="tel"
                  placeholder="10-Digit Mobile"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 text-xs font-mono"
                  required
                />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-Digit PIN Code"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="rounded-xl border border-slate-300 p-2 text-xs font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 text-xs"
                  required
                />
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="House / Flat No, Street, Landmark"
                    value={newLine1}
                    onChange={(e) => setNewLine1(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.savedAddresses.map((addr) => (
              <div key={addr.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {addr.addressType}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{addr.addressLine1}</p>
                <p className="text-xs text-slate-700 font-semibold">
                  {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                </p>
                <p className="text-xs text-slate-500 font-mono">📱 {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
