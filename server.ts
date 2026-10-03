import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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
} from './src/initialData.ts';
import {
  Product,
  SellerProfile,
  UserProfile,
  Order,
  Coupon,
  CommissionTransaction,
  ProductReview,
  NotificationItem,
  MarketplaceSettings,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory data store with state preservation
const db = {
  products: [...INITIAL_PRODUCTS] as Product[],
  sellers: [...INITIAL_SELLERS] as SellerProfile[],
  currentUser: { ...INITIAL_USER } as UserProfile,
  orders: [...INITIAL_ORDERS] as Order[],
  coupons: [...INITIAL_COUPONS] as Coupon[],
  commissions: [...INITIAL_COMMISSIONS] as CommissionTransaction[],
  reviews: [...INITIAL_REVIEWS] as ProductReview[],
  notifications: [...INITIAL_NOTIFICATIONS] as NotificationItem[],
  settings: { ...INITIAL_SETTINGS } as MarketplaceSettings,
};

// --- API ENDPOINTS ---

// Health & Info
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'PaigamMart', version: '1.0.0' });
});

// Products: List, Search, Filter, Sort
app.get('/api/products', (req, res) => {
  const { q, category, brand, minPrice, maxPrice, rating, sort } = req.query;
  let results = db.products.filter((p) => p.isActive);

  if (category && category !== 'All') {
    results = results.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (brand) {
    results = results.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
  }

  if (minPrice) {
    results = results.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter((p) => p.price <= Number(maxPrice));
  }
  if (rating) {
    results = results.filter((p) => p.rating >= Number(rating));
  }

  if (q) {
    const query = String(q).toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Relevance / popularity
    results.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  res.json(results);
});

// Single Product Details + Reviews
app.get('/api/products/:id', (req, res) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const reviews = db.reviews.filter((r) => r.productId === product.id);
  const seller = db.sellers.find((s) => s.id === product.sellerId);
  res.json({ product, reviews, seller });
});

// Add Product (Seller)
app.post('/api/products', (req, res) => {
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    sellerId: req.body.sellerId || 'seller_1',
    sellerBusinessName: req.body.sellerBusinessName || 'Varanasi Silk Emporium',
    title: req.body.title,
    brand: req.body.brand || 'PaigamMart Selection',
    category: req.body.category || 'General',
    description: req.body.description || '',
    specifications: req.body.specifications || {},
    mrp: Number(req.body.mrp),
    price: Number(req.body.price),
    discountPercent: Math.round(
      ((Number(req.body.mrp) - Number(req.body.price)) / Number(req.body.mrp)) * 100
    ),
    stock: Number(req.body.stock) || 10,
    sku: req.body.sku || `SKU-${Date.now().toString().slice(-6)}`,
    images: req.body.images?.length
      ? req.body.images
      : ['/src/assets/images/product_chanderi_saree_1791034659208.jpg'],
    variants: req.body.variants || [],
    rating: 5.0,
    reviewCount: 0,
    badge: 'New Arrival',
    returnPolicyDays: req.body.returnPolicyDays || 7,
    isCodAvailable: req.body.isCodAvailable !== false,
    freeDeliveryThreshold: 499,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  res.status(201).json(newProduct);
});

// Update Product
app.put('/api/products/:id', (req, res) => {
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  res.json(db.products[idx]);
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
  db.products = db.products.filter((p) => p.id !== req.params.id);
  res.json({ success: true });
});

// Categories list
app.get('/api/categories', (req, res) => {
  const categories = Array.from(new Set(db.products.map((p) => p.category)));
  res.json(categories);
});

// User profile & addresses
app.get('/api/user/profile', (req, res) => {
  res.json(db.currentUser);
});

app.post('/api/user/address', (req, res) => {
  const newAddr = {
    id: `addr_${Date.now()}`,
    ...req.body,
    isDefault: db.currentUser.savedAddresses.length === 0 || req.body.isDefault,
  };
  if (newAddr.isDefault) {
    db.currentUser.savedAddresses.forEach((a) => (a.isDefault = false));
  }
  db.currentUser.savedAddresses.push(newAddr);
  res.json(db.currentUser.savedAddresses);
});

// Orders: List
app.get('/api/orders', (req, res) => {
  const { customerId, sellerId, role } = req.query;
  let list = [...db.orders];

  if (role === 'seller' && sellerId) {
    list = list.filter((ord) => ord.items.some((item) => item.sellerId === sellerId));
  } else if (role === 'customer' || customerId) {
    list = list.filter((ord) => ord.customerId === (customerId || db.currentUser.id));
  }
  // Admin sees all
  res.json(list);
});

// Order Details
app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Create Order (Calculates 5% Platform Commission & prepares payment verification)
app.post('/api/orders', (req, res) => {
  const { items, shippingAddress, paymentMethod, appliedCouponCode } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let subtotal = 0;
  let totalPlatformCommission = 0;
  let totalSellerPayable = 0;

  const orderItems = items.map((item: any) => {
    const product = db.products.find((p) => p.id === item.productId);
    const price = product ? product.price : item.price;
    const mrp = product ? product.mrp : item.mrp;
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    // MANDATORY 5% MARKETPLACE COMMISSION CALCULATION
    const commissionRate = 0.05;
    const commissionAmount = Number((itemSubtotal * commissionRate).toFixed(2));
    const sellerPayable = Number((itemSubtotal - commissionAmount).toFixed(2));

    totalPlatformCommission += commissionAmount;
    totalSellerPayable += sellerPayable;

    // Deduct stock
    if (product && product.stock >= item.quantity) {
      product.stock -= item.quantity;
    }

    return {
      productId: item.productId,
      sellerId: item.sellerId || (product ? product.sellerId : 'seller_1'),
      sellerBusinessName: item.sellerBusinessName || (product ? product.sellerBusinessName : 'Verified Seller'),
      title: product ? product.title : item.title,
      image: product && product.images[0] ? product.images[0] : item.image,
      price,
      mrp,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant || '',
      platformCommissionRate: commissionRate,
      platformCommissionAmount: commissionAmount,
      sellerSettlementAmount: sellerPayable,
    };
  });

  // Calculate discount
  let discount = 0;
  if (appliedCouponCode) {
    const coupon = db.coupons.find((c) => c.code === appliedCouponCode && c.isActive);
    if (coupon) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }
      coupon.timesUsed += 1;
    }
  }

  const deliveryFee = subtotal >= db.settings.freeDeliveryThreshold ? 0 : db.settings.standardDeliveryFee;
  const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

  const orderId = `ord_${Date.now()}`;
  const orderNumber = `PM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const isPrepaid = paymentMethod !== 'cod';

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customerId: db.currentUser.id,
    customerName: shippingAddress.fullName || db.currentUser.name,
    customerEmail: db.currentUser.email,
    customerPhone: shippingAddress.phone || db.currentUser.phone,
    shippingAddress,
    items: orderItems,
    subtotal,
    discount,
    deliveryFee,
    taxAmount: 0,
    totalAmount,
    appliedCouponCode,
    paymentMethod,
    paymentStatus: isPrepaid ? 'pending' : 'paid', // COD is confirmed upon placement
    orderStatus: 'confirmed',
    orderDate: new Date().toISOString(),
    estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    trackingSteps: [
      {
        status: 'order_placed',
        title: 'Order Placed',
        description: `Order ${orderNumber} received.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Payment authorized and verified by PaigamMart.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      },
      {
        status: 'packed',
        title: 'Ready for Dispatch',
        description: 'Seller is packing items safely.',
        timestamp: 'Upcoming',
        completed: false,
      },
      {
        status: 'shipped',
        title: 'In Transit',
        description: 'Courier assignment pending.',
        timestamp: 'Upcoming',
        completed: false,
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Delivery agent will contact upon arrival.',
        timestamp: 'Upcoming',
        completed: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Order handover.',
        timestamp: 'Upcoming',
        completed: false,
      },
    ],
    totalPlatformCommission,
    totalSellerPayable,
    settlementStatus: 'pending',
  };

  db.orders.unshift(newOrder);

  // Record Commission Transactions for each seller item
  orderItems.forEach((item: any) => {
    const commTx: CommissionTransaction = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      sellerId: item.sellerId,
      sellerBusinessName: item.sellerBusinessName,
      grossAmount: item.price * item.quantity,
      commissionRate: 0.05,
      commissionAmount: item.platformCommissionAmount,
      gatewayFee: 0,
      taxesDeducted: 0,
      netSellerAmount: item.sellerSettlementAmount,
      platformAccountUpi: db.settings.platformUpiId, // "7880265898@ybl" (Confidential)
      sellerAccountInfo: `Registered Settlement Account (${item.sellerBusinessName})`,
      status: 'recorded',
      createdAt: new Date().toISOString(),
    };
    db.commissions.unshift(commTx);

    // Update seller ledger stats
    const seller = db.sellers.find((s) => s.id === item.sellerId);
    if (seller) {
      seller.grossSales += item.price * item.quantity;
      seller.platformCommissionDeducted += item.platformCommissionAmount;
      seller.netEarnings += item.sellerSettlementAmount;
      seller.pendingSettlement += item.sellerSettlementAmount;
      seller.totalOrdersFulfilled += 1;
    }
  });

  // Notify customer & seller
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: db.currentUser.id,
    title: 'Order Placed Successfully! 🛍️',
    message: `Your order #${newOrder.orderNumber} for ₹${newOrder.totalAmount.toLocaleString('en-IN')} is confirmed.`,
    type: 'order',
    link: 'orders',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(newOrder);
});

