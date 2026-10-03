import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Sparkles,
  Zap,
  Star,
  ShieldCheck,
  TrendingUp,
  Percent,
  Truck,
  Heart,
  Share2,
  Clock,
  ArrowRight,
  ChevronRight,
  Eye,
  Store,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    products,
    openProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    setShareProduct,
    selectedCategory,
    setSelectedCategory,
    setCurrentView,
    setActiveRole,
  } = useApp();

  // Flash Sale Countdown Timer (simulated 4-hour countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    'All',
    'Ethnic Wear & Sarees',
    'Traditional Handcrafts & Brass',
    'Leather & Accessories',
    'Gourmet, Spices & Dry Fruits',
  ];

  // Filtered by active category selection
  const displayedProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const flashDeals = products.filter((p) => p.discountPercent >= 45).slice(0, 4);

  return (
    <div className="pb-16 space-y-10">
      {/* 1. HERO CAMPAIGN SHOWCASE */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 mt-4 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[380px]">
          {/* Text Content */}
          <div className="p-8 sm:p-12 lg:col-span-7 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Great Indian Heritage & Artisan Festival</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white balance">
              Authentic Indian Crafts, Direct from Verified Sellers
            </h1>

            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-lg leading-relaxed">
              Shop pure Chanderi silk, Kumbakonam bell-metal brassware, Jodhpur leather, and GI-tagged gourmet treasures with transparent 5% marketplace pricing.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 mt-6">
              <button
                onClick={() => {
                  const el = document.getElementById('marketplace-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 group"
              >
                <span>Shop Marketplace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setActiveRole('seller');
                  setCurrentView('seller_dashboard');
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Sell at 5% Commission</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex items-center gap-5 mt-8 pt-6 border-t border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Certified</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Free Delivery Above ₹499</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-indigo-400" />
                <span>Fair 5% Commission</span>
              </div>
            </div>
          </div>

          {/* Hero Lifestyle Photography */}
          <div className="relative h-64 sm:h-80 lg:h-full lg:col-span-5 overflow-hidden">
            <img
              src="/src/assets/images/hero_marketplace_lifestyle_1791034646293.jpg"
              alt="Indian Lifestyle Shopping"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-transparent lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SELECTOR STRIP */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs text-slate-500">Handpicked selections from master Indian artisans</p>
          </div>
        </div>

        {/* Clean segment buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS WITH COUNTDOWN */}
      {selectedCategory === 'All' && flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200/80 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    Flash Deals & Festive Specials
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Up to 50% OFF
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">Limited quantities directly from craft guilds</p>
                </div>
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-500 font-normal">Ends in:</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                :
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                :
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-rose-600">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Flash Deal Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashDeals.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between hover:shadow-md transition-shadow group relative"
                >
                  <div
                    onClick={() => openProduct(prod.id)}
                    className="cursor-pointer"
                  >
                    <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-2.5">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                        {prod.discountPercent}% OFF
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                      {prod.brand}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 min-h-[32px] group-hover:text-amber-600 transition-colors">
                      {prod.title}
                    </h4>

                    {/* Price and Stock */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{prod.mrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => addToCart(prod, 1)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-2xs text-center"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        wishlist.includes(prod.id)
                          ? 'border-rose-300 bg-rose-50 text-rose-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                      title="Wishlist"
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={wishlist.includes(prod.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. MAIN PRODUCT CATALOG GRID */}
      <section id="marketplace-catalog" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'Trending Marketplace Products' : selectedCategory}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{displayedProducts.length} Products</span>
              <span aria-hidden="true">·</span>
              <span>Direct Artisan Settlement</span>
              <span aria-hidden="true">·</span>
              <span>Fast Pan-India Delivery</span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid: 3-column desktop / 2-column mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Image & Quick Action Header */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => openProduct(product.id)}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.badge && (
                      <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {product.discountPercent}% OFF
                    </span>
                  </div>

                  {/* Top Right Actions: Wishlist & Share */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareProduct(product);
                      }}
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-sm transition-colors"
                      title="Share Product"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`p-2 rounded-xl bg-white/90 hover:bg-white shadow-sm transition-colors ${
                        isWishlisted ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                      }`}
                      title="Wishlist"
                    >
                      <Heart
                        className="w-3.5 h-3.5"
                        fill={isWishlisted ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div onClick={() => openProduct(product.id)} className="cursor-pointer">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold uppercase tracking-wider text-amber-600 text-[11px]">
                        {product.brand}
                      </span>
                      <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {product.title}
                    </h3>

                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                      <span>Sold by: {product.sellerBusinessName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-semibold">COD Available</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2.5 mt-3">
                      <span className="text-lg font-black text-slate-900 font-mono">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{product.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs transition-colors shadow-2xs text-center"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        setCurrentView('checkout');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors text-center"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. WHY PAIGAMMART TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-slate-900">
              Bharat's Modern Transparent Marketplace
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Built for Indian customers and grassroots merchants with genuine trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3">
                <Percent className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">5% Flat Commission</h4>
              <p className="text-xs text-slate-600 mt-1">
                Sellers keep 95% of sale earnings with automated bank settlement.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Verified Indian Sellers</h4>
              <p className="text-xs text-slate-600 mt-1">
                100% KYC verified sellers with PAN & GST registration checks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Express Delivery & COD</h4>
              <p className="text-xs text-slate-600 mt-1">
                Reliable BlueDart and Delhivery logistics with Cash on Delivery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Instant Customer Support</h4>
              <p className="text-xs text-slate-600 mt-1">
                Easy 7-day returns, fast refunds, and verified purchase reviews.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
