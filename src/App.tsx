import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/Branding/SplashScreen';
import { Navbar } from './components/Navigation/Navbar';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { HomeScreen } from './components/Home/HomeScreen';
import { ProductDetail } from './components/Product/ProductDetail';
import { CartView } from './components/Cart/CartView';
import { CheckoutView } from './components/Checkout/CheckoutView';
import { OrderHistoryView } from './components/Orders/OrderHistoryView';
import { OrderTrackingDetail } from './components/Orders/OrderTrackingDetail';
import { SellerDashboard } from './components/Seller/SellerDashboard';
import { SellerRegisterModal } from './components/Seller/SellerRegisterModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { ProfileView } from './components/Profile/ProfileView';
import { ShareModal } from './components/Share/ShareModal';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { Footer } from './components/Footer';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function AppContent() {
  const { currentView, toasts, dismissToast, shareProduct, setShareProduct } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSellerRegisterOpen, setIsSellerRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Main Top Navigation */}
      <Navbar
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenSellerRegister={() => setIsSellerRegisterOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && <HomeScreen />}
        {currentView === 'product_detail' && <ProductDetail />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'orders' && <OrderHistoryView />}
        {currentView === 'order_track' && <OrderTrackingDetail />}
        {currentView === 'seller_dashboard' && <SellerDashboard />}
        {currentView === 'admin_panel' && <AdminPanel />}
        {currentView === 'profile' && <ProfileView />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Share Modal */}
      <ShareModal product={shareProduct} onClose={() => setShareProduct(null)} />

      {/* In-App Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Become a Seller Onboarding Modal */}
      <SellerRegisterModal
        isOpen={isSellerRegisterOpen}
        onClose={() => setIsSellerRegisterOpen(false)}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-16 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-800'
                : toast.type === 'info'
                ? 'bg-slate-900/95 text-white border-slate-800'
                : 'bg-emerald-950/95 text-white border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
