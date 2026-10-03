import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Address, PaymentMethod } from '../../types';
import { api } from '../../services/api';
import {
  MapPin,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  ArrowLeft,
  X,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    user,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    appliedCoupon,
    couponDiscount,
    clearCart,
    setCurrentView,
    openOrderTracking,
    showToast,
  } = useApp();

  // Checkout Steps: 1. Address, 2. Payment
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiVpa, setUpiVpa] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // New Address Form State
  const [newAddrFullName, setNewAddrFullName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('Maharashtra');

  // Simulated OTP / Verification Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('123456');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalMrp = cart.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const finalPayable = Math.max(0, subtotal - couponDiscount + deliveryFee);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <button
          onClick={() => setCurrentView('home')}
          className="mt-4 bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrFullName || !newAddrPhone || !newAddrPincode || !newAddrLine1) {
      showToast('Please fill all mandatory address fields', 'error');
      return;
    }
    const created: Omit<Address, 'id'> = {
      fullName: newAddrFullName,
      phone: newAddrPhone,
      pincode: newAddrPincode,
      addressLine1: newAddrLine1,
      city: newAddrCity || 'Mumbai',
      state: newAddrState,
      addressType: 'home',
      isDefault: false,
    };
    addAddress(created);
    setIsAddingAddress(false);
  };

  const initiatePayment = async () => {
    if (!selectedAddress) {
      showToast('Please select or add a delivery address', 'error');
      return;
    }

    if (selectedMethod === 'upi' && !upiVpa && !upiVpa.includes('@')) {
      // Default sample UPI if empty
      setUpiVpa('user@oksbi');
    }

    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        showToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
      setShowOtpModal(true);
      return;
    }

    // Process order directly for UPI, COD, NetBanking
    completeOrderProcess();
  };

  const completeOrderProcess = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order on server (Stock deduction + 5% platform commission pre-calculated)
      const orderPayload = {
        items: cart.map((i) => ({
          productId: i.productId,
          sellerId: i.product.sellerId,
          sellerBusinessName: i.product.sellerBusinessName,
          title: i.product.title,
          image: i.product.images[0],
          price: i.product.price,
          mrp: i.product.mrp,
          quantity: i.quantity,
          selectedVariant: i.size || i.color || '',
        })),
        shippingAddress: selectedAddress,
        paymentMethod: selectedMethod,
        appliedCouponCode: appliedCoupon || undefined,
      };

      const newOrder = await api.createOrder(orderPayload);

      // 2. Server-Side Payment Verification (never trust client blindly)
      const paymentDetails = {
        method: selectedMethod,
        upiVpa: selectedMethod === 'upi' ? upiVpa || 'instant_qr@upi' : undefined,
        cardLast4: selectedMethod === 'card' ? cardNumber.slice(-4) : undefined,
        bankName: selectedMethod === 'netbanking' ? selectedBank : undefined,
      };

      const verification = await api.verifyPayment(newOrder.id, selectedMethod, paymentDetails);

      if (verification.paymentStatus === 'paid') {
        showToast('Payment verified successfully! Order Confirmed 🎉', 'success');
        clearCart();
        setIsProcessing(false);
        setShowOtpModal(false);
        openOrderTracking(newOrder.id);
      } else {
        showToast('Payment verification pending or failed', 'error');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Error finalizing order. Please retry.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <button
          onClick={() => setCurrentView('cart')}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Secure Checkout</h1>
          <p className="text-xs text-slate-500">256-bit SSL encrypted Indian payment gateway</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 1. Address, 2. Payment Method */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: DELIVERY ADDRESS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Delivery Address
                </h3>
              </div>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            {!isAddingAddress ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.savedAddresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {addr.addressType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      </p>
                      <p className="text-xs text-slate-700 font-semibold mt-1">
                        {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">📱 {addr.phone}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Add New Address Form */
              <form onSubmit={handleSaveNewAddress} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">Add New Delivery Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Singh"
                      value={newAddrFullName}
                      onChange={(e) => setNewAddrFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 400050"
                      value={newAddrPincode}
                      onChange={(e) => setNewAddrPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Flat, House no., Building, Apartment *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Sea Pearl, Hill Road"
                      value={newAddrLine1}
                      onChange={(e) => setNewAddrLine1(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: PAYMENT SYSTEM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select Indian Payment Gateway
              </h3>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMethod === 'upi'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-xs">UPI (Instant)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="text-xs">Cards / RuPay</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMethod === 'netbanking'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs">Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('wallet')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMethod === 'wallet'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Wallet className="w-5 h-5 text-purple-600 mb-1" />
                <span className="text-xs">Wallets</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('cod')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                  selectedMethod === 'cod'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Truck className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-xs">Cash on Delivery</span>
              </button>
            </div>

            {/* Dynamic Payment Option Forms */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              {selectedMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Scan QR or Enter Virtual Payment Address (VPA)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Zero Surcharge
                    </span>
                  </div>

                  {/* Simulated Dynamic UPI QR */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="w-28 h-28 bg-slate-100 border border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                      <QrCode className="w-16 h-16 text-slate-800" />
                      <span className="text-[9px] font-bold text-slate-500 mt-1">BHIM UPI QR</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-slate-600">
                        Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app to pay ₹{finalPayable.toLocaleString('en-IN')}.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. mobile@upi / yourname@okhdfcbank"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setUpiVpa('rajesh@okhdfcbank')}
                          className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-2 rounded-lg font-bold hover:bg-amber-100 whitespace-nowrap"
                        >
                          Use Sample VPA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      Credit / Debit Card (RuPay, Visa, MasterCard)
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4532 8920 1192 4392"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                        setCardNumber(val);
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCardHolder('Rajesh Singh');
                      setCardNumber('4532 8920 1192 4392');
                      setCardExpiry('08/29');
                      setCardCvv('789');
                    }}
                    className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md font-semibold hover:bg-indigo-100"
                  >
                    Auto-Fill RuPay Test Card
                  </button>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    Choose from Popular Indian Banks:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          selectedBank === b
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'wallet' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Choose Mobile Wallet:
                  </span>
                  <div className="flex gap-2">
                    {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:border-amber-500"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'cod' && (
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery is available for this order</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pay safely with cash or any UPI QR code upon arrival at your doorstep. Please keep exact change ready.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Review & Place Order Button */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Order Items ({cart.length})
            </h3>

            {/* Items mini list */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {cart.map((i) => (
                <div key={i.productId} className="flex items-center gap-3 text-xs">
                  <img
                    src={i.product.images[0]}
                    alt={i.product.title}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{i.product.title}</p>
                    <p className="text-[10px] text-slate-500">Qty: {i.quantity}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{(i.product.price * i.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings</span>
                  <span className="font-mono">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-mono">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Platform Handling</span>
                <span>Included</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Total Payable</span>
                <span className="text-[10px] text-slate-400">All taxes included</span>
              </div>
              <span className="text-xl font-black text-slate-900 font-mono">
                ₹{finalPayable.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={initiatePayment}
              disabled={isProcessing}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {isProcessing ? (
                <span>Authorizing Payment...</span>
              ) : (
                <>
                  <span>
                    Pay ₹{finalPayable.toLocaleString('en-IN')} & Place Order
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center">
            🔒 By placing this order, you agree to PaigamMart's 7-Day Return Policy and Buyer Protection Guarantee.
          </div>
        </div>
      </div>

      {/* OTP Verification Modal for Card Payments */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Bank 3D-Secure OTP</h3>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter 6-digit OTP sent to registered mobile for card ending in{' '}
              <strong className="font-mono">...{cardNumber.slice(-4) || '4392'}</strong>
            </p>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full text-center text-lg font-mono tracking-widest font-bold py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block text-center">
                Demo OTP: 123456
              </span>
            </div>

            <button
              onClick={completeOrderProcess}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors"
            >
              {isProcessing ? 'Verifying Gateway...' : 'Verify & Authorize Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
