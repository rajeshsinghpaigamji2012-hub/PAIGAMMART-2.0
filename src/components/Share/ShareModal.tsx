import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShareModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, onClose }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  // Construct direct deep link
  const deepLink = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
  const shareTitle = `Buy ${product.title} on PaigamMart`;
  const shareText = `Check out "${product.title}" on PaigamMart at ₹${product.price.toLocaleString('en-IN')} (${product.discountPercent}% OFF). 100% Genuine Indian Marketplace!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      showToast('Product link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Unable to copy link', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: deepLink,
        });
        showToast('Shared successfully!', 'success');
        onClose();
      } catch (err) {
        // User cancelled or aborted
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${deepLink}`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share Product</h3>
              <p className="text-xs text-slate-500">Share with family & friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="mt-4 flex gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-200"
          />
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
              {product.title}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                {product.discountPercent}% OFF
              </span>
            </div>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-emerald-600 mb-1" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </button>

          <button
            onClick={handleTelegram}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors"
          >
            <Send className="w-6 h-6 text-sky-600 mb-1" />
            <span className="text-xs font-semibold">Telegram</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition-colors"
          >
            <Share2 className="w-6 h-6 text-indigo-600 mb-1" />
            <span className="text-xs font-semibold">System Share</span>
          </button>
        </div>

        {/* Deep Link URL with One-Click Copy */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            PaigamMart Deep Link (Opens direct in app)
          </label>
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1.5 pl-3">
            <input
              type="text"
              readOnly
              value={deepLink}
              className="bg-transparent text-xs text-slate-600 w-full focus:outline-hidden font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
