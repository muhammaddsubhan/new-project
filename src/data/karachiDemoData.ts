import type {
  ClothingItemPrice,
  DiscountCoupon,
  LaundryComplaint,
  LaundryOrder,
  LaundryProvider,
  OrderStatus,
  PlatformSettings,
  PlatformTransaction,
  ProviderReview,
  ProviderServiceConfig,
  SavedAddress,
  ServiceType,
  StudentPlanDefinition,
  StudentSubscription,
  UserProfile,
} from '../types/washmate';

export const KARACHI_AREAS = [
  'Gulshan-e-Iqbal',
  'Gulistan-e-Jauhar',
  'North Nazimabad',
  'Federal B Area',
  'Saddar',
  'DHA',
  'Clifton',
  'PECHS',
  'Bahadurabad',
  'Korangi',
  'Malir',
  'Shahrah-e-Faisal',
] as const;

export const KARACHI_AREA_META: Record<string, { zone: string; hubs: string[] }> = {
  'Gulshan-e-Iqbal': { zone: 'East', hubs: ['NED University Gate', 'Maskan Chowrangi', 'NIPA', 'Block 13-D'] },
  'Gulistan-e-Jauhar': { zone: 'East', hubs: ['University of Karachi Road', 'Kamran Chowrangi', 'Johar Mor', 'Block 12'] },
  'North Nazimabad': { zone: 'Central', hubs: ['Hyderi Market', 'Five Star Chowrangi', 'Sakhi Hassan', 'Block H'] },
  'Federal B Area': { zone: 'Central', hubs: ['Water Pump', 'Ayesha Manzil', 'Karimabad', 'Block 14'] },
  Saddar: { zone: 'South', hubs: ['Empress Market', 'Regal Chowk', 'Zainab Market', 'Burns Road'] },
  DHA: { zone: 'South', hubs: ['Phase 5 Badar Commercial', 'Phase 6 Bukhari', 'Phase 2 Ext', 'Phase 8'] },
  Clifton: { zone: 'South', hubs: ['Block 2 Boat Basin', 'Block 4 Teen Talwar', 'Block 5', 'Do Talwar'] },
  PECHS: { zone: 'East', hubs: ['Tariq Road', 'Nursery', 'Block 2', 'Block 6'] },
  Bahadurabad: { zone: 'East', hubs: ['Char Minar Chowrangi', 'Dhoraji', 'BMCHS', 'Alamgir Road'] },
  Korangi: { zone: 'Korangi', hubs: ['Korangi Crossing', 'Landhi Industrial', 'Nasir Jump', 'Sector 32'] },
  Malir: { zone: 'Malir', hubs: ['Malir Cantt', 'Model Colony', 'Malir Halt', 'Jinnah Avenue'] },
  'Shahrah-e-Faisal': { zone: 'Corridor', hubs: ['Nursery Flyover', 'FTC Building', 'Karsaz', 'Drigh Road'] },
};

export const ALL_SERVICES: ServiceType[] = [
  'Washing',
  'Drying',
  'Ironing',
  'Dry Cleaning',
  'Wash + Dry',
  'Wash + Dry + Fold',
  'Wash + Dry + Iron',
];

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'Order Placed',
  'Provider Accepted',
  'Pickup Scheduled',
  'Clothes Collected',
  'Washing in Progress',
  'Drying in Progress',
  'Ironing / Folding',
  'Ready for Delivery',
  'Out for Delivery',
  'Delivered',
];

export const SPECIAL_INSTRUCTION_PRESETS = [
  'Wash separately',
  'Do not use bleach',
  'Handle delicate fabric carefully',
  'Do not iron',
  'Keep white and colored clothes separate',
];

export const TIME_SLOTS = [
  '09:00 AM – 11:00 AM',
  '11:00 AM – 01:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
];

