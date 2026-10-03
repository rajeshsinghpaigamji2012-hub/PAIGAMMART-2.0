import React from 'react';
import { Logo } from './Branding/Logo';
import { ShieldCheck, Truck, Percent, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView, setActiveRole, setSelectedCategory } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Upper Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">5% Flat Commission</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Transparent marketplace structure for Indian sellers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Handcrafted</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Authentic silk weaves, brassware & artisan GI tags
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fast Pan-India Logistics</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                BlueDart, Delhivery & Speed Post with live tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Toll-Free Support</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                1800 200 8899 (9 AM - 9 PM)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-500/40 bg-white">
                <img
                  src="/src/assets/images/paigammart_logo_1791034633661.jpg"
                  alt="PaigamMart"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Paigam<span className="text-amber-500">Mart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              PaigamMart is India's premier multi-vendor marketplace connecting authentic master weavers, brass coppersmiths, leather guilds, and agricultural organic producers with discerning customers across India.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span>Bharat Ka Apna Marketplace</span>
              <span>·</span>
              <span>Made in India 🇮🇳</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Ethnic Wear & Sarees');
                    setCurrentView('home');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Chanderi & Banarasi Sarees
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Traditional Handcrafts & Brass');
                    setCurrentView('home');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Kumbakonam Brass & Kaapi Sets
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Leather & Accessories');
                    setCurrentView('home');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Jodhpur Leathercraft Bags
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Gourmet, Spices & Dry Fruits');
                    setCurrentView('home');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Himalayan Saffron & Spices
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              For Sellers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setActiveRole('seller');
                    setCurrentView('seller_dashboard');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Seller Dashboard & Fulfillment
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveRole('seller');
                    setCurrentView('seller_dashboard');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  5% Commission Ledger
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveRole('seller');
                    setCurrentView('seller_dashboard');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Instant Bank Settlement
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveRole('admin');
                    setCurrentView('admin_panel');
                  }}
                  className="hover:text-amber-400 transition-colors text-amber-500 font-semibold"
                >
                  Admin Control Panel
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@paigammart.in</span>
              </li>
              <li className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+91 1800 200 8899</span>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Track Existing Orders
                </button>
              </li>
              <li>
                <span className="text-slate-500">7-Day Easy Replacement Policy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 PaigamMart Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Seller Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
