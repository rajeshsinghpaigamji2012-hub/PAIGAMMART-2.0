import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  RotateCcw,
  AlertTriangle,
  MapPin,
  CreditCard,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const OrderTrackingDetail: React.FC = () => {
  const { selectedOrderId, setCurrentView, openProduct, showToast, refreshOrders } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Return Request Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged/Defective item');
  const [returnDetails, setReturnDetails] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!selectedOrderId) return;
    setIsLoading(true);
    api.getOrders().then((all) => {
      const found = all.find((o) => o.id === selectedOrderId);
      if (found) setOrder(found);
      setIsLoading(false);
    });
  }, [selectedOrderId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Loading live tracking status...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h3 className="text-base font-bold text-slate-900">Order not found</h3>
        <button
          onClick={() => setCurrentView('orders')}
          className="mt-4 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReturn(true);
    const updated = await api.requestReturn(order.id, returnReason, returnDetails);
    if (updated) setOrder(updated);
    setIsSubmittingReturn(false);
    setIsReturnModalOpen(false);
    refreshOrders();
    showToast('Return request submitted to seller & admin for approval', 'success');
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    const updated = await api.updateOrderStatus(order.id, 'cancelled');
    if (updated) setOrder(updated);
    setIsCancelling(false);
    setIsCancelModalOpen(false);
    refreshOrders();
    showToast('Order cancelled successfully', 'info');
  };

  const canCancel = order.orderStatus === 'order_placed' || order.orderStatus === 'confirmed';
  const canReturn = order.orderStatus === 'delivered' && !order.returnRequest;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('orders')}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono">
                {order.orderStatus.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimated Delivery: <strong>{order.estimatedDeliveryDate}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              Cancel Order
            </button>
          )}

          {canReturn && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Return / Refund</span>
            </button>
          )}
        </div>
      </div>

      {/* Return Request Status Banner if active */}
      {order.returnRequest && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">
              Return Status: {order.returnRequest.status.toUpperCase()}
            </h4>
            <p className="mt-0.5 text-amber-800">
              Reason: {order.returnRequest.reason}. Our logistics team will review and approve pickup within 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* VISUAL ORDER TRACKING STEPPER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">
          Package Journey & Live Updates
        </h3>

        {order.courierName && (
          <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900">{order.courierName}</span>
            </div>
            <span className="font-mono text-slate-500">
              Tracking: <strong>{order.courierTrackingNumber || 'In transit'}</strong>
            </span>
          </div>
        )}

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {order.trackingSteps.map((step, idx) => {
            return (
              <div key={idx} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                    step.completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <h4
                      className={`text-xs font-bold ${
                        step.completed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ITEMS IN THIS ORDER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
          Ordered Products ({order.items.length})
        </h3>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4
                    onClick={() => openProduct(item.productId)}
                    className="text-xs font-bold text-slate-900 hover:text-amber-600 cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sold by: <strong>{item.sellerBusinessName}</strong> · Qty: {item.quantity}
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {order.orderStatus === 'delivered' && (
                <button
                  onClick={() => openProduct(item.productId)}
                  className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  Rate & Review
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SHIPPING ADDRESS & BILLING BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900">
            <MapPin className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Delivery Address</h3>
          </div>
          <p className="text-xs font-bold text-slate-900">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-slate-600 mt-1 leading-snug">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
          </p>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
            <span className="font-mono">{order.shippingAddress.pincode}</span>
          </p>
          <p className="text-xs text-slate-500 font-mono mt-1">Phone: {order.shippingAddress.phone}</p>
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Payment Information</h3>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Payment Method</span>
            <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Payment Status</span>
            <span className="font-bold text-emerald-600 uppercase">{order.paymentStatus}</span>
          </div>
          {order.paymentTransactionId && (
            <div className="flex justify-between text-slate-600">
              <span>Transaction ID</span>
              <span className="font-mono text-slate-500">{order.paymentTransactionId}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
            <span className="font-bold text-slate-900">Total Paid</span>
            <span className="text-base font-black text-slate-900 font-mono">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleReturnSubmit}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Request Return / Replacement</h3>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Return:
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
              >
                <option value="Damaged/Defective item">Damaged or Defective product</option>
                <option value="Item not as described">Item does not match website description</option>
                <option value="Quality issue">Quality not satisfactory</option>
                <option value="Wrong item delivered">Received wrong product or variant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Comments:
              </label>
              <textarea
                rows={3}
                placeholder="Explain the reason for return in detail..."
                value={returnDetails}
                onChange={(e) => setReturnDetails(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReturn}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                {isSubmittingReturn ? 'Submitting...' : 'Confirm Return'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Cancel Order #{order.orderNumber}?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this order? Any online payment will be refunded to your original payment method in 2-3 business days.
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
            >
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found better price elsewhere">Found better price elsewhere</option>
              <option value="Delivery time too long">Delivery time too long</option>
              <option value="Need to change address">Need to change delivery address</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
