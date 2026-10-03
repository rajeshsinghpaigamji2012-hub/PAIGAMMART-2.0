import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, Package, CheckCircle2, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, openOrderTracking, setCurrentView, setActiveRole } = useApp();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-indigo-600" />;
      case 'payment':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'kyc':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'promotion':
        return <Tag className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleClick = (notif: any) => {
    markNotificationRead(notif.id);
    if (notif.link === 'orders') {
      setActiveRole('customer');
      setCurrentView('orders');
    } else if (notif.link === 'seller-orders') {
      setActiveRole('seller');
      setCurrentView('seller_dashboard');
    } else if (notif.link === 'admin-sellers' || notif.link === 'admin-orders') {
      setActiveRole('admin');
      setCurrentView('admin_panel');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No new notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-slate-50/50 border-slate-200 text-slate-600'
                    : 'bg-amber-50/40 border-amber-200 shadow-2xs text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold truncate">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
