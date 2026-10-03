import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Store, X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface SellerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SellerRegisterModal: React.FC<SellerRegisterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, refreshSellers, setActiveRole, setCurrentView, showToast } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [legalEntityName, setLegalEntityName] = useState('');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [category, setCategory] = useState('Ethnic Wear & Sarees');
  const [businessAddress, setBusinessAddress] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      showToast('Please accept the Seller Agreement & 5% Platform Fee terms', 'error');
      return;
    }
    if (!panNumber || panNumber.length !== 10) {
      showToast('Enter valid 10-digit PAN (e.g. ABCDE1234F)', 'error');
      return;
    }
    if (!bankAccountNumber || !bankIfscCode) {
      showToast('Enter complete bank settlement details', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.registerSeller({
        businessName,
        legalEntityName,
        email,
        phone,
        category,
        businessAddress,
        panNumber: panNumber.toUpperCase(),
        gstNumber: gstNumber.toUpperCase(),
        bankAccountName,
        bankAccountNumber,
        bankIfscCode: bankIfscCode.toUpperCase(),
        bankName,
        upiId,
      });

      await refreshSellers();
      showToast('Seller application submitted! Admin will verify KYC.', 'success');
      setIsSubmitting(false);
      onClose();
      setActiveRole('seller');
      setCurrentView('seller_dashboard');
    } catch {
      setIsSubmitting(false);
      showToast('Failed to register seller', 'error');
    }
  };

  const handleFillDemo = () => {
    setBusinessName('Jaipur Blue Pottery Crafts');
    setLegalEntityName('Jaipur Ceramic Guild LLP');
    setCategory('Traditional Handcrafts & Brass');
    setBusinessAddress('Plot 12, Sanganer Artisan Zone, Jaipur, Rajasthan - 302029');
    setPanNumber('AAACJ9988K');
    setGstNumber('08AAACJ9988K1Z5');
    setBankAccountName('Jaipur Ceramic Guild LLP');
    setBankAccountNumber('5010098234123');
    setBankIfscCode('HDFC0001234');
    setBankName('HDFC Bank');
    setUpiId('jaipurpottery@okhdfcbank');
    setAgreedTerms(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Become a PaigamMart Seller</h3>
              <p className="text-xs text-slate-500">Sell Pan-India with flat 5% platform commission</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[10px] text-indigo-700 bg-indigo-100 hover:bg-indigo-200 font-bold px-2 py-1 rounded-md"
            >
              Fill Sample KYC
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 5% Marketplace banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>5% Transparent Marketplace Commission:</strong> You retain 95% of every product sale. Direct bank transfer on delivery confirmation.
            </span>
          </div>

          {/* Business Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. Shop & Business Identity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Shop / Business Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varanasi Silk Emporium"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Legal Entity / Registered Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varanasi Silk Pvt Ltd"
                  value={legalEntityName}
                  onChange={(e) => setLegalEntityName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Product Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="Ethnic Wear & Sarees">Ethnic Wear & Sarees</option>
                  <option value="Traditional Handcrafts & Brass">Traditional Handcrafts & Brass</option>
                  <option value="Leather & Accessories">Leather & Accessories</option>
                  <option value="Gourmet, Spices & Dry Fruits">Gourmet, Spices & Dry Fruits</option>
                  <option value="Home Decor & Pottery">Home Decor & Pottery</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Registered Business Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full office/shop address with city, state & pincode"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Statutory Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. KYC & Statutory Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Permanent Account Number (PAN) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="AAACV1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  GSTIN (If Applicable)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="09AAACV1234F1Z8"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Bank Settlement Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Bank Settlement & Payout Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Account Beneficiary Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="As per bank passbook"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India / HDFC"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50100492817263"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Bank IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="e.g. SBIN0001234"
                  value={bankIfscCode}
                  onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono uppercase"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Seller UPI ID for Instant Settlements (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. myshop@oksbi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I hereby declare that the PAN, GST, and bank account information provided is authentic. I accept the PaigamMart Seller Terms of Service and agree to the 5% platform commission policy.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
            >
              {isSubmitting ? 'Registering Seller...' : 'Submit Seller Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