export const CATALOG_ITEMS_TEMPLATE: Array<{
  itemName: string;
  category: ClothingItemPrice['category'];
  baseWash: number;
}> = [
  { itemName: 'T-shirt', category: 'Tops', baseWash: 40 },
  { itemName: 'Shirt', category: 'Tops', baseWash: 50 },
  { itemName: 'Trouser', category: 'Bottoms', baseWash: 60 },
  { itemName: 'Jeans', category: 'Bottoms', baseWash: 70 },
  { itemName: 'Shalwar', category: 'Traditional', baseWash: 50 },
  { itemName: 'Kameez', category: 'Traditional', baseWash: 60 },
  { itemName: 'Kurta', category: 'Traditional', baseWash: 65 },
  { itemName: 'Hoodie', category: 'Outerwear', baseWash: 100 },
  { itemName: 'Jacket', category: 'Outerwear', baseWash: 140 },
  { itemName: 'Bedsheet', category: 'Bedding & Bath', baseWash: 100 },
  { itemName: 'Pillow cover', category: 'Bedding & Bath', baseWash: 30 },
  { itemName: 'Towel', category: 'Bedding & Bath', baseWash: 50 },
  { itemName: 'Suit', category: 'Formal', baseWash: 250 },
  { itemName: 'Socks', category: 'Accessories', baseWash: 20 },
  { itemName: 'Other', category: 'Accessories', baseWash: 60 },
];

export const DEFAULT_STUDENT_PLANS: StudentPlanDefinition[] = [
  {
    id: 'basic',
    name: 'Basic Hostel Plan',
    targetAudience: 'For solo hostel students with light weekly loads',
    monthlyLimit: 20,
    pricePkr: 999,
    extraChargePerItemPkr: 55,
    includedServices: ['Wash + Dry + Fold', 'Weekly hostel gate pickup'],
    pickupAndDeliveryNote: '2 free scheduled pickups & deliveries per month (extra trips Rs. 50 each)',
    validityDays: 30,
  },
  {
    id: 'standard',
    name: 'Standard Campus Plan',
    targetAudience: 'For university students at NED, KU, IBA & FAST',
    monthlyLimit: 40,
    pricePkr: 1799,
    extraChargePerItemPkr: 45,
    includedServices: ['Wash + Dry + Fold', 'Steam Ironing (up to 15 items)', 'Hostel room doorstep pickup'],
    pickupAndDeliveryNote: '4 free weekly pickups & deliveries per month included',
    validityDays: 30,
  },
  {
    id: 'premium',
    name: 'Premium Scholar Plan',
    targetAudience: 'For heavy wardrobes, lab coats & formal presentations',
    monthlyLimit: 60,
    pricePkr: 2499,
    extraChargePerItemPkr: 40,
    includedServices: ['Wash + Dry + Iron', 'Priority 24h turnaround', '1 Dry-Clean suit/blazer credit'],
    pickupAndDeliveryNote: 'Unlimited scheduled campus & hostel pickups included',
    validityDays: 30,
  },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'global',
  commissionPercent: 12,
  referralRewardPkr: 150,
  studentPlans: DEFAULT_STUDENT_PLANS,
  whatsappNotificationsEnabled: true,
  updatedAt: '2026-11-10T09:00:00.000Z',
};

export const DEMO_USERS: Record<'customer' | 'provider' | 'admin', UserProfile> = {
  customer: {
    uid: 'demo-customer-ali',
    displayName: 'Ali Raza Siddiqui',
    email: 'ali.raza.demo@washmate.pk',
    phone: '+92 321 2458910',
    role: 'customer',
    referralCode: 'ALI-KHI150',
    referralCreditsPkr: 150,
    favoriteProviderIds: ['demo-prov-gulshan', 'demo-prov-jauhar'],
    suspended: false,
    isDemo: true,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-11-12T10:00:00.000Z',
  },
  provider: {
    uid: 'demo-owner-gulshan',
    displayName: 'Tariq Mahmood (Maskan Steam Care)',
    email: 'tariq.partner.demo@washmate.pk',
    phone: '+92 300 8291402',
    role: 'provider',
    referralCode: 'MASKAN-WM',
    referralCreditsPkr: 0,
    favoriteProviderIds: [],
    suspended: false,
    isDemo: true,
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-11-12T08:00:00.000Z',
  },
  admin: {
    uid: 'demo-admin-washmate',
    displayName: 'WashMate Karachi Operations',
    email: 'shaziabegum2995@gmail.com',
    phone: '+92 311 1122334',
    role: 'admin',
    referralCode: 'ADMIN-WM',
    referralCreditsPkr: 0,
    favoriteProviderIds: [],
    suspended: false,
    isDemo: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-11-12T08:00:00.000Z',
  },
};

