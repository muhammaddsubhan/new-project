export type UserRole = 'customer' | 'provider' | 'admin';

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export type ServiceType =
  | 'Washing'
  | 'Drying'
  | 'Ironing'
  | 'Dry Cleaning'
  | 'Wash + Dry'
  | 'Wash + Dry + Fold'
  | 'Wash + Dry + Iron';

export type OrderStatus =
  | 'Order Placed'
  | 'Provider Accepted'
  | 'Pickup Scheduled'
  | 'Clothes Collected'
  | 'Washing in Progress'
  | 'Drying in Progress'
  | 'Ironing / Folding'
  | 'Ready for Delivery'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'COD' | 'JazzCash' | 'Easypaisa';

export type PaymentStatus = 'Pending' | 'COD Scheduled' | 'Awaiting Gateway' | 'Paid' | 'Failed';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  referralCreditsPkr: number;
  favoriteProviderIds: string[];
  suspended: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LaundryProvider {
  id: string;
  ownerId: string;
  businessName: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone: string;
  email: string;
  address: string;
  primaryArea: string;
  serviceAreas: string[];
  operatingHours: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  expressAvailable: boolean;
  expressSurchargePkr: number;
  pickupFeePkr: number;
  deliveryFeePkr: number;
  minOrderPkr: number;
  turnaroundHours: number;
  verificationStatus: VerificationStatus;
  isDemo: boolean;
  rating: number;
  reviewCount: number;
  completedOrdersCount: number;
  startingPricePkr: number;
  availableServices: ServiceType[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderServiceConfig {
  id: string;
  providerId: string;
  ownerId: string;
  serviceType: ServiceType;
  enabled: boolean;
  turnaroundHours: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingItemPrice {
  id: string;
  providerId: string;
  ownerId: string;
  itemName: string;
  category: 'Tops' | 'Bottoms' | 'Traditional' | 'Outerwear' | 'Bedding & Bath' | 'Formal' | 'Accessories';
  pricesByService: Partial<Record<ServiceType, number>>;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  clothingItemId: string;
  itemName: string;
  serviceType: ServiceType;
  unitPricePkr: number;
  quantity: number;
}

export interface ShoppingCart {
  userId: string;
  providerId: string;
  providerName: string;
  items: CartItem[];
  couponCode: string;
  isExpress: boolean;
  updatedAt: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedByRole: UserRole | 'system';
}

export interface LaundryOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  providerId: string;
  providerOwnerId: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: string;
  area: string;
  hostelOrBuilding?: string;
  roomNumber?: string;
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  specialInstructions?: string;
  isExpress: boolean;
  items: CartItem[];
  subtotalPkr: number;
  pickupFeePkr: number;
  deliveryFeePkr: number;
  expressFeePkr: number;
  discountPkr: number;
  couponCode?: string;
  commissionPkr: number;
  grandTotalPkr: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  collectedItemCount: number;
  protectionNote?: string;
  hasReviewed: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPlanDefinition {
  id: 'basic' | 'standard' | 'premium';
  name: string;
  targetAudience: string;
  monthlyLimit: number;
  pricePkr: number;
  extraChargePerItemPkr: number;
  includedServices: string[];
  pickupAndDeliveryNote: string;
  validityDays: number;
}

export interface StudentSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  monthlyLimit: number;
  clothesUsed: number;
  pricePkr: number;
  extraChargePerItemPkr: number;
  status: 'Active' | 'Pending Payment' | 'Cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderReview {
  id: string;
  orderId: string;
  providerId: string;
  providerOwnerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  providerReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCoupon {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderPkr: number;
  maxDiscountPkr: number;
  active: boolean;
  expiryDate: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  area: string;
  fullAddress: string;
  hostelOrBuilding?: string;
  roomNumber?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: 'in_app' | 'whatsapp_ready';
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface LaundryComplaint {
  id: string;
  orderId: string;
  customerId: string;
  providerId: string;
  providerOwnerId: string;
  type: 'Missing Item' | 'Damaged Garment' | 'Late Delivery' | 'Billing' | 'Other';
  description: string;
  affectedItemsCount: number;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Rejected';
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformTransaction {
  id: string;
  orderId: string;
  customerId: string;
  providerId: string;
  providerOwnerId: string;
  amountPkr: number;
  commissionPkr: number;
  providerNetPkr: number;
  paymentMethod: PaymentMethod;
  status: 'COD Pending' | 'Gateway Unconfigured' | 'Settled' | 'Refunded';
  createdAt: string;
}

export interface PlatformSettings {
  id: string;
  commissionPercent: number;
  referralRewardPkr: number;
  studentPlans: StudentPlanDefinition[];
  whatsappNotificationsEnabled: boolean;
  updatedAt: string;
}
