import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerProfile, Order, Product, CommissionTransaction } from '../../types';
import { api } from '../../services/api';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  Percent,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowUpRight,
  X,
  CreditCard,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { currentSeller, refreshProducts, products, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'commissions' | 'kyc'>('overview');

  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [sellerCommissions, setSellerCommissions] = useState<CommissionTransaction[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState(currentSeller?.businessName || 'Artisan Goods');
  const [newCategory, setNewCategory] = useState(currentSeller?.category || 'Ethnic Wear & Sarees');
  const [newDescription, setNewDescription] = useState('');
  const [newMrp, setNewMrp] = useState('2999');
  const [newPrice, setNewPrice] = useState('1699');
  const [newStock, setNewStock] = useState('15');
  const [newSku, setNewSku] = useState('');
  const [newImage, setNewImage] = useState('/src/assets/images/product_chanderi_saree_1791034659208.jpg');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Dispatch modal
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [courierName, setCourierName] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  const seller = currentSeller;

  const loadSellerData = async () => {
    if (!seller) return;
    const orders = await api.getOrders({ sellerId: seller.id });
    setSellerOrders(orders);
    const comms = await api.getCommissions(seller.id);
    setSellerCommissions(comms);
  };

  useEffect(() => {
    loadSellerData();
  }, [seller]);

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Loading seller dashboard...
      </div>
    );
  }

  const sellerProducts = products.filter((p) => p.sellerId === seller.id);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Product title is required', 'error');
      return;
    }
    setIsSubmittingProduct(true);
    await api.addProduct({
      sellerId: seller.id,
      sellerBusinessName: seller.businessName,
      title: newTitle,
      brand: newBrand,
      category: newCategory,
      description: newDescription,
      mrp: Number(newMrp),
      price: Number(newPrice),
      stock: Number(newStock),
      sku: newSku || `SKU-${Date.now().toString().slice(-6)}`,
      images: [newImage],
    });
    await refreshProducts();
    setIsSubmittingProduct(false);
    setIsAddProductOpen(false);
    setNewTitle('');
    setNewDescription('');
    showToast('Product published to PaigamMart catalog! 🚀', 'success');
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await api.updateOrderStatus(orderId, status, courierName, trackingNumber || `BD-${Date.now().toString().slice(-8)}`);
    await loadSellerData();
    setDispatchOrderId(null);
    showToast(`Order status updated to ${status.toUpperCase()}`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">
      {/* Top Seller Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
            {seller.businessName.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{seller.businessName}</h1>
              {seller.isApproved ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  KYC Pending Approval
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {seller.category} · {seller.rating}★ ({seller.totalRatingsCount} ratings) · Member since {seller.joinedDate}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* 5% COMMISSION & REVENUE SCOREBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Gross Sales</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{seller.grossSales.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total revenue generated</p>
        </div>

        {/* 5% Platform Commission Deducted */}
        <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-amber-900 text-xs mb-2">
            <span className="font-bold">5% Platform Commission</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            ₹{seller.platformCommissionDeducted.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Automatic 5% PaigamMart fee</p>
        </div>

        {/* Net Seller Earnings (95%) */}
        <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-emerald-900 text-xs mb-2">
            <span className="font-bold">Net Earnings (95%)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 font-mono">
            ₹{seller.netEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Your pure settlement share</p>
        </div>

        {/* Pending Settlement */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Pending Settlement</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{seller.pendingSettlement.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct bank payout cycle</p>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'orders', label: `Manage Orders (${sellerOrders.length})` },
          { id: 'products', label: `My Products (${sellerProducts.length})` },
          { id: 'commissions', label: '5% Commission Ledger' },
          { id: 'kyc', label: 'KYC & Banking Profile' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Recent Marketplace Orders
            </h3>
            {sellerOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No orders received yet</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {sellerOrders.slice(0, 3).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 font-mono">#{o.orderNumber}</span>
                      <p className="text-[11px] text-slate-500">{o.items[0]?.title}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-slate-900">
                        ₹{o.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                        {o.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {sellerOrders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400">No customer orders assigned to your shop</p>
            </div>
          ) : (
            sellerOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div>
                    <span className="font-bold font-mono text-slate-900">#{ord.orderNumber}</span>
                    <span className="text-slate-400 ml-2">
                      Customer: {ord.customerName} (📱 {ord.customerPhone})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                    <span className="font-bold font-mono text-slate-900">
                      Sale: ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">
                      Ship to: {ord.shippingAddress.addressLine1}, {ord.shippingAddress.city} ({ord.shippingAddress.pincode})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Items: {ord.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                    </p>
                  </div>

                  {/* Dispatch / Update actions */}
                  <div className="flex items-center gap-2">
                    {ord.orderStatus === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'packed')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                      >
                        Mark as Packed
                      </button>
                    )}

                    {ord.orderStatus === 'packed' && (
                      <button
                        onClick={() => setDispatchOrderId(ord.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch & Ship</span>
                      </button>
                    )}

                    {ord.orderStatus === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              Active Store Catalog ({sellerProducts.length})
            </h3>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellerProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-36 object-cover rounded-xl mb-3 border border-slate-100"
                  />
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                    {p.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-mono">
                      ₹{p.mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {p.discountPercent}% OFF
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>Stock: {p.stock} units</span>
                    <span className="font-mono text-slate-400">{p.sku}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold text-[11px]">● Active</span>
                  <span className="text-slate-400 text-[10px]">PaigamMart Live</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 5% COMMISSION & SETTLEMENT LEDGER */}
      {activeTab === 'commissions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5% Platform Commission & Bank Settlement Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of order-by-order 5% platform deductions and your net payable disbursement.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Gross Sale</th>
                  <th className="py-3 px-3">5% PaigamMart Fee</th>
                  <th className="py-3 px-3">Net Seller Payable (95%)</th>
                  <th className="py-3 px-3">Settlement Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerCommissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      #{comm.orderNumber}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      ₹{comm.grossAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-700">
                      -₹{comm.commissionAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-700">
                      ₹{comm.netSellerAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          comm.status === 'settled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {comm.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(comm.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: KYC & SHOP PROFILE */}
      {activeTab === 'kyc' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Seller KYC & Bank Settlement Records
              </h3>
              <p className="text-xs text-slate-500">Government regulatory & banking credentials</p>
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                seller.kyc.status === 'verified'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              KYC Status: {seller.kyc.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Statutory IDs</span>
              <p>
                <strong>PAN:</strong> <span className="font-mono">{seller.kyc.panNumber}</span>
              </p>
              {seller.kyc.gstNumber && (
                <p>
                  <strong>GSTIN:</strong>{' '}
                  <span className="font-mono">{seller.kyc.gstNumber}</span>
                </p>
              )}
              <p>
                <strong>Business Address:</strong> {seller.kyc.businessAddress}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Bank Settlement Account
              </span>
              <p>
                <strong>Beneficiary:</strong> {seller.kyc.bankAccountName}
              </p>
              <p>
                <strong>Bank:</strong> {seller.kyc.bankName}
              </p>
              <p>
                <strong>Account No:</strong>{' '}
                <span className="font-mono">{seller.kyc.bankAccountNumber}</span>
              </p>
              <p>
                <strong>IFSC Code:</strong>{' '}
                <span className="font-mono">{seller.kyc.bankIfscCode}</span>
              </p>
              {seller.kyc.upiId && (
                <p>
                  <strong>Settlement UPI:</strong>{' '}
                  <span className="font-mono">{seller.kyc.upiId}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Ship & Dispatch Package</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Courier Partner:
              </label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="BlueDart Express India">BlueDart Express India</option>
                <option value="Delhivery Surface Logistics">Delhivery Surface Logistics</option>
                <option value="DTDC Courier">DTDC Courier</option>
                <option value="India Post Speed Post">India Post Speed Post</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AWB / Tracking Number:
              </label>
              <input
                type="text"
                placeholder="e.g. BD-99120485"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDispatchOrderId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(dispatchOrderId, 'shipped')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateProduct}
            className="w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add Product to Store</h3>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handcrafted Pure Silk Dupatta"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Ethnic Wear & Sarees">Ethnic Wear & Sarees</option>
                    <option value="Traditional Handcrafts & Brass">Traditional Handcrafts & Brass</option>
                    <option value="Leather & Accessories">Leather & Accessories</option>
                    <option value="Gourmet, Spices & Dry Fruits">Gourmet, Spices & Dry Fruits</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe material, weave, craftsmanship and dimensions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Image Asset
                </label>
                <select
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="/src/assets/images/product_chanderi_saree_1791034659208.jpg">
                    Chanderi Silk Saree Studio Asset
                  </option>
                  <option value="/src/assets/images/product_brass_filter_coffee_1791034670597.jpg">
                    Brass Kaapi Maker Studio Asset
                  </option>
                  <option value="/src/assets/images/product_leather_messenger_1791034681503.jpg">
                    Artisanal Leather Messenger Asset
                  </option>
                  <option value="/src/assets/images/hero_marketplace_lifestyle_1791034646293.jpg">
                    Lifestyle Festive Apparel Asset
                  </option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors"
              >
                {isSubmittingProduct ? 'Saving...' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
