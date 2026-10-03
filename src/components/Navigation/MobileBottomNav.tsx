import React from 'react';
import { Home, Grid, Heart, Package, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, setActiveRole, wishlist, orders } = useApp();

  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  ).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3">
      <div className="flex items-center justify-around">
        <button
          onClick={() => {
            setActiveRole('customer');
            setCurrentView('home');
          }}
          className={`flex flex-col items-center py-1 px-2 transition-colors ${
            currentView === 'home' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveRole('customer');
            setCurrentView('home');
            // scroll to category list
            const el = document.getElementById('categories-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center py-1 px-2 text-slate-500 hover:text-amber-600 transition-colors"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Categories</span>
        </button>

        <button
          onClick={() => {
            setActiveRole('customer');
            setCurrentView('profile');
          }}
          className="relative flex flex-col items-center py-1 px-2 text-slate-500 hover:text-amber-600 transition-colors"
        >
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Wishlist</span>
        </button>

        <button
          onClick={() => {
            setActiveRole('customer');
            setCurrentView('orders');
          }}
          className={`relative flex flex-col items-center py-1 px-2 transition-colors ${
            currentView === 'orders' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Package className="w-5 h-5" />
          {activeOrdersCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeOrdersCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Orders</span>
        </button>

        <button
          onClick={() => {
            setActiveRole('customer');
            setCurrentView('profile');
          }}
          className={`flex flex-col items-center py-1 px-2 transition-colors ${
            currentView === 'profile' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );
};
