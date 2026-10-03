import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  UserProfile,
  SellerProfile,
  Address,
  NotificationItem,
  UserRole,
} from '../types';
import { api } from '../services/api';
import { INITIAL_USER } from '../initialData';

export type AppView =
  | 'home'
  | 'product_detail'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order_track'
  | 'seller_dashboard'
  | 'seller_register'
  | 'admin_panel'
  | 'profile';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;

  // Products
  products: Product[];
  refreshProducts: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: any) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  couponDiscount: number;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCouponCode: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // User & Address
  user: UserProfile;
  selectedAddress: Address;
  setSelectedAddress: (addr: Address) => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  deliveryPincode: string;
  deliveryCity: string;
  setDeliveryPincode: (pin: string, city: string) => void;

  // Seller & Admin
  currentSeller: SellerProfile | null;
  refreshSellers: () => Promise<void>;

  // Orders
  orders: Order[];
  refreshOrders: () => Promise<void>;
  openProduct: (productId: string) => void;
  openOrderTracking: (orderId: string) => void;

  // Notifications & Toasts
  notifications: NotificationItem[];
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;

  // Share modal state
  shareProduct: Product | null;
  setShareProduct: (p: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [wishlist, setWishlist] = useState<string[]>(INITIAL_USER.wishlist);
  const [selectedAddress, setSelectedAddress] = useState<Address>(INITIAL_USER.savedAddresses[0]);

  const [deliveryPincode, setDeliveryPincodeState] = useState('400050');
  const [deliveryCity, setDeliveryCity] = useState('Mumbai');

  const [currentSeller, setCurrentSeller] = useState<SellerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pm_cart', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // Load initial data
  const refreshProducts = async () => {
    const list = await api.getProducts({
      q: searchQuery || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    });
    setProducts(list);
  };

  const refreshOrders = async () => {
    const list = await api.getOrders({
      role: activeRole,
      customerId: user.id,
      sellerId: currentSeller?.id,
    });
    setOrders(list);
  };

  const refreshSellers = async () => {
    const sellers = await api.getSellers();
    if (sellers.length > 0) {
      setCurrentSeller(sellers[0]);
    }
  };

  const refreshNotifications = async () => {
    const notifs = await api.getNotifications(
      activeRole === 'admin' ? 'admin' : activeRole === 'seller' ? currentSeller?.id : user.id
    );
    setNotifications(notifs);
  };

  useEffect(() => {
    refreshProducts();
    refreshSellers();
    refreshOrders();
    refreshNotifications();
  }, []);

  // Deep linking: check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const prodParam = urlParams.get('product');
    const viewParam = urlParams.get('view') as AppView | null;
    const orderParam = urlParams.get('order');

    if (prodParam) {
      setSelectedProductId(prodParam);
      setCurrentView('product_detail');
    } else if (orderParam) {
      setSelectedOrderId(orderParam);
      setCurrentView('order_track');
    } else if (viewParam) {
      setCurrentView(viewParam);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, quantity: number = 1, variant?: any) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.selectedVariantId === (variant?.id || undefined)
      );
      if (existing) {
        showToast(`Updated quantity for "${product.title.slice(0, 24)}..."`, 'info');
        return prev.map((item) =>
          item.productId === product.id && item.selectedVariantId === (variant?.id || undefined)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      showToast(`Added "${product.title.slice(0, 24)}..." to cart`, 'success');
      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity,
          selectedVariantId: variant?.id,
          size: variant?.size,
          color: variant?.color,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCouponCode = async (code: string) => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const result = await api.validateCoupon(code, subtotal);
    if (result.valid) {
      setAppliedCoupon(result.coupon.code);
      setCouponDiscount(result.discountAmount);
      showToast(result.message, 'success');
      return { success: true, message: result.message };
    } else {
      showToast(result.error || 'Invalid coupon', 'error');
      return { success: false, message: result.error || 'Invalid coupon' };
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon removed', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const addAddress = (addrData: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      ...addrData,
    };
    setUser((prev) => ({
      ...prev,
      savedAddresses: [...prev.savedAddresses, newAddr],
    }));
    setSelectedAddress(newAddr);
    showToast('Delivery address saved successfully', 'success');
  };

  const setDeliveryPincode = (pin: string, city: string) => {
    setDeliveryPincodeState(pin);
    setDeliveryCity(city);
    showToast(`Delivering to ${city} - ${pin}`, 'info');
  };

  const openProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
    // Update browser URL query parameter cleanly without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('product', productId);
    url.searchParams.delete('order');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOrderTracking = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order_track');
    const url = new URL(window.location.href);
    url.searchParams.set('order', orderId);
    url.searchParams.delete('product');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markNotificationRead = async (id: string) => {
    await api.getNotifications();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView: (v) => {
          setCurrentView(v);
          const url = new URL(window.location.href);
          if (v === 'home') {
            url.searchParams.delete('product');
            url.searchParams.delete('order');
            url.searchParams.delete('view');
          } else {
            url.searchParams.set('view', v);
          }
          window.history.pushState({}, '', url.toString());
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        activeRole,
        setActiveRole,
        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,
        products,
        refreshProducts,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        couponDiscount,
        applyCouponCode,
        removeCouponCode,
        wishlist,
        toggleWishlist,
        user,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        deliveryPincode,
        deliveryCity,
        setDeliveryPincode,
        currentSeller,
        refreshSellers,
        orders,
        refreshOrders,
        openProduct,
        openOrderTracking,
        notifications,
        refreshNotifications,
        markNotificationRead,
        toasts,
        showToast,
        dismissToast,
        shareProduct,
        setShareProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
