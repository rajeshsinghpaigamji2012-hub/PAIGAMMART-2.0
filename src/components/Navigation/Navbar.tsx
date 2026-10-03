import React, { useState } from 'react';
import { Logo } from '../Branding/Logo';
import { useApp } from '../../context/AppContext';
import { LocationModal } from './LocationModal';
import {
  Search,
  ShoppingCart,
  Heart,
  MapPin,
  Mic,
  Store,
  Shield,
  User,
  Bell,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenSellerRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onOpenSellerRegister,
}) => {
  const {
    currentView,
    setCurrentView,
    activeRole,
    setActiveRole,
    cart,
    wishlist,
    deliveryPincode,
    deliveryCity,
    searchQuery,
    setSearchQuery,
    refreshProducts,
    notifications,
    showToast,
  } = useApp();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshProducts();
    if (currentView !== 'home') {
      setCurrentView('home');
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        setIsVoiceListening(true);
        showToast('Listening... Speak now (e.g. "Chanderi Saree" or "Brass Coffee Maker")', 'info');

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          setIsVoiceListening(false);
          refreshProducts();
          if (currentView !== 'home') setCurrentView('home');
        };

        recognition.onerror = () => {
          setIsVoiceListening(false);
          showToast('Voice input unavailable. Please type your search.', 'info');
        };

        recognition.onend = () => {
          setIsVoiceListening(false);
        };

        recognition.start();
      } catch {
        setIsVoiceListening(false);
        showToast('Voice search not supported on this browser', 'info');
      }
    } else {
      showToast('Voice recognition not supported by browser', 'info');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* TOP BAR CONTRACT: Zone 1 (Brand) - Zone 2 (4-6 links) - Zone 3 (1-2 primary actions) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center text-left focus:outline-hidden"
          >
            <Logo size="md" showTagline={false} />
          </button>

          {/* Zone 2: 4-6 Nav Links (Single line, text with subtle hover) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setCurrentView('home')}
              className={`transition-colors whitespace-nowrap hover:text-amber-600 ${
                currentView === 'home' && activeRole === 'customer' ? 'text-amber-600' : ''
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => {
                setActiveRole('customer');
                setCurrentView('home');
              }}
              className="transition-colors whitespace-nowrap hover:text-amber-600"
            >
              Handcrafted Artisans
            </button>
            <button
              onClick={() => {
                setActiveRole('customer');
                setCurrentView('orders');
              }}
              className={`transition-colors whitespace-nowrap hover:text-amber-600 ${
                currentView === 'orders' ? 'text-amber-600' : ''
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => {
                setActiveRole('seller');
                setCurrentView('seller_dashboard');
              }}
              className={`transition-colors whitespace-nowrap hover:text-amber-600 ${
                activeRole === 'seller' ? 'text-amber-600' : ''
              }`}
            >
              Seller Hub
            </button>
            <button
              onClick={() => {
                setActiveRole('admin');
                setCurrentView('admin_panel');
              }}
              className={`transition-colors whitespace-nowrap hover:text-amber-600 ${
                activeRole === 'admin' ? 'text-amber-600' : ''
              }`}
            >
              Admin Console
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                setActiveRole('customer');
                setCurrentView('profile');
              }}
              className="relative hidden sm:flex p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Action */}
            <button
              onClick={() => {
                setActiveRole('customer');
                setCurrentView('cart');
              }}
              className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-xs shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-slate-900 text-white text-[11px] font-mono px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MARKETPLACE UTILITY ROW: Search + Location Selector + Become a Seller CTA */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
            {/* Left: Location Pin selector */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <button
                type="button"
                onClick={() => setIsLocationOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-amber-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate max-w-[170px]">
                  Deliver to <strong className="text-slate-900">{deliveryCity}</strong> ({deliveryPincode})
                </span>
              </button>

              {/* Become a Seller Link */}
              <button
                type="button"
                onClick={onOpenSellerRegister}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Become a Seller</span>
              </button>
            </div>

            {/* Middle: Universal Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full md:max-w-lg flex items-center"
            >
              <input
                type="text"
                placeholder="Search Sarees, Brass Kaapi Sets, Leather Bags, Spices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-xl border border-slate-300 pl-9 pr-16 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    refreshProducts();
                  }}
                  className="absolute right-9 text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-2 p-1 rounded-md text-slate-500 hover:text-amber-600 transition-colors ${
                  isVoiceListening ? 'text-rose-600 animate-pulse bg-rose-50' : ''
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </form>

            {/* Right: Quick Role Switcher (Customer / Seller / Admin) */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs shrink-0 self-end md:self-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-1.5 hidden sm:inline">
                Role:
              </span>
              <button
                onClick={() => {
                  setActiveRole('customer');
                  setCurrentView('home');
                }}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  activeRole === 'customer'
                    ? 'bg-amber-500 text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  setActiveRole('seller');
                  setCurrentView('seller_dashboard');
                }}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  activeRole === 'seller'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Seller (5%)
              </button>
              <button
                onClick={() => {
                  setActiveRole('admin');
                  setCurrentView('admin_panel');
                }}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  activeRole === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Indian PIN / City Selector Modal */}
      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </>
  );
};
