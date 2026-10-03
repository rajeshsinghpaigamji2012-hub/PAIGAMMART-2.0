import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerProfile, Order, Product, CommissionTransaction, Coupon } from '../../types';
import { api } from '../../services/api';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Store,
  Package,
  Percent,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Tag,
  Settings,
  Lock,
  Plus,
  Trash2,
  Eye,
  Check,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { products, showToast, refreshProducts, refreshOrders } = useApp();

  const [activeTab, setActiveTab] = useState<
    'metrics' | 'sellers' | 'orders' | 'commissions' | 'products' | 'coupons' | 'settings'
  >('metrics');

  const [metrics, setMetrics] = useState<any>({
    totalOrders: 0,
    grossGMV: 0,
    total5PercentCommission: 0,
    totalSellerDisbursed: 0,
    activeSellers: 0,
    pendingKycCount: 0,
    platformUpiAccount: '7880265898@ybl',
  });

  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<CommissionTransaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Create coupon form state
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState('15');
  const [newCouponMin, setNewCouponMin] = useState('999');

  const loadAdminData = async () => {
    const m = await api.getAdminMetrics();
    setMetrics(m);
    const s = await api.getSellers();
    setSellers(s);
    const o = await api.getOrders();
    setOrders(o);
    const c = await api.getCommissions();
    setCommissions(c);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleKycAction = async (sellerId: string, status: 'verified' | 'rejected', isApproved: boolean) => {
    await api.updateSellerKyc(sellerId, status, isApproved);
    await loadAdminData();
    showToast(`Seller KYC status updated to ${status.toUpperCase()}`, 'success');
  };

  const handleReturnAction = async (orderId: string, action: 'approve' | 'reject' | 'refund') => {
    await api.handleReturnAction(orderId, action);
    await loadAdminData();
    await refreshOrders();
    showToast(`Return request ${action}ed successfully`, 'success');
  };

  const handleSettleSeller = async (sellerId: string) => {
    await api.settleCommission(sellerId);
    await loadAdminData();
    showToast('Settlement disbursed to seller bank account', 'success');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newC: Coupon = {
      id: `coup_${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc || 'Promotional Discount Coupon',
      discountType: newCouponType,
      discountValue: Number(newCouponVal),
      minOrderValue: Number(newCouponMin),
      validUntil: '2026-12-31',
      usageLimit: 1000,
      timesUsed: 0,
      isActive: true,
    };
    setCoupons((prev) => [newC, ...prev]);
    setIsAddCouponOpen(false);
    setNewCouponCode('');
    showToast(`Coupon ${newC.code} activated!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
            PM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Admin Control Console</h1>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                Super Admin Access
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Governance, KYC verification, 5% commission accounts, seller settlements & dispute resolution
            </p>
          </div>
        </div>

        {/* Confidential Settlement Account Box */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="text-[10px] text-amber-700 uppercase font-bold block">
              Marketplace Settlement UPI (Confidential)
            </span>
            <span className="font-mono font-black text-slate-900 text-xs">
              {metrics.platformUpiAccount || '7880265898@ybl'}
            </span>
          </div>
        </div>
      </div>

      {/* TOP MARKETPLACE SCORECARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marketplace GMV */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Gross Marketplace Value (GMV)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{metrics.grossGMV?.toLocaleString('en-IN') || '0'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{orders.length} Total orders placed</p>
        </div>

        {/* 5% Platform Earnings */}
        <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-amber-900 text-xs mb-2">
            <span className="font-bold">5% Platform Earnings</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            ₹{metrics.total5PercentCommission?.toLocaleString('en-IN') || '0'}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Direct PaigamMart commission pool</p>
        </div>

        {/* Active Sellers */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Verified Sellers</span>
            <Store className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {sellers.filter((s) => s.isApproved).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 12 Indian states</p>
        </div>

        {/* Pending KYC Reviews */}
        <div className="p-5 bg-rose-50/40 border border-rose-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-rose-900 text-xs mb-2">
            <span className="font-bold">Pending KYC Verifications</span>
            <ShieldCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 font-mono">
            {sellers.filter((s) => s.kyc.status === 'pending').length}
          </div>
          <p className="text-[11px] text-rose-700 mt-1">Requires PAN & GST check</p>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'metrics', label: 'Dashboard Overview' },
          { id: 'sellers', label: `Sellers & KYC (${sellers.length})` },
          { id: 'orders', label: `Orders & Returns (${orders.length})` },
          { id: 'commissions', label: '5% Commission Ledger' },
          { id: 'products', label: `Catalog (${products.length})` },
          { id: 'coupons', label: 'Coupons & Promos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: METRICS OVERVIEW */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Commission Architecture Rules
            </h3>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong>Platform Commission Rate:</strong> Flat 5% deducted on applicable seller sale amount.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong>Configured Platform UPI ID:</strong>{' '}
                <span className="font-mono font-bold text-slate-900">7880265898@ybl</span> (Protected from public inspection).
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong>Seller Payout Model:</strong> 95% net settlement via NEFT/RTGS/UPI upon confirmed delivery.
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Marketplace Operations Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Live Products</span>
                <span className="font-bold text-slate-900">{products.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Delivered Orders</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {orders.filter((o) => o.orderStatus === 'delivered').length}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Return Requests</span>
                <span className="font-bold text-amber-600 font-mono">
                  {orders.filter((o) => o.orderStatus === 'return_requested').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SELLERS & KYC APPROVALS */}
      {activeTab === 'sellers' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Seller KYC Applications & Verification
          </h3>

          <div className="divide-y divide-slate-100">
            {sellers.map((s) => (
              <div key={s.id} className="py-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{s.businessName}</h4>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          s.kyc.status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.kyc.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.legalEntityName} · Category: {s.category} · Phone: {s.phone}
                    </p>
                  </div>

                  {/* KYC Action Buttons */}
                  <div className="flex items-center gap-2">
                    {s.kyc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleKycAction(s.id, 'verified', true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve KYC
                        </button>
                        <button
                          onClick={() => handleKycAction(s.id, 'rejected', false)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {s.pendingSettlement > 0 && (
                      <button
                        onClick={() => handleSettleSeller(s.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                      >
                        Disburse ₹{s.pendingSettlement.toLocaleString('en-IN')}
                      </button>
                    )}
                  </div>
                </div>

                {/* KYC & Bank Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-[11px] text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-500 block">PAN Details:</span>
                    <span className="font-mono font-bold text-slate-900">{s.kyc.panNumber}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">GSTIN:</span>
                    <span className="font-mono text-slate-900">{s.kyc.gstNumber || 'Not Required'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Bank Account:</span>
                    <span className="font-mono text-slate-900">
                      {s.kyc.bankName} ({s.kyc.bankAccountNumber})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & RETURNS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            All Marketplace Orders & Dispute Approvals
          </h3>

          <div className="divide-y divide-slate-100">
            {orders.map((o) => (
              <div key={o.id} className="py-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      #{o.orderNumber}
                    </span>
                    <span className="text-slate-500 ml-2">
                      Customer: {o.customerName} · Total: ₹{o.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {o.orderStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Return request handler for Admin */}
                {o.returnRequest && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-900">
                        Return Requested: {o.returnRequest.reason}
                      </span>
                      <p className="text-[11px] text-amber-700">
                        Refund Amount: ₹{o.returnRequest.refundAmount.toLocaleString('en-IN')} · Status: {o.returnRequest.status}
                      </p>
                    </div>
                    {o.returnRequest.status === 'requested' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReturnAction(o.id, 'approve')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                        >
                          Approve Pickup
                        </button>
                        <button
                          onClick={() => handleReturnAction(o.id, 'refund')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                        >
                          Issue Refund
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 5% COMMISSION LEDGER */}
      {activeTab === 'commissions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Complete Marketplace 5% Commission Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Automated 5% platform deductions calculated on every successful transaction.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Seller Business</th>
                  <th className="py-3 px-3">Gross Sale</th>
                  <th className="py-3 px-3">5% PaigamMart Pool</th>
                  <th className="py-3 px-3">Seller Share (95%)</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      #{c.orderNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {c.sellerBusinessName}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-900">
                      ₹{c.grossAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-700">
                      +₹{c.commissionAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      ₹{c.netSellerAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-500">
                      {c.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            All Marketplace Products ({products.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-3 border border-slate-200 rounded-xl flex gap-3 text-xs">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{p.title}</h4>
                  <p className="text-[10px] text-slate-500">{p.sellerBusinessName}</p>
                  <p className="font-mono font-bold text-slate-900 mt-1">
                    ₹{p.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COUPONS MANAGER */}
      {activeTab === 'coupons' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Promo Coupons
            </h3>
            <button
              onClick={() => setIsAddCouponOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['PAIGAM10', 'FIRSTBUY', 'FESTIVE500'].map((code) => (
              <div key={code} className="p-4 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/40">
                <span className="font-mono font-black text-amber-900 text-sm">{code}</span>
                <p className="text-[11px] text-amber-700 mt-1">Instant discount code verified active</p>
              </div>
            ))}
          </div>

          {isAddCouponOpen && (
            <form onSubmit={handleCreateCoupon} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">New Promo Code</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. DIWALI25)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="rounded-xl border border-slate-300 p-2 text-xs font-mono uppercase"
                  required
                />
                <input
                  type="number"
                  placeholder="Discount Value"
                  value={newCouponVal}
                  onChange={(e) => setNewCouponVal(e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 text-xs font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-xl text-xs"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
