export type UserRole = 'customer' | 'seller' | 'admin';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  landmark?: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  savedAddresses: Address[];
  wishlist: string[]; // product IDs
  joinedDate: string;
  isBlocked?: boolean;
}

export interface SellerKYC {
  panNumber: string;
  panDocumentName?: string;
  gstNumber?: string;
  businessAddress: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
  upiId?: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  legalEntityName: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  totalRatingsCount: number;
  kyc: SellerKYC;
  isApproved: boolean;
  isBlocked: boolean;
  totalOrdersFulfilled: number;
  grossSales: number;
  platformCommissionDeducted: number; // 5% total
  netEarnings: number;
  pendingSettlement: number;
  completedSettlement: number;
  joinedDate: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerBusinessName: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  specifications: Record<string, string>;
  mrp: number;
  price: number;
  discountPercent: number;
  stock: number;
  sku: string;
  images: string[];
  videoUrl?: string;
  variants?: ProductVariant[];
  rating: number;
  reviewCount: number;
  badge?: string;
  returnPolicyDays: number;
  isCodAvailable: boolean;
  freeDeliveryThreshold: number;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariantId?: string;
  size?: string;
  color?: string;
  addedAt: string;
}

export type OrderStatus =
  | 'order_placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  sellerId: string;
  sellerBusinessName: string;
  title: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  selectedVariant?: string;
  platformCommissionRate: number; // 0.05 (5%)
  platformCommissionAmount: number; // 5% of item subtotal
  sellerSettlementAmount: number; // 95% of item subtotal
}

export interface OrderTrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  location?: string;
}

export interface ReturnRequest {
  requestedAt: string;
  reason: string;
  details?: string;
  status: 'requested' | 'approved' | 'rejected' | 'pickup_scheduled' | 'refund_completed';
  refundAmount: number;
  approvedAt?: string;
  refundedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  appliedCouponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  paymentDetails?: {
    upiVpa?: string;
    cardLast4?: string;
    bankName?: string;
    walletName?: string;
    gatewayRef?: string;
  };
  orderStatus: OrderStatus;
  orderDate: string;
  estimatedDeliveryDate: string;
  deliveredDate?: string;
  trackingSteps: OrderTrackingStep[];
  courierName?: string;
  courierTrackingNumber?: string;
  cancellationReason?: string;
  returnRequest?: ReturnRequest;
  
  // Commission & Settlement record
  totalPlatformCommission: number; // 5% total
  totalSellerPayable: number; // 95% total
  settlementStatus: 'pending' | 'settled';
  settlementDate?: string;
}

export interface CommissionTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  sellerId: string;
  sellerBusinessName: string;
  grossAmount: number;
  commissionRate: number; // 5%
  commissionAmount: number; // 5%
  gatewayFee: number;
  taxesDeducted: number;
  netSellerAmount: number;
  platformAccountUpi: string; // 7880265898@ybl (confidential, admin/system only)
  sellerAccountInfo: string;
  status: 'recorded' | 'settled';
  createdAt: string;
  settledAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // userId or 'admin' or sellerId
  title: string;
  message: string;
  type: 'order' | 'payment' | 'kyc' | 'commission' | 'promotion' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MarketplaceSettings {
  commissionRatePercent: number; // 5
  platformUpiId: string; // "7880265898@ybl"
  freeDeliveryThreshold: number; // 499
  standardDeliveryFee: number; // 49
  isCodEnabled: boolean;
  supportPhone: string;
  supportEmail: string;
}