export const DEMO_PROVIDERS: LaundryProvider[] = [
  {
    id: 'demo-prov-gulshan',
    ownerId: 'demo-owner-gulshan',
    businessName: 'Maskan Steam & Wash Atelier',
    description:
      'Trusted neighborhood garment care near NED University and Maskan Chowrangi. Separate color-safe drums, steam pressing, and dedicated hostel rider pickups.',
    coverImageUrl: '/src/assets/images/provider_gulshan_atelier_1794720458063.jpg',
    phone: '+92 300 8291402',
    email: 'maskan.atelier@washmate.pk',
    address: 'Shop 4, Al-Habib Arcade, Block 7, Gulshan-e-Iqbal, Karachi',
    primaryArea: 'Gulshan-e-Iqbal',
    serviceAreas: ['Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'Federal B Area', 'PECHS'],
    operatingHours: '08:00 AM – 10:00 PM (Mon–Sun)',
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: true,
    expressSurchargePkr: 150,
    pickupFeePkr: 50,
    deliveryFeePkr: 50,
    minOrderPkr: 250,
    turnaroundHours: 24,
    verificationStatus: 'Approved',
    isDemo: true,
    rating: 4.8,
    reviewCount: 142,
    completedOrdersCount: 518,
    startingPricePkr: 40,
    availableServices: ['Washing', 'Drying', 'Ironing', 'Wash + Dry', 'Wash + Dry + Fold', 'Wash + Dry + Iron'],
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-11-12T08:00:00.000Z',
  },
  {
    id: 'demo-prov-clifton',
    ownerId: 'demo-owner-clifton',
    businessName: 'Clifton Crest Dry Cleaners',
    description:
      'Specialist dry-cleaning and bespoke formal garment pressing serving Clifton, DHA Phases 1–8, and Saddar corporate offices with temperature-controlled care.',
    coverImageUrl: '/src/assets/images/provider_clifton_care_1794720457934.jpg',
    phone: '+92 333 2104599',
    email: 'clifton.crest@washmate.pk',
    address: 'Suite 2, Marine Promenade, Block 4, Clifton, Karachi',
    primaryArea: 'Clifton',
    serviceAreas: ['Clifton', 'DHA', 'Saddar', 'Shahrah-e-Faisal'],
    operatingHours: '09:00 AM – 09:00 PM (Mon–Sat)',
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: true,
    expressSurchargePkr: 250,
    pickupFeePkr: 80,
    deliveryFeePkr: 80,
    minOrderPkr: 500,
    turnaroundHours: 36,
    verificationStatus: 'Approved',
    isDemo: true,
    rating: 4.9,
    reviewCount: 98,
    completedOrdersCount: 340,
    startingPricePkr: 60,
    availableServices: ['Washing', 'Ironing', 'Dry Cleaning', 'Wash + Dry + Iron'],
    createdAt: '2026-09-20T09:00:00.000Z',
    updatedAt: '2026-11-10T09:00:00.000Z',
  },
  {
    id: 'demo-prov-jauhar',
    ownerId: 'demo-owner-jauhar',
    businessName: 'Campus Spin Hostel Laundry',
    description:
      'Built for university students and hostel residents along University Road. Budget per-piece pricing, zero-mix wash bags, and fast 18-hour turnaround.',
    coverImageUrl: '/src/assets/images/provider_student_wash_1794720458699.jpg',
    phone: '+92 315 8941205',
    email: 'campus.spin@washmate.pk',
    address: 'Plot B-19, Kamran Chowrangi, Block 12, Gulistan-e-Jauhar, Karachi',
    primaryArea: 'Gulistan-e-Jauhar',
    serviceAreas: ['Gulistan-e-Jauhar', 'Gulshan-e-Iqbal', 'Malir', 'Shahrah-e-Faisal'],
    operatingHours: '08:00 AM – 11:00 PM (Daily)',
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: true,
    expressSurchargePkr: 100,
    pickupFeePkr: 30,
    deliveryFeePkr: 30,
    minOrderPkr: 200,
    turnaroundHours: 18,
    verificationStatus: 'Approved',
    isDemo: true,
    rating: 4.7,
    reviewCount: 215,
    completedOrdersCount: 812,
    startingPricePkr: 35,
    availableServices: ['Washing', 'Drying', 'Wash + Dry', 'Wash + Dry + Fold'],
    createdAt: '2026-09-25T10:00:00.000Z',
    updatedAt: '2026-11-11T10:00:00.000Z',
  },
  {
    id: 'demo-prov-nazimabad',
    ownerId: 'demo-owner-nazimabad',
    businessName: 'Hyderi Fresh & Press Co.',
    description:
      'Family-run laundry & steam ironing house serving North Nazimabad and Federal B Area for 12 years. Crisp collar starching and delicate lawn care.',
    coverImageUrl: '/src/assets/images/hero_karachi_laundry_1794720457197.jpg',
    phone: '+92 345 2019384',
    email: 'hyderi.fresh@washmate.pk',
    address: 'Shop 11, Block H Market, Near Five Star Chowrangi, North Nazimabad, Karachi',
    primaryArea: 'North Nazimabad',
    serviceAreas: ['North Nazimabad', 'Federal B Area', 'Gulshan-e-Iqbal'],
    operatingHours: '09:00 AM – 09:30 PM (Tue–Sun)',
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: false,
    expressSurchargePkr: 0,
    pickupFeePkr: 40,
    deliveryFeePkr: 40,
    minOrderPkr: 250,
    turnaroundHours: 24,
    verificationStatus: 'Approved',
    isDemo: true,
    rating: 4.6,
    reviewCount: 74,
    completedOrdersCount: 289,
    startingPricePkr: 40,
    availableServices: ['Washing', 'Ironing', 'Dry Cleaning', 'Wash + Dry + Fold', 'Wash + Dry + Iron'],
    createdAt: '2026-10-02T11:00:00.000Z',
    updatedAt: '2026-11-10T11:00:00.000Z',
  },
  {
    id: 'demo-prov-pechs',
    ownerId: 'demo-owner-pechs',
    businessName: 'Tariq Road Express Wash',
    description:
      'Same-day business shirt pressing and wash-and-fold service covering PECHS, Bahadurabad, Shahrah-e-Faisal, and Korangi industrial offices.',
    coverImageUrl: '/src/assets/images/section_partner_owner_1794720459456.jpg',
    phone: '+92 322 4910293',
    email: 'tariqroad.express@washmate.pk',
    address: 'Ground Floor, Noor Trade Centre, Block 2, PECHS, Karachi',
    primaryArea: 'PECHS',
    serviceAreas: ['PECHS', 'Bahadurabad', 'Shahrah-e-Faisal', 'Saddar', 'Korangi'],
    operatingHours: '08:30 AM – 10:00 PM (Mon–Sun)',
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: true,
    expressSurchargePkr: 180,
    pickupFeePkr: 50,
    deliveryFeePkr: 50,
    minOrderPkr: 300,
    turnaroundHours: 16,
    verificationStatus: 'Approved',
    isDemo: true,
    rating: 4.8,
    reviewCount: 119,
    completedOrdersCount: 410,
    startingPricePkr: 45,
    availableServices: ['Washing', 'Drying', 'Ironing', 'Dry Cleaning', 'Wash + Dry', 'Wash + Dry + Fold', 'Wash + Dry + Iron'],
    createdAt: '2026-10-05T12:00:00.000Z',
    updatedAt: '2026-11-12T12:00:00.000Z',
  },
  {
    id: 'demo-prov-pending',
    ownerId: 'demo-owner-korangi',
    businessName: 'Korangi CleanHub Laundry',
    description:
      'Newly registered industrial and residential wash center serving Korangi, Malir, and DHA Phase 2 Extension.',
    coverImageUrl: '/src/assets/images/provider_student_wash_1794720458699.jpg',
    phone: '+92 312 7788990',
    email: 'korangi.cleanhub@washmate.pk',
    address: 'Plot 14, Sector 32-B, Korangi Crossing, Karachi',
    primaryArea: 'Korangi',
    serviceAreas: ['Korangi', 'Malir', 'DHA'],
    operatingHours: '09:00 AM – 09:00 PM',
    pickupAvailable: true,
    deliveryAvailable: true,
    expressAvailable: false,
    expressSurchargePkr: 0,
    pickupFeePkr: 50,
    deliveryFeePkr: 50,
    minOrderPkr: 300,
    turnaroundHours: 24,
    verificationStatus: 'Pending',
    isDemo: true,
    rating: 0,
    reviewCount: 0,
    completedOrdersCount: 0,
    startingPricePkr: 40,
    availableServices: ['Washing', 'Drying', 'Wash + Dry + Fold'],
    createdAt: '2026-11-13T12:00:00.000Z',
    updatedAt: '2026-11-13T12:00:00.000Z',
  },
];

export function buildProviderPricingItems(provider: LaundryProvider): ClothingItemPrice[] {
  const multiplier =
    provider.id === 'demo-prov-clifton'
      ? 1.3
      : provider.id === 'demo-prov-jauhar'
        ? 0.9
        : provider.id === 'demo-prov-pechs'
          ? 1.1
          : 1.0;

  return CATALOG_ITEMS_TEMPLATE.map((tpl, idx) => {
    const wash = Math.round((tpl.baseWash * multiplier) / 5) * 5;
    const pricesByService: Partial<Record<ServiceType, number>> = {};

    if (provider.availableServices.includes('Washing')) {
      pricesByService['Washing'] = wash;
    }
    if (provider.availableServices.includes('Drying')) {
      pricesByService['Drying'] = Math.max(15, Math.round((wash * 0.5) / 5) * 5);
    }
    if (provider.availableServices.includes('Ironing')) {
      pricesByService['Ironing'] = Math.max(20, Math.round((wash * 0.65) / 5) * 5);
    }
    if (provider.availableServices.includes('Dry Cleaning')) {
      pricesByService['Dry Cleaning'] = Math.round((wash * 2.4) / 10) * 10;
    }
    if (provider.availableServices.includes('Wash + Dry')) {
      pricesByService['Wash + Dry'] = Math.round((wash * 1.35) / 5) * 5;
    }
    if (provider.availableServices.includes('Wash + Dry + Fold')) {
      pricesByService['Wash + Dry + Fold'] = Math.round((wash * 1.5) / 5) * 5;
    }
    if (provider.availableServices.includes('Wash + Dry + Iron')) {
      pricesByService['Wash + Dry + Iron'] = Math.round((wash * 1.85) / 5) * 5;
    }

    return {
      id: `${provider.id}_item_${idx + 1}`,
      providerId: provider.id,
      ownerId: provider.ownerId,
      itemName: tpl.itemName,
      category: tpl.category,
      pricesByService,
      available: true,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  });
}

export const DEMO_CLOTHING_ITEMS: ClothingItemPrice[] = DEMO_PROVIDERS.flatMap(buildProviderPricingItems);

export const DEMO_PROVIDER_SERVICES: ProviderServiceConfig[] = DEMO_PROVIDERS.flatMap((provider) =>
  ALL_SERVICES.map((serviceType, index) => ({
    id: `${provider.id}_svc_${index + 1}`,
    providerId: provider.id,
    ownerId: provider.ownerId,
    serviceType,
    enabled: provider.availableServices.includes(serviceType),
    turnaroundHours: serviceType === 'Dry Cleaning' ? Math.max(36, provider.turnaroundHours) : provider.turnaroundHours,
    description: `${serviceType} handled with fabric-safe sorting and clean water filtration.`,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  }))
);

export const DEMO_COUPONS: DiscountCoupon[] = [
  {
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderPkr: 250,
    maxDiscountPkr: 50,
    active: true,
    expiryDate: '2027-12-31',
    usageCount: 34,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    code: 'KARACHI15',
    discountType: 'percent',
    discountValue: 15,
    minOrderPkr: 400,
    maxDiscountPkr: 250,
    active: true,
    expiryDate: '2027-12-31',
    usageCount: 82,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    code: 'STUDENT100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderPkr: 500,
    maxDiscountPkr: 100,
    active: true,
    expiryDate: '2027-12-31',
    usageCount: 51,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
];

export const DEMO_ADDRESSES: SavedAddress[] = [
  {
    id: 'demo-addr-1',
    userId: 'demo-customer-ali',
    label: 'NED Boys Hostel',
    area: 'Gulshan-e-Iqbal',
    fullAddress: 'Main University Road, Opposite NED Gate 2, Gulshan-e-Iqbal, Karachi',
    hostelOrBuilding: 'Sir Syed Boys Hostel Block B',
    roomNumber: 'Room 214',
    isDefault: true,
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-05T10:00:00.000Z',
  },
  {
    id: 'demo-addr-2',
    userId: 'demo-customer-ali',
    label: 'Family Home',
    area: 'North Nazimabad',
    fullAddress: 'House R-42, Block L, Near Five Star Chowrangi, North Nazimabad, Karachi',
    hostelOrBuilding: 'R-42 Ground Floor',
    roomNumber: '',
    isDefault: false,
    createdAt: '2026-10-12T10:00:00.000Z',
    updatedAt: '2026-10-12T10:00:00.000Z',
  },
];

export const DEMO_SUBSCRIPTIONS: StudentSubscription[] = [
  {
    id: 'demo-sub-1',
    userId: 'demo-customer-ali',
    planId: 'standard',
    planName: 'Standard Campus Plan',
    monthlyLimit: 40,
    clothesUsed: 14,
    pricePkr: 1799,
    extraChargePerItemPkr: 45,
    status: 'Active',
    startDate: '2026-11-01',
    endDate: '2026-12-01',
    createdAt: '2026-11-01T09:00:00.000Z',
    updatedAt: '2026-11-11T14:00:00.000Z',
  },
];

export const DEMO_ORDERS: LaundryOrder[] = [
  {
    id: 'demo-order-1042',
    orderNumber: 'WM-2026-1042',
    customerId: 'demo-customer-ali',
    providerId: 'demo-prov-gulshan',
    providerOwnerId: 'demo-owner-gulshan',
    providerName: 'Maskan Steam & Wash Atelier',
    customerName: 'Ali Raza Siddiqui',
    customerPhone: '+92 321 2458910',
    customerEmail: 'ali.raza.demo@washmate.pk',
    pickupAddress: 'Main University Road, Opposite NED Gate 2, Gulshan-e-Iqbal, Karachi',
    area: 'Gulshan-e-Iqbal',
    hostelOrBuilding: 'Sir Syed Boys Hostel Block B',
    roomNumber: 'Room 214',
    pickupDate: '2026-11-14',
    pickupTimeSlot: '11:00 AM – 01:00 PM',
    deliveryDate: '2026-11-15',
    deliveryTimeSlot: '04:00 PM – 06:00 PM',
    specialInstructions: 'Keep white and colored clothes separate. Do not use bleach.',
    isExpress: false,
    items: [
      { clothingItemId: 'demo-prov-gulshan_item_1', itemName: 'T-shirt', serviceType: 'Washing', unitPricePkr: 40, quantity: 5 },
      { clothingItemId: 'demo-prov-gulshan_item_3', itemName: 'Trouser', serviceType: 'Washing', unitPricePkr: 60, quantity: 3 },
      { clothingItemId: 'demo-prov-gulshan_item_4', itemName: 'Jeans', serviceType: 'Washing', unitPricePkr: 70, quantity: 2 },
    ],
    subtotalPkr: 520,
    pickupFeePkr: 50,
    deliveryFeePkr: 50,
    expressFeePkr: 0,
    discountPkr: 0,
    commissionPkr: 62,
    grandTotalPkr: 620,
    paymentMethod: 'COD',
    paymentStatus: 'COD Scheduled',
    status: 'Washing in Progress',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-11-14T09:15:00.000Z', note: 'Booked via WashMate', updatedByRole: 'customer' },
      { status: 'Provider Accepted', timestamp: '2026-11-14T09:28:00.000Z', note: 'Rider assigned for Maskan pickup', updatedByRole: 'provider' },
      { status: 'Pickup Scheduled', timestamp: '2026-11-14T10:10:00.000Z', note: 'Pickup slot 11:00 AM – 01:00 PM confirmed', updatedByRole: 'provider' },
      { status: 'Clothes Collected', timestamp: '2026-11-14T11:45:00.000Z', note: '10 garments verified & tagged', updatedByRole: 'provider' },
      { status: 'Washing in Progress', timestamp: '2026-11-14T13:20:00.000Z', note: 'Whites separated per customer note', updatedByRole: 'provider' },
    ],
    collectedItemCount: 10,
    hasReviewed: false,
    isDemo: true,
    createdAt: '2026-11-14T09:15:00.000Z',
    updatedAt: '2026-11-14T13:20:00.000Z',
  },
  {
    id: 'demo-order-1019',
    orderNumber: 'WM-2026-1019',
    customerId: 'demo-customer-ali',
    providerId: 'demo-prov-jauhar',
    providerOwnerId: 'demo-owner-jauhar',
    providerName: 'Campus Spin Hostel Laundry',
    customerName: 'Ali Raza Siddiqui',
    customerPhone: '+92 321 2458910',
    customerEmail: 'ali.raza.demo@washmate.pk',
    pickupAddress: 'Main University Road, Opposite NED Gate 2, Gulshan-e-Iqbal, Karachi',
    area: 'Gulshan-e-Iqbal',
    hostelOrBuilding: 'Sir Syed Boys Hostel Block B',
    roomNumber: 'Room 214',
    pickupDate: '2026-11-08',
    pickupTimeSlot: '04:00 PM – 06:00 PM',
    deliveryDate: '2026-11-09',
    deliveryTimeSlot: '04:00 PM – 06:00 PM',
    specialInstructions: 'Wash separately',
    isExpress: true,
    items: [
      { clothingItemId: 'demo-prov-jauhar_item_6', itemName: 'Kameez', serviceType: 'Wash + Dry + Fold', unitPricePkr: 85, quantity: 3 },
      { clothingItemId: 'demo-prov-jauhar_item_5', itemName: 'Shalwar', serviceType: 'Wash + Dry + Fold', unitPricePkr: 70, quantity: 3 },
    ],
    subtotalPkr: 465,
    pickupFeePkr: 30,
    deliveryFeePkr: 30,
    expressFeePkr: 100,
    discountPkr: 50,
    couponCode: 'WELCOME50',
    commissionPkr: 56,
    grandTotalPkr: 575,
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusHistory: [
      { status: 'Order Placed', timestamp: '2026-11-08T14:00:00.000Z', updatedByRole: 'customer' },
      { status: 'Provider Accepted', timestamp: '2026-11-08T14:12:00.000Z', updatedByRole: 'provider' },
      { status: 'Clothes Collected', timestamp: '2026-11-08T16:40:00.000Z', note: '6 pieces logged', updatedByRole: 'provider' },
      { status: 'Washing in Progress', timestamp: '2026-11-08T18:00:00.000Z', updatedByRole: 'provider' },
      { status: 'Ready for Delivery', timestamp: '2026-11-09T11:30:00.000Z', updatedByRole: 'provider' },
      { status: 'Delivered', timestamp: '2026-11-09T16:15:00.000Z', note: 'Delivered to Room 214', updatedByRole: 'provider' },
    ],
    collectedItemCount: 6,
    hasReviewed: true,
    isDemo: true,
    createdAt: '2026-11-08T14:00:00.000Z',
    updatedAt: '2026-11-09T16:15:00.000Z',
  },
];

export const DEMO_REVIEWS: ProviderReview[] = [
  {
    id: 'demo-rev-1',
    orderId: 'demo-order-1019',
    providerId: 'demo-prov-jauhar',
    providerOwnerId: 'demo-owner-jauhar',
    customerId: 'demo-customer-ali',
    customerName: 'Ali Raza Siddiqui',
    rating: 5,
    comment: 'Picked up straight from Sir Syed Hostel gate on time and returned folded within 18 hours without a single missing piece.',
    providerReply: 'Thank you Ali! Always glad to keep hostel laundry effortless for NED students.',
    createdAt: '2026-11-09T18:00:00.000Z',
    updatedAt: '2026-11-09T19:15:00.000Z',
  },
  {
    id: 'demo-rev-2',
    orderId: 'demo-order-ext-1',
    providerId: 'demo-prov-gulshan',
    providerOwnerId: 'demo-owner-gulshan',
    customerId: 'demo-cust-sana',
    customerName: 'Sana Farooq',
    rating: 5,
    comment: 'White office shirts came back crisply steam-pressed and neatly wrapped. Clear PKR pricing with zero surprise charges.',
    providerReply: 'Appreciated Sana! Look forward to your next weekly pickup.',
    createdAt: '2026-11-07T15:30:00.000Z',
    updatedAt: '2026-11-07T17:00:00.000Z',
  },
  {
    id: 'demo-rev-3',
    orderId: 'demo-order-ext-2',
    providerId: 'demo-prov-clifton',
    providerOwnerId: 'demo-owner-clifton',
    customerId: 'demo-cust-hamza',
    customerName: 'Hamza Tariq',
    rating: 5,
    comment: 'Sent two navy suits and a formal sherwani for dry cleaning before a wedding in DHA Phase 6. Spotless work.',
    createdAt: '2026-11-05T11:20:00.000Z',
    updatedAt: '2026-11-05T11:20:00.000Z',
  },
];

export const DEMO_COMPLAINTS: LaundryComplaint[] = [
  {
    id: 'demo-comp-1',
    orderId: 'demo-order-ext-9',
    customerId: 'demo-cust-sana',
    providerId: 'demo-prov-nazimabad',
    providerOwnerId: 'demo-owner-nazimabad',
    type: 'Late Delivery',
    description: 'Evening delivery slot shifted from 6 PM to 9 PM due to generator maintenance in Block H.',
    affectedItemsCount: 0,
    status: 'Resolved',
    resolutionNote: 'Provider apologized and waived Rs. 40 delivery fee for the inconvenience.',
    createdAt: '2026-11-04T19:00:00.000Z',
    updatedAt: '2026-11-05T10:00:00.000Z',
  },
];

export const DEMO_TRANSACTIONS: PlatformTransaction[] = [
  {
    id: 'demo-tx-1042',
    orderId: 'demo-order-1042',
    customerId: 'demo-customer-ali',
    providerId: 'demo-prov-gulshan',
    providerOwnerId: 'demo-owner-gulshan',
    amountPkr: 620,
    commissionPkr: 62,
    providerNetPkr: 558,
    paymentMethod: 'COD',
    status: 'COD Pending',
    createdAt: '2026-11-14T09:15:00.000Z',
  },
  {
    id: 'demo-tx-1019',
    orderId: 'demo-order-1019',
    customerId: 'demo-customer-ali',
    providerId: 'demo-prov-jauhar',
    providerOwnerId: 'demo-owner-jauhar',
    amountPkr: 575,
    commissionPkr: 56,
    providerNetPkr: 519,
    paymentMethod: 'COD',
    status: 'Settled',
    createdAt: '2026-11-08T14:00:00.000Z',
  },
];