// Server-side Payment Verification
app.post('/api/payments/verify', (req, res) => {
  const { orderId, paymentMethod, paymentDetails, signature } = req.body;
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found for payment verification' });
  }

  // Cryptographic / Gateway validation simulation
  const transactionId = `TXN-${paymentMethod.toUpperCase()}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  order.paymentStatus = 'paid';
  order.paymentTransactionId = transactionId;
  order.paymentDetails = paymentDetails || {
    gatewayRef: `PG-SECURE-${Date.now()}`,
    verifiedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentStatus: 'paid',
    transactionId,
    message: 'Payment verified securely by PaigamMart Payment Gateway',
  });
});

// Update Order Status (Seller / Admin)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status, courierName, courierTrackingNumber } = req.body;
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.orderStatus = status;
  if (courierName) order.courierName = courierName;
  if (courierTrackingNumber) order.courierTrackingNumber = courierTrackingNumber;

  // Update tracking steps
  const stepIdx = order.trackingSteps.findIndex((s) => s.status === status);
  if (stepIdx !== -1) {
    for (let i = 0; i <= stepIdx; i++) {
      order.trackingSteps[i].completed = true;
      if (!order.trackingSteps[i].timestamp || order.trackingSteps[i].timestamp === 'Upcoming') {
        order.trackingSteps[i].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
  }

  if (status === 'delivered') {
    order.deliveredDate = new Date().toISOString();
  }

  res.json(order);
});

// Customer Request Return
app.post('/api/orders/:id/return', (req, res) => {
  const { reason, details } = req.body;
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.orderStatus = 'return_requested';
  order.returnRequest = {
    requestedAt: new Date().toISOString(),
    reason: reason || 'Defective/Damaged item',
    details: details || '',
    status: 'requested',
    refundAmount: order.totalAmount,
  };

  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: 'admin',
    title: `Return Request for ${order.orderNumber}`,
    message: `Customer requested return for Order ${order.orderNumber}: ${reason}`,
    type: 'order',
    link: 'admin-orders',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.json(order);
});

// Admin/Seller Approve Return & Process Refund
app.patch('/api/orders/:id/return', (req, res) => {
  const { action } = req.body; // 'approve' | 'reject' | 'refund'
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order || !order.returnRequest) {
    return res.status(404).json({ error: 'Return request not found' });
  }

  if (action === 'approve') {
    order.returnRequest.status = 'approved';
    order.returnRequest.approvedAt = new Date().toISOString();
  } else if (action === 'refund') {
    order.returnRequest.status = 'refund_completed';
    order.returnRequest.refundedAt = new Date().toISOString();
    order.orderStatus = 'refunded';
    order.paymentStatus = 'refunded';
  } else if (action === 'reject') {
    order.returnRequest.status = 'rejected';
  }

  res.json(order);
});

// Submit Verified Review
app.post('/api/reviews', (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const newReview: ProductReview = {
    id: `rev_${Date.now()}`,
    productId,
    userId: db.currentUser.id,
    userName: db.currentUser.name,
    rating: Number(rating) || 5,
    title: title || 'Great product',
    comment: comment || '',
    verifiedPurchase: true,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  // Recalculate average rating
  const pReviews = db.reviews.filter((r) => r.productId === productId);
  const avg = pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length;
  product.rating = Number(avg.toFixed(1));
  product.reviewCount = pReviews.length;

  res.status(201).json(newReview);
});

// Sellers List (Admin & Marketplace)
app.get('/api/sellers', (req, res) => {
  res.json(db.sellers);
});

// Seller Registration with KYC
app.post('/api/sellers/register', (req, res) => {
  const {
    businessName,
    legalEntityName,
    email,
    phone,
    category,
    panNumber,
    gstNumber,
    businessAddress,
    bankAccountName,
    bankAccountNumber,
    bankIfscCode,
    bankName,
    upiId,
  } = req.body;

  const newSeller: SellerProfile = {
    id: `seller_${Date.now()}`,
    userId: db.currentUser.id,
    businessName,
    legalEntityName: legalEntityName || businessName,
    email: email || db.currentUser.email,
    phone: phone || db.currentUser.phone,
    category: category || 'General Merchandise',
    rating: 5.0,
    totalRatingsCount: 0,
    kyc: {
      panNumber,
      gstNumber,
      businessAddress,
      bankAccountName,
      bankAccountNumber,
      bankIfscCode,
      bankName,
      upiId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    },
    isApproved: false, // Requires Admin verification
    isBlocked: false,
    totalOrdersFulfilled: 0,
    grossSales: 0,
    platformCommissionDeducted: 0,
    netEarnings: 0,
    pendingSettlement: 0,
    completedSettlement: 0,
    joinedDate: new Date().toISOString().split('T')[0],
  };

  db.sellers.unshift(newSeller);

  // Notify Admin
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: 'admin',
    title: 'New Seller Registration',
    message: `${businessName} registered as seller. KYC review pending.`,
    type: 'kyc',
    link: 'admin-sellers',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(newSeller);
});

// Admin Approve/Reject Seller KYC
app.patch('/api/sellers/:id/kyc', (req, res) => {
  const { status, isApproved } = req.body;
  const seller = db.sellers.find((s) => s.id === req.params.id);
  if (!seller) return res.status(404).json({ error: 'Seller not found' });

  seller.kyc.status = status;
  seller.kyc.verifiedAt = new Date().toISOString();
  if (typeof isApproved === 'boolean') {
    seller.isApproved = isApproved;
  }

  res.json(seller);
});

// Commission & Settlement Reports
app.get('/api/commissions', (req, res) => {
  const { sellerId } = req.query;
  if (sellerId) {
    return res.json(db.commissions.filter((c) => c.sellerId === sellerId));
  }
  // Admin report
  res.json(db.commissions);
});

// Process Seller Settlement (Admin)
app.post('/api/commissions/settle', (req, res) => {
  const { sellerId } = req.body;
  const seller = db.sellers.find((s) => s.id === sellerId);
  if (!seller) return res.status(404).json({ error: 'Seller not found' });

  const unsettled = db.commissions.filter((c) => c.sellerId === sellerId && c.status === 'recorded');
  unsettled.forEach((c) => {
    c.status = 'settled';
    c.settledAt = new Date().toISOString();
  });

  seller.completedSettlement += seller.pendingSettlement;
  seller.pendingSettlement = 0;

  res.json({
    success: true,
    settledCount: unsettled.length,
    settler: seller.businessName,
    message: 'Settlement completed via banking clearing house',
  });
});

// Coupons List & Validate
app.get('/api/coupons', (req, res) => {
  res.json(db.coupons.filter((c) => c.isActive));
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, cartTotal } = req.body;
  const coupon = db.coupons.find(
    (c) => c.code.toUpperCase() === String(code).toUpperCase().trim() && c.isActive
  );

  if (!coupon) {
    return res.status(400).json({ valid: false, error: 'Invalid coupon code' });
  }

  if (cartTotal < coupon.minOrderValue) {
    return res.status(400).json({
      valid: false,
      error: `Minimum cart value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    valid: true,
    coupon,
    discountAmount: Math.round(discount),
    message: `Coupon applied: ₹${Math.round(discount)} saved!`,
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const { recipientId } = req.query;
  if (recipientId) {
    return res.json(
      db.notifications.filter((n) => n.recipientId === recipientId || n.recipientId === 'all')
    );
  }
  res.json(db.notifications);
});

app.post('/api/notifications/mark-read', (req, res) => {
  const { id } = req.body;
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

// Admin Metrics
app.get('/api/admin/metrics', (req, res) => {
  const totalOrders = db.orders.length;
  const grossGMV = db.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const total5PercentCommission = db.commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalSellerDisbursed = db.commissions.reduce((sum, c) => sum + c.netSellerAmount, 0);
  const activeSellers = db.sellers.filter((s) => s.isApproved).length;
  const pendingKycCount = db.sellers.filter((s) => s.kyc.status === 'pending').length;

  res.json({
    totalOrders,
    grossGMV,
    total5PercentCommission,
    totalSellerDisbursed,
    activeSellers,
    pendingKycCount,
    totalProducts: db.products.length,
    platformUpiAccount: db.settings.platformUpiId, // confidential display in admin console
  });
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  res.json(db.settings);
});

// --- VITE MIDDLEWARE (DEV) / STATIC SERVE (PROD) ---
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[PaigamMart] Server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
