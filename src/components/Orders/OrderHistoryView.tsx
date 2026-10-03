import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, ChevronRight, Truck, CheckCircle2, RotateCcw, Clock, ArrowLeft } from 'lucide-react';
import { OrderStatus } from '../../types';

export const OrderHistoryView: React.FC = () => {
  const { orders, openOrderTracking, setCurrentView } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') {
      return o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled';
    }
    if (filter === 'delivered') return o.orderStatus === 'delivered';
    if (filter === 'cancelled') return o.orderStatus === 'cancelled';
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
            Cancelled
          </span>
        );
      case 'return_requested':
      case 'returned':
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <RotateCcw className="w-3.5 h-3.5" /> {status.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" /> {status.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500">Track packages, download invoices, request returns</p>
        </div>

        {/* Filter segment tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['all', 'active', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1">Explore the marketplace to place your first order.</p>
          <button
            onClick={() => setCurrentView('home')}
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => openOrderTracking(order.id)}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
            >
              {/* Order Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    Placed on {new Date(order.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Items Summary */}
              <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {order.items.map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  ))}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {order.items[0]?.title}
                      {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} total items · Paid via {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Total Amount
                    </span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl transition-colors">
                    <span>Track Order</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
