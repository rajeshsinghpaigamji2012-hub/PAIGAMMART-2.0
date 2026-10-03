import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Sparkles, ShieldCheck, Truck, Percent } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 1600,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-white via-amber-50/40 to-slate-50 flex flex-col items-center justify-between p-8 antialiased">
      <div className="w-full flex justify-end">
        <button
          onClick={onComplete}
          className="text-xs text-slate-400 hover:text-slate-700 px-3 py-1.5 transition-colors font-medium rounded-full border border-slate-200"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-200 bg-white p-1">
            <img
              src="/src/assets/images/paigammart_logo_1791034633661.jpg"
              alt="PaigamMart"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full p-1.5 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Paigam<span className="text-amber-600">Mart</span>
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-1">
          Bharat Ka Apna Trusted Marketplace
        </p>

        {/* Feature Pills */}
        <div className="flex items-center gap-3 mt-8 text-[11px] font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Genuine</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <Percent className="w-3.5 h-3.5 text-amber-600" />
            <span>5% Commission</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fast Express</span>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400 font-medium">
          Verified Indian Sellers · Pan-India Delivery
        </p>
      </div>
    </div>
  );
};
