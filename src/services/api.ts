import {
  Product,
  Order,
  UserProfile,
  SellerProfile,
  Coupon,
  CommissionTransaction,
  ProductReview,
  NotificationItem,
  MarketplaceSettings,
  Address,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  INITIAL_USER,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_COMMISSIONS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
} from '../initialData';

// Local storage key for fallback persistence
const STORAGE_KEY = 'paigammart_state_v1';

interface LocalState {
  products: Product[];
  sellers: SellerProfile[];
  currentUser: UserProfile;
  orders: Order[];
  coupons: Coupon[];
  commissions: CommissionTransaction[];
  reviews: ProductReview[];
  notifications: NotificationItem[];
  settings: MarketplaceSettings;
}

function getStoredState(): LocalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return {
    products: INITIAL_PRODUCTS,
    sellers: INITIAL_SELLERS,
    currentUser: INITIAL_USER,
    orders: INITIAL_ORDERS,
    coupons: INITIAL_COUPONS,
    commissions: INITIAL_COMMISSIONS,
    reviews: INITIAL_REVIEWS,
    notifications: INITIAL_NOTIFICATIONS,
    settings: INITIAL_SETTINGS,
  };
}

function saveState(state: LocalState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

let localDb: LocalState = getStoredState();

export const api = {
  async getProducts(params?: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sort?: string;
  }): Promise<Product[]> {
    try {
      const url = new URL('/api/products', window.location.origin);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            url.searchParams.append(k, String(v));
          }
        });
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed, using local DB:', e);
    }

    // Local fallback
    let results = localDb.products.filter((p) => p.isActive);
    if (params?.category && params.category !== 'All') {
      results = results.filter(
        (p) => p.category.toLowerCase() === params.category!.toLowerCase()
      );
    }
    if (params?.q) {
      const query = params.q.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }
    if (params?.minPrice) results = results.filter((p) => p.price >= params.minPrice!);
    if (params?.maxPrice) results = results.filter((p) => p.price <= params.maxPrice!);
    if (params?.rating) results = results.filter((p) => p.rating >= params.rating!);
    if (params?.sort === 'price_asc') results.sort((a, b) => a.price - b.price);
    else if (params?.sort === 'price_desc') results.sort((a, b) => b.price - a.price);
    else if (params?.sort === 'rating') results.sort((a, b) => b.rating - a.rating);
    return results;
  },

  async getProduct(id: string): Promise<{ product: Product; reviews: ProductReview[]; seller?: SellerProfile }> {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const product = localDb.products.find((p) => p.id === id) || localDb.products[0];
    const reviews = localDb.reviews.filter((r) => r.productId === product.id);
    const seller = localDb.sellers.find((s) => s.id === product.sellerId);
    return { product, reviews, seller };
  },

  async addProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        const newP = await res.json();
        localDb.products.unshift(newP);
        saveState(localDb);
        return newP;
      }
    } catch (e) {
      console.warn(e);
    }

    const newP: Product = {
      id: `prod_${Date.now()}`,
      sellerId: productData.sellerId || 'seller_1',
      sellerBusinessName: productData.sellerBusinessName || 'Varanasi Silk & Weaves Emporium',
      title: productData.title || 'Untitled Product',
      brand: productData.brand || 'PaigamMart',
      category: productData.category || 'General',
      description: productData.description || '',
      specifications: productData.specifications || {},
      mrp: Number(productData.mrp) || 1999,
      price: Number(productData.price) || 1299,
      discountPercent: Math.round(
        ((Number(productData.mrp || 1999) - Number(productData.price || 1299)) /
          Number(productData.mrp || 1999)) *
          100
      ),
      stock: Number(productData.stock) || 10,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      images: productData.images?.length
        ? productData.images
        : ['/src/assets/images/product_chanderi_saree_1791034659208.jpg'],
      rating: 5.0,
      reviewCount: 0,
      badge: 'New Arrival',
      returnPolicyDays: 7,
      isCodAvailable: true,
      freeDeliveryThreshold: 499,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    localDb.products.unshift(newP);
    saveState(localDb);
    return newP;
  },

  async getOrders(filter?: { customerId?: string; sellerId?: string; role?: string }): Promise<Order[]> {
    try {
      const url = new URL('/api/orders', window.location.origin);
      if (filter?.role) url.searchParams.set('role', filter.role);
      if (filter?.sellerId) url.searchParams.set('sellerId', filter.sellerId);
      if (filter?.customerId) url.searchParams.set('customerId', filter.customerId);
      const res = await fetch(url.toString());
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    return localDb.orders;
  },

  async createOrder(payload: {
    items: any[];
    shippingAddress: Address;
    paymentMethod: string;
    appliedCouponCode?: string;
  }): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const order = await res.json();
        localDb.orders.unshift(order);
        saveState(localDb);
        return order;
      }
    } catch (e) {
      console.warn(e);
    }

    // Local fallback order creation with exact 5% platform commission
    let subtotal = 0;
    let totalPlatformCommission = 0;
    let totalSellerPayable = 0;

    const orderItems = payload.items.map((item) => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      const commissionAmount = Number((itemSubtotal * 0.05).toFixed(2));
      const sellerPayable = Number((itemSubtotal - commissionAmount).toFixed(2));
      totalPlatformCommission += commissionAmount;
      totalSellerPayable += sellerPayable;

      return {
        productId: item.productId,
        sellerId: item.sellerId || 'seller_1',
        sellerBusinessName: item.sellerBusinessName || 'Verified Seller',
        title: item.title,
        image: item.image,
        price: item.price,
        mrp: item.mrp,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || '',
        platformCommissionRate: 0.05,
        platformCommissionAmount: commissionAmount,
        sellerSettlementAmount: sellerPayable,
      };
    });

    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const totalAmount = subtotal + deliveryFee;

    const fallbackOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `PM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: localDb.currentUser.id,
      customerName: payload.shippingAddress.fullName || localDb.currentUser.name,
      customerEmail: localDb.currentUser.email,
      customerPhone: payload.shippingAddress.phone || localDb.currentUser.phone,
      shippingAddress: payload.shippingAddress,
      items: orderItems,
      subtotal,
      discount: 0,
      deliveryFee,
      taxAmount: 0,
      totalAmount,
      appliedCouponCode: payload.appliedCouponCode,
      paymentMethod: payload.paymentMethod as any,
      paymentStatus: payload.paymentMethod === 'cod' ? 'paid' : 'paid',
      orderStatus: 'confirmed',
      orderDate: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trackingSteps: [
        {
          status: 'order_placed',
          title: 'Order Placed',
          description: 'Order confirmed successfully.',
          timestamp: 'Just now',
          completed: true,
        },
        {
          status: 'confirmed',
          title: 'Order Confirmed',
          description: 'Seller notified for dispatch.',
          timestamp: 'Just now',
          completed: true,
        },
        {
          status: 'packed',
          title: 'Packaging',
          description: 'Being packaged safely.',
          timestamp: 'Upcoming',
          completed: false,
        },
        {
          status: 'shipped',
          title: 'Dispatched',
          description: 'Courier assignment.',
          timestamp: 'Upcoming',
          completed: false,
        },
        {
          status: 'out_for_delivery',
          title: 'Out for Delivery',
          description: 'Delivery associate on route.',
          timestamp: 'Upcoming',
          completed: false,
        },
        {
          status: 'delivered',
          title: 'Delivered',
          description: 'Delivery handover.',
          timestamp: 'Upcoming',
          completed: false,
        },
      ],
      totalPlatformCommission,
      totalSellerPayable,
      settlementStatus: 'pending',
    };

    localDb.orders.unshift(fallbackOrder);
    saveState(localDb);
    return fallbackOrder;
  },

  async verifyPayment(orderId: string, paymentMethod: string, details?: any) {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentMethod, paymentDetails: details }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    return {
      success: true,
      orderId,
      paymentStatus: 'paid',
      transactionId: `TXN-LOCAL-${Date.now()}`,
    };
  },

  async updateOrderStatus(orderId: string, status: string, courierName?: string, trackingNum?: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, courierName, courierTrackingNumber: trackingNum }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const ord = localDb.orders.find((o) => o.id === orderId);
    if (ord) {
      ord.orderStatus = status as any;
      saveState(localDb);
    }
    return ord;
  },

  async requestReturn(orderId: string, reason: string, details?: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const ord = localDb.orders.find((o) => o.id === orderId);
    if (ord) {
      ord.orderStatus = 'return_requested';
      ord.returnRequest = {
        requestedAt: new Date().toISOString(),
        reason,
        details,
        status: 'requested',
        refundAmount: ord.totalAmount,
      };
      saveState(localDb);
    }
    return ord;
  },

  async handleReturnAction(orderId: string, action: 'approve' | 'reject' | 'refund') {
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const ord = localDb.orders.find((o) => o.id === orderId);
    if (ord && ord.returnRequest) {
      if (action === 'approve') ord.returnRequest.status = 'approved';
      else if (action === 'refund') {
        ord.returnRequest.status = 'refund_completed';
        ord.orderStatus = 'refunded';
      } else ord.returnRequest.status = 'rejected';
      saveState(localDb);
    }
    return ord;
  },

  async addReview(reviewData: { productId: string; rating: number; title: string; comment: string }): Promise<ProductReview> {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (res.ok) {
        const rev = await res.json();
        localDb.reviews.unshift(rev);
        saveState(localDb);
        return rev;
      }
    } catch (e) {
      console.warn(e);
    }
    const rev: ProductReview = {
      id: `rev_${Date.now()}`,
      productId: reviewData.productId,
      userId: localDb.currentUser.id,
      userName: localDb.currentUser.name,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      verifiedPurchase: true,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };
    localDb.reviews.unshift(rev);
    saveState(localDb);
    return rev;
  },

  async getSellers(): Promise<SellerProfile[]> {
    try {
      const res = await fetch('/api/sellers');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    return localDb.sellers;
  },

  async registerSeller(sellerData: any): Promise<SellerProfile> {
    try {
      const res = await fetch('/api/sellers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerData),
      });
      if (res.ok) {
        const seller = await res.json();
        localDb.sellers.unshift(seller);
        saveState(localDb);
        return seller;
      }
    } catch (e) {
      console.warn(e);
    }

    const seller: SellerProfile = {
      id: `seller_${Date.now()}`,
      userId: localDb.currentUser.id,
      businessName: sellerData.businessName,
      legalEntityName: sellerData.legalEntityName || sellerData.businessName,
      email: sellerData.email || localDb.currentUser.email,
      phone: sellerData.phone || localDb.currentUser.phone,
      category: sellerData.category || 'General',
      rating: 5.0,
      totalRatingsCount: 0,
      kyc: {
        panNumber: sellerData.panNumber,
        gstNumber: sellerData.gstNumber,
        businessAddress: sellerData.businessAddress,
        bankAccountName: sellerData.bankAccountName,
        bankAccountNumber: sellerData.bankAccountNumber,
        bankIfscCode: sellerData.bankIfscCode,
        bankName: sellerData.bankName,
        upiId: sellerData.upiId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
      isApproved: false,
      isBlocked: false,
      totalOrdersFulfilled: 0,
      grossSales: 0,
      platformCommissionDeducted: 0,
      netEarnings: 0,
      pendingSettlement: 0,
      completedSettlement: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    localDb.sellers.unshift(seller);
    saveState(localDb);
    return seller;
  },

  async updateSellerKyc(sellerId: string, status: 'verified' | 'rejected', isApproved: boolean) {
    try {
      const res = await fetch(`/api/sellers/${sellerId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isApproved }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const seller = localDb.sellers.find((s) => s.id === sellerId);
    if (seller) {
      seller.kyc.status = status;
      seller.isApproved = isApproved;
      saveState(localDb);
    }
    return seller;
  },

  async getCommissions(sellerId?: string): Promise<CommissionTransaction[]> {
    try {
      const url = new URL('/api/commissions', window.location.origin);
      if (sellerId) url.searchParams.set('sellerId', sellerId);
      const res = await fetch(url.toString());
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    if (sellerId) return localDb.commissions.filter((c) => c.sellerId === sellerId);
    return localDb.commissions;
  },

  async settleCommission(sellerId: string) {
    try {
      const res = await fetch('/api/commissions/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const s = localDb.sellers.find((sel) => sel.id === sellerId);
    if (s) {
      s.completedSettlement += s.pendingSettlement;
      s.pendingSettlement = 0;
      saveState(localDb);
    }
    return { success: true };
  },

  async validateCoupon(code: string, cartTotal: number) {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal }),
      });
      return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const c = localDb.coupons.find((x) => x.code.toUpperCase() === code.toUpperCase().trim() && x.isActive);
    if (!c) return { valid: false, error: 'Invalid coupon' };
    if (cartTotal < c.minOrderValue) {
      return { valid: false, error: `Min cart value ₹${c.minOrderValue} required` };
    }
    const discount = c.discountType === 'percentage' ? (cartTotal * c.discountValue) / 100 : c.discountValue;
    return { valid: true, coupon: c, discountAmount: Math.round(discount), message: `Coupon applied: ₹${discount} saved` };
  },

  async getNotifications(recipientId?: string): Promise<NotificationItem[]> {
    try {
      const url = new URL('/api/notifications', window.location.origin);
      if (recipientId) url.searchParams.set('recipientId', recipientId);
      const res = await fetch(url.toString());
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    return localDb.notifications;
  },

  async getAdminMetrics() {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    const totalOrders = localDb.orders.length;
    const grossGMV = localDb.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const total5PercentCommission = localDb.commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalSellerDisbursed = localDb.commissions.reduce((sum, c) => sum + c.netSellerAmount, 0);
    return {
      totalOrders,
      grossGMV,
      total5PercentCommission,
      totalSellerDisbursed,
      activeSellers: localDb.sellers.filter((s) => s.isApproved).length,
      pendingKycCount: localDb.sellers.filter((s) => s.kyc.status === 'pending').length,
      totalProducts: localDb.products.length,
      platformUpiAccount: localDb.settings.platformUpiId,
    };
  },
};
