import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  ALL_SERVICES,
  CATALOG_ITEMS_TEMPLATE,
  DEFAULT_PLATFORM_SETTINGS,
  DEMO_ADDRESSES,
  DEMO_CLOTHING_ITEMS,
  DEMO_COMPLAINTS,
  DEMO_COUPONS,
  DEMO_ORDERS,
  DEMO_PROVIDER_SERVICES,
  DEMO_PROVIDERS,
  DEMO_REVIEWS,
  DEMO_SUBSCRIPTIONS,
  DEMO_TRANSACTIONS,
  DEMO_USERS,
} from '../data/karachiDemoData';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  storage,
  testFirestoreConnection,
} from '../lib/firebase';
import type {
  AppNotification,
  CartItem,
  ClothingItemPrice,
  DiscountCoupon,
  LaundryComplaint,
  LaundryOrder,
  LaundryProvider,
  OrderStatus,
  PaymentMethod,
  PlatformSettings,
  PlatformTransaction,
  ProviderReview,
  ProviderServiceConfig,
  SavedAddress,
  ServiceType,
  ShoppingCart,
  StudentPlanDefinition,
  StudentSubscription,
  UserProfile,
  UserRole,
  VerificationStatus,
} from '../types/washmate';

interface DemoStorageState {
  activeDemoRole: UserRole | null;
  users: UserProfile[];
  providers: LaundryProvider[];
  providerServices: ProviderServiceConfig[];
  clothingItems: ClothingItemPrice[];
  orders: LaundryOrder[];
  carts: Record<string, ShoppingCart>;
  subscriptions: StudentSubscription[];
  reviews: ProviderReview[];
  coupons: DiscountCoupon[];
  addresses: SavedAddress[];
  notifications: AppNotification[];
  complaints: LaundryComplaint[];
  transactions: PlatformTransaction[];
  platformSettings: PlatformSettings;
}

const DEMO_STORAGE_KEY = 'washmate_karachi_demo_v1';

function createInitialDemoState(): DemoStorageState {
  return {
    activeDemoRole: null,
    users: [DEMO_USERS.customer, DEMO_USERS.provider, DEMO_USERS.admin],
    providers: DEMO_PROVIDERS,
    providerServices: DEMO_PROVIDER_SERVICES,
    clothingItems: DEMO_CLOTHING_ITEMS,
    orders: DEMO_ORDERS,
    carts: {},
    subscriptions: DEMO_SUBSCRIPTIONS,
    reviews: DEMO_REVIEWS,
    coupons: DEMO_COUPONS,
    addresses: DEMO_ADDRESSES,
    notifications: [
      {
        id: 'demo-notif-1',
        userId: DEMO_USERS.customer.uid,
        title: 'Washing in Progress',
        message: 'Maskan Steam & Wash Atelier tagged 10 garments for order WM-2026-1042.',
        channel: 'whatsapp_ready',
        orderId: 'demo-order-1042',
        read: false,
        createdAt: '2026-11-14T13:20:00.000Z',
      },
    ],
    complaints: DEMO_COMPLAINTS,
    transactions: DEMO_TRANSACTIONS,
    platformSettings: DEFAULT_PLATFORM_SETTINGS,
  };
}

function loadDemoState(): DemoStorageState {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return createInitialDemoState();
    const parsed = JSON.parse(raw) as DemoStorageState;
    if (!parsed || !Array.isArray(parsed.providers)) return createInitialDemoState();
    return parsed;
  } catch {
    return createInitialDemoState();
  }
}

export interface QuoteSummary {
  items: CartItem[];
  totalItemCount: number;
  subtotalPkr: number;
  pickupFeePkr: number;
  deliveryFeePkr: number;
  expressFeePkr: number;
  discountPkr: number;
  appliedCouponCode: string;
  commissionPkr: number;
  grandTotalPkr: number;
  meetsMinimumOrder: boolean;
  quoteSignature: string;
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  area: string;
  pickupAddress: string;
  hostelOrBuilding?: string;
  roomNumber?: string;
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface ProviderRegistrationInput {
  businessName: string;
  description: string;
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
  availableServices: ServiceType[];
  coverImageUrl?: string;
}

interface PendingCartSwitch {
  provider: LaundryProvider;
  item: ClothingItemPrice;
  serviceType: ServiceType;
  quantity: number;
}

interface WashMateContextValue {
  authReady: boolean;
  firebaseConnected: boolean;
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile | null;
  isDemoSession: boolean;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  providers: LaundryProvider[];
  liveProviders: LaundryProvider[];
  providerServices: ProviderServiceConfig[];
  clothingItems: ClothingItemPrice[];
  orders: LaundryOrder[];
  cart: ShoppingCart;
  subscriptions: StudentSubscription[];
  reviews: ProviderReview[];
  coupons: DiscountCoupon[];
  addresses: SavedAddress[];
  notifications: AppNotification[];
  complaints: LaundryComplaint[];
  transactions: PlatformTransaction[];
  allUsers: UserProfile[];
  platformSettings: PlatformSettings;
  pendingCartSwitch: PendingCartSwitch | null;
  dismissCartSwitch: () => void;
  confirmCartSwitch: () => Promise<void>;
  serverConfig: {
    googleMapsConfigured: boolean;
    jazzCashConfigured: boolean;
    easypaisaConfigured: boolean;
    whatsappCloudConfigured: boolean;
  };
  // Auth actions
  loginWithGoogle: (preferredRole?: 'customer' | 'provider') => Promise<UserProfile>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (params: {
    displayName: string;
    email: string;
    password: string;
    phone: string;
    role: 'customer' | 'provider';
    referralCodeInput?: string;
  }) => Promise<UserProfile>;
  switchDemoRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  resetDemoData: () => void;
  // Cart & Order actions
  addToCart: (provider: LaundryProvider, item: ClothingItemPrice, serviceType: ServiceType, quantity: number) => Promise<'added' | 'switch_required'>;
  updateCartItemQuantity: (clothingItemId: string, serviceType: ServiceType, quantity: number) => Promise<void>;
  removeCartItem: (clothingItemId: string, serviceType: ServiceType) => Promise<void>;
  clearCart: () => Promise<void>;
  setCartExpress: (isExpress: boolean) => Promise<void>;
  applyCartCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  fetchServerQuote: (commitOrder?: boolean, idempotencyKey?: string) => Promise<QuoteSummary | null>;
  placeOrder: (input: CheckoutInput) => Promise<{ order: LaundryOrder; paymentNotice: string }>;
  repeatOrder: (order: LaundryOrder) => Promise<'added' | 'switch_required'>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string, collectedItemCount?: number) => Promise<void>;
  cancelCustomerOrder: (orderId: string) => Promise<void>;
  // Customer features
  toggleFavoriteProvider: (providerId: string) => Promise<void>;
  saveAddress: (addr: Omit<SavedAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  updateUserProfile: (updates: { displayName: string; phone: string }) => Promise<void>;
  subscribeToPlan: (plan: StudentPlanDefinition) => Promise<StudentSubscription>;
  cancelSubscription: (subId: string) => Promise<void>;
  submitReview: (params: { order: LaundryOrder; rating: number; comment: string }) => Promise<void>;
  submitComplaint: (params: {
    order: LaundryOrder;
    type: LaundryComplaint['type'];
    description: string;
    affectedItemsCount: number;
  }) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  // Provider features
  registerLaundryBusiness: (input: ProviderRegistrationInput) => Promise<LaundryProvider>;
  updateProviderProfile: (providerId: string, updates: Partial<LaundryProvider>) => Promise<void>;
  uploadProviderImage: (providerId: string, file: File) => Promise<string>;
  upsertClothingItemPrice: (providerId: string, item: ClothingItemPrice) => Promise<void>;
  toggleProviderService: (providerId: string, serviceType: ServiceType, enabled: boolean, turnaroundHours: number) => Promise<void>;
  replyToReview: (reviewId: string, reply: string) => Promise<void>;
  // Admin features
  adminSetProviderStatus: (providerId: string, status: VerificationStatus) => Promise<void>;
  adminToggleUserSuspension: (userId: string, suspended: boolean) => Promise<void>;
  adminUpsertCoupon: (coupon: Omit<DiscountCoupon, 'createdAt' | 'updatedAt'>) => Promise<void>;
  adminDeleteCoupon: (code: string) => Promise<void>;
  adminUpdateSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
  adminResolveComplaint: (complaintId: string, status: LaundryComplaint['status'], resolutionNote: string) => Promise<void>;
}

const WashMateContext = createContext<WashMateContextValue | undefined>(undefined);

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeReferralCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5) || 'WASH';
  return `${clean}-${Math.floor(100 + Math.random() * 899)}`;
}

export const WashMateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoState, setDemoState] = useState<DemoStorageState>(loadDemoState);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [liveUserProfile, setLiveUserProfile] = useState<UserProfile | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('All Karachi');
  const [pendingCartSwitch, setPendingCartSwitch] = useState<PendingCartSwitch | null>(null);

  // Live Firestore states
  const [liveProviders, setLiveProviders] = useState<LaundryProvider[]>([]);
  const [liveProviderServices, setLiveProviderServices] = useState<ProviderServiceConfig[]>([]);
  const [liveClothingItems, setLiveClothingItems] = useState<ClothingItemPrice[]>([]);
  const [liveOrders, setLiveOrders] = useState<LaundryOrder[]>([]);
  const [liveCart, setLiveCart] = useState<ShoppingCart | null>(null);
  const [liveSubscriptions, setLiveSubscriptions] = useState<StudentSubscription[]>([]);
  const [liveReviews, setLiveReviews] = useState<ProviderReview[]>([]);
  const [liveCoupons, setLiveCoupons] = useState<DiscountCoupon[]>([]);
  const [liveAddresses, setLiveAddresses] = useState<SavedAddress[]>([]);
  const [liveNotifications, setLiveNotifications] = useState<AppNotification[]>([]);
  const [liveComplaints, setLiveComplaints] = useState<LaundryComplaint[]>([]);
  const [liveTransactions, setLiveTransactions] = useState<PlatformTransaction[]>([]);
  const [liveAllUsers, setLiveAllUsers] = useState<UserProfile[]>([]);
  const [liveSettings, setLiveSettings] = useState<PlatformSettings | null>(null);

  const [serverConfig, setServerConfig] = useState({
    googleMapsConfigured: false,
    jazzCashConfigured: false,
    easypaisaConfigured: false,
    whatsappCloudConfigured: false,
  });

  // Persist demo state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState));
    } catch {
      // Ignore quota errors
    }
  }, [demoState]);

  // Check backend config & Firestore connection
  useEffect(() => {
    testFirestoreConnection().then(setFirebaseConnected).catch(() => setFirebaseConnected(false));
    fetch('/api/config/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setServerConfig(data);
      })
      .catch(() => {});
  }, []);

  // Load public catalog collections from Firestore
  useEffect(() => {
    const unsubProviders = onSnapshot(
      query(collection(db, 'providers'), where('verificationStatus', '==', 'Approved')),
      (snap) => {
        setLiveProviders(snap.docs.map((d) => ({ ...(d.data() as LaundryProvider), id: d.id })));
      },
      () => {}
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'providerServices'), where('enabled', '==', true)),
      (snap) => {
        setLiveProviderServices(snap.docs.map((d) => ({ ...(d.data() as ProviderServiceConfig), id: d.id })));
      },
      () => {}
    );

    const unsubItems = onSnapshot(
      query(collection(db, 'clothingItems'), where('available', '==', true)),
      (snap) => {
        setLiveClothingItems(snap.docs.map((d) => ({ ...(d.data() as ClothingItemPrice), id: d.id })));
      },
      () => {}
    );

    const unsubReviews = onSnapshot(
      query(collection(db, 'reviews'), where('rating', '>=', 1)),
      (snap) => {
        setLiveReviews(snap.docs.map((d) => ({ ...(d.data() as ProviderReview), id: d.id })));
      },
      () => {}
    );

    const unsubCoupons = onSnapshot(
      query(collection(db, 'coupons'), where('active', '==', true)),
      (snap) => {
        setLiveCoupons(snap.docs.map((d) => ({ ...(d.data() as DiscountCoupon), code: d.id })));
      },
      () => {}
    );

    const unsubSettings = onSnapshot(
      doc(db, 'platformSettings', 'global'),
      (snap) => {
        if (snap.exists()) setLiveSettings(snap.data() as PlatformSettings);
      },
      () => {}
    );

    return () => {
      unsubProviders();
      unsubServices();
      unsubItems();
      unsubReviews();
      unsubCoupons();
      unsubSettings();
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (user.email === BOOTSTRAPPED_ADMIN_EMAIL && user.emailVerified && data.role !== 'admin') {
              setLiveUserProfile({ ...data, role: 'admin' });
            } else {
              setLiveUserProfile(data);
            }
          } else {
            const isBootstrappedAdmin = user.email === BOOTSTRAPPED_ADMIN_EMAIL && user.emailVerified;
            const initialRole: 'customer' | 'provider' = 'customer';
            const nowIso = new Date().toISOString();
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'WashMate User',
              email: user.email || '',
              phone: '',
              role: initialRole,
              referralCode: makeReferralCode(user.displayName || 'KARACHI'),
              referralCreditsPkr: 0,
              favoriteProviderIds: [],
              suspended: false,
              createdAt: nowIso,
              updatedAt: nowIso,
            };
            await setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setLiveUserProfile(isBootstrappedAdmin ? { ...newProfile, role: 'admin' } : newProfile);
          }
          // Clear demo role when real user signs in
          setDemoState((prev) => ({ ...prev, activeDemoRole: null }));
        } catch (err) {
          console.error('Error hydrating user profile:', err);
        }
      } else {
        setLiveUserProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Attach user-scoped Firestore listeners when signed into Firebase
  useEffect(() => {
    if (!firebaseUser || !liveUserProfile) {
      setLiveOrders([]);
      setLiveCart(null);
      setLiveSubscriptions([]);
      setLiveAddresses([]);
      setLiveNotifications([]);
      setLiveComplaints([]);
      setLiveTransactions([]);
      setLiveAllUsers([]);
      return;
    }

    const uid = firebaseUser.uid;
    const isAdmin = liveUserProfile.role === 'admin' || (firebaseUser.email === BOOTSTRAPPED_ADMIN_EMAIL && firebaseUser.emailVerified);

    const unsubs: Array<() => void> = [];

    // Cart
    unsubs.push(
      onSnapshot(
        doc(db, 'carts', uid),
        (snap) => {
          if (snap.exists()) setLiveCart(snap.data() as ShoppingCart);
          else setLiveCart({ userId: uid, providerId: '', providerName: '', items: [], couponCode: '', isExpress: false, updatedAt: '' });
        },
        (err) => handleFirestoreError(err, OperationType.GET, `carts/${uid}`)
      )
    );

    // Orders
    const ordersQ = isAdmin
      ? collection(db, 'orders')
      : liveUserProfile.role === 'provider'
        ? query(collection(db, 'orders'), where('providerOwnerId', '==', uid))
        : query(collection(db, 'orders'), where('customerId', '==', uid));

    unsubs.push(
      onSnapshot(
        ordersQ,
        (snap) => setLiveOrders(snap.docs.map((d) => ({ ...(d.data() as LaundryOrder), id: d.id }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
      )
    );

    // Addresses
    unsubs.push(
      onSnapshot(
        query(collection(db, 'addresses'), where('userId', '==', uid)),
        (snap) => setLiveAddresses(snap.docs.map((d) => ({ ...(d.data() as SavedAddress), id: d.id }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'addresses')
      )
    );

    // Subscriptions
    const subsQ = isAdmin ? collection(db, 'subscriptions') : query(collection(db, 'subscriptions'), where('userId', '==', uid));
    unsubs.push(
      onSnapshot(
        subsQ,
        (snap) => setLiveSubscriptions(snap.docs.map((d) => ({ ...(d.data() as StudentSubscription), id: d.id }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'subscriptions')
      )
    );

    // Notifications
    unsubs.push(
      onSnapshot(
        query(collection(db, 'notifications'), where('userId', '==', uid)),
        (snap) => setLiveNotifications(snap.docs.map((d) => ({ ...(d.data() as AppNotification), id: d.id }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
      )
    );

    // Complaints
    const compQ = isAdmin
      ? collection(db, 'complaints')
      : liveUserProfile.role === 'provider'
        ? query(collection(db, 'complaints'), where('providerOwnerId', '==', uid))
        : query(collection(db, 'complaints'), where('customerId', '==', uid));
    unsubs.push(
      onSnapshot(
        compQ,
        (snap) => setLiveComplaints(snap.docs.map((d) => ({ ...(d.data() as LaundryComplaint), id: d.id }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'complaints')
      )
    );

    // Transactions
    const txQ = isAdmin
      ? collection(db, 'transactions')
      : liveUserProfile.role === 'provider'
        ? query(collection(db, 'transactions'), where('providerOwnerId', '==', uid))
        : query(collection(db, 'transactions'), where('customerId', '==', uid));
    unsubs.push(
      onSnapshot(
        txQ,
        (snap) => setLiveTransactions(snap.docs.map((d) => ({ ...(d.data() as PlatformTransaction), id: d.id }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
      )
    );

    // Admin-only listeners (all providers including pending/rejected, all users, all coupons)
    if (isAdmin) {
      unsubs.push(
        onSnapshot(
          collection(db, 'providers'),
          (snap) => setLiveProviders(snap.docs.map((d) => ({ ...(d.data() as LaundryProvider), id: d.id }))),
          (err) => handleFirestoreError(err, OperationType.LIST, 'providers')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'users'),
          (snap) => setLiveAllUsers(snap.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id }))),
          (err) => handleFirestoreError(err, OperationType.LIST, 'users')
        )
      );
    } else if (liveUserProfile.role === 'provider') {
      // Also include owner's pending/rejected providers
      unsubs.push(
        onSnapshot(
          query(collection(db, 'providers'), where('ownerId', '==', uid)),
          (snap) => {
            const owned = snap.docs.map((d) => ({ ...(d.data() as LaundryProvider), id: d.id }));
            setLiveProviders((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              owned.forEach((p) => map.set(p.id, p));
              return Array.from(map.values());
            });
          },
          () => {}
        )
      );
    }

    return () => unsubs.forEach((fn) => fn());
  }, [firebaseUser, liveUserProfile]);

  const isDemoSession = !firebaseUser;

  const currentUser: UserProfile | null = useMemo(() => {
    if (firebaseUser && liveUserProfile) return liveUserProfile;
    if (demoState.activeDemoRole) {
      return (
        demoState.users.find((u) => u.role === demoState.activeDemoRole) ||
        DEMO_USERS[demoState.activeDemoRole]
      );
    }
    return null;
  }, [firebaseUser, liveUserProfile, demoState.activeDemoRole, demoState.users]);

  // Combined catalog: live Firestore providers + demo providers (clearly flagged isDemo: true)
  const providers = useMemo(() => {
    const map = new Map<string, LaundryProvider>();
    demoState.providers.forEach((p) => map.set(p.id, p));
    liveProviders.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [demoState.providers, liveProviders]);

  const providerServices = useMemo(() => {
    const map = new Map<string, ProviderServiceConfig>();
    demoState.providerServices.forEach((s) => map.set(s.id, s));
    liveProviderServices.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  }, [demoState.providerServices, liveProviderServices]);

  const clothingItems = useMemo(() => {
    const map = new Map<string, ClothingItemPrice>();
    demoState.clothingItems.forEach((c) => map.set(c.id, c));
    liveClothingItems.forEach((c) => map.set(c.id, c));
    return Array.from(map.values());
  }, [demoState.clothingItems, liveClothingItems]);

  const reviews = useMemo(() => {
    const map = new Map<string, ProviderReview>();
    demoState.reviews.forEach((r) => map.set(r.id, r));
    liveReviews.forEach((r) => map.set(r.id, r));
    return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [demoState.reviews, liveReviews]);

  const coupons = useMemo(() => {
    const map = new Map<string, DiscountCoupon>();
    demoState.coupons.forEach((c) => map.set(c.code, c));
    liveCoupons.forEach((c) => map.set(c.code, c));
    return Array.from(map.values());
  }, [demoState.coupons, liveCoupons]);

  const platformSettings = liveSettings || demoState.platformSettings;

  const activeCartKey = currentUser?.uid || 'guest-cart';

  const cart: ShoppingCart = useMemo(() => {
    if (firebaseUser && liveCart) return liveCart;
    return (
      demoState.carts[activeCartKey] || {
        userId: activeCartKey,
        providerId: '',
        providerName: '',
        items: [],
        couponCode: '',
        isExpress: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }, [firebaseUser, liveCart, demoState.carts, activeCartKey]);

  const orders = useMemo(() => {
    const list = firebaseUser ? liveOrders : demoState.orders;
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [firebaseUser, liveOrders, demoState.orders]);

  const addresses = useMemo(() => {
    if (firebaseUser) return liveAddresses;
    return currentUser ? demoState.addresses.filter((a) => a.userId === currentUser.uid) : [];
  }, [firebaseUser, liveAddresses, demoState.addresses, currentUser]);

  const subscriptions = useMemo(() => {
    if (firebaseUser) return liveSubscriptions;
    return currentUser
      ? currentUser.role === 'admin'
        ? demoState.subscriptions
        : demoState.subscriptions.filter((s) => s.userId === currentUser.uid)
      : [];
  }, [firebaseUser, liveSubscriptions, demoState.subscriptions, currentUser]);

  const notifications = useMemo(() => {
    if (firebaseUser) return liveNotifications;
    return currentUser ? demoState.notifications.filter((n) => n.userId === currentUser.uid) : [];
  }, [firebaseUser, liveNotifications, demoState.notifications, currentUser]);

  const complaints = useMemo(() => {
    if (firebaseUser) return liveComplaints;
    return demoState.complaints;
  }, [firebaseUser, liveComplaints, demoState.complaints]);

  const transactions = useMemo(() => {
    if (firebaseUser) return liveTransactions;
    return demoState.transactions;
  }, [firebaseUser, liveTransactions, demoState.transactions]);

  const allUsers = useMemo(() => {
    if (firebaseUser) return liveAllUsers;
    return demoState.users;
  }, [firebaseUser, liveAllUsers, demoState.users]);

  // --- Auth Methods ---
  const loginWithGoogle = useCallback(async (preferredRole: 'customer' | 'provider' = 'customer'): Promise<UserProfile> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const isBootstrappedAdmin = user.email === BOOTSTRAPPED_ADMIN_EMAIL && user.emailVerified;
    const nowIso = new Date().toISOString();

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      const hydrated = isBootstrappedAdmin ? { ...existing, role: 'admin' as UserRole } : existing;
      setLiveUserProfile(hydrated);
      return hydrated;
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Karachi Customer',
      email: user.email || '',
      phone: '',
      role: preferredRole,
      referralCode: makeReferralCode(user.displayName || 'WASH'),
      referralCreditsPkr: 0,
      favoriteProviderIds: [],
      suspended: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }

    const finalProfile = isBootstrappedAdmin ? { ...newProfile, role: 'admin' as UserRole } : newProfile;
    setLiveUserProfile(finalProfile);
    return finalProfile;
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const registerWithEmail = useCallback(
    async (params: {
      displayName: string;
      email: string;
      password: string;
      phone: string;
      role: 'customer' | 'provider';
      referralCodeInput?: string;
    }): Promise<UserProfile> => {
      const cred = await createUserWithEmailAndPassword(auth, params.email, params.password);
      await updateProfile(cred.user, { displayName: params.displayName });
      const nowIso = new Date().toISOString();
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        displayName: params.displayName,
        email: params.email,
        phone: params.phone,
        role: params.role,
        referralCode: makeReferralCode(params.displayName),
        referredBy: params.referralCodeInput?.trim().toUpperCase() || '',
        referralCreditsPkr: 0,
        favoriteProviderIds: [],
        suspended: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
      }
      setLiveUserProfile(newProfile);
      return newProfile;
    },
    []
  );

  const switchDemoRole = useCallback(
    (role: UserRole) => {
      if (firebaseUser) {
        signOut(auth).catch(() => {});
      }
      setDemoState((prev) => ({
        ...prev,
        activeDemoRole: role,
      }));
    },
    [firebaseUser]
  );

  const logout = useCallback(async () => {
    if (firebaseUser) {
      await signOut(auth);
    }
    setLiveUserProfile(null);
    setDemoState((prev) => ({ ...prev, activeDemoRole: null }));
  }, [firebaseUser]);

  const resetDemoData = useCallback(() => {
    const fresh = createInitialDemoState();
    setDemoState(fresh);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fresh));
  }, []);

  // --- Cart Operations ---
  const persistCart = useCallback(
    async (nextCart: ShoppingCart) => {
      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'carts', firebaseUser.uid), {
            ...nextCart,
            userId: firebaseUser.uid,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `carts/${firebaseUser.uid}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          carts: { ...prev.carts, [activeCartKey]: nextCart },
        }));
      }
    },
    [firebaseUser, activeCartKey]
  );

  const addToCart = useCallback(
    async (
      provider: LaundryProvider,
      item: ClothingItemPrice,
      serviceType: ServiceType,
      quantity: number
    ): Promise<'added' | 'switch_required'> => {
      const unitPrice = item.pricesByService[serviceType];
      if (!unitPrice || !provider.availableServices.includes(serviceType)) {
        throw new Error(`${provider.businessName} does not offer ${serviceType} for ${item.itemName}.`);
      }

      if (cart.providerId && cart.providerId !== provider.id && cart.items.length > 0) {
        setPendingCartSwitch({ provider, item, serviceType, quantity });
        return 'switch_required';
      }

      const existingIdx = cart.items.findIndex(
        (ci) => ci.clothingItemId === item.id && ci.serviceType === serviceType
      );
      const nextItems = [...cart.items];
      if (existingIdx >= 0) {
        nextItems[existingIdx] = {
          ...nextItems[existingIdx],
          quantity: nextItems[existingIdx].quantity + quantity,
          unitPricePkr: unitPrice,
        };
      } else {
        nextItems.push({
          clothingItemId: item.id,
          itemName: item.itemName,
          serviceType,
          unitPricePkr: unitPrice,
          quantity,
        });
      }

      await persistCart({
        ...cart,
        userId: currentUser?.uid || activeCartKey,
        providerId: provider.id,
        providerName: provider.businessName,
        items: nextItems,
        updatedAt: new Date().toISOString(),
      });
      return 'added';
    },
    [cart, persistCart, currentUser, activeCartKey]
  );

  const dismissCartSwitch = useCallback(() => setPendingCartSwitch(null), []);

  const confirmCartSwitch = useCallback(async () => {
    if (!pendingCartSwitch) return;
    const { provider, item, serviceType, quantity } = pendingCartSwitch;
    const unitPrice = item.pricesByService[serviceType] || 0;
    await persistCart({
      userId: currentUser?.uid || activeCartKey,
      providerId: provider.id,
      providerName: provider.businessName,
      items: [
        {
          clothingItemId: item.id,
          itemName: item.itemName,
          serviceType,
          unitPricePkr: unitPrice,
          quantity,
        },
      ],
      couponCode: '',
      isExpress: false,
      updatedAt: new Date().toISOString(),
    });
    setPendingCartSwitch(null);
  }, [pendingCartSwitch, persistCart, currentUser, activeCartKey]);

  const updateCartItemQuantity = useCallback(
    async (clothingItemId: string, serviceType: ServiceType, quantity: number) => {
      const nextItems =
        quantity <= 0
          ? cart.items.filter((i) => !(i.clothingItemId === clothingItemId && i.serviceType === serviceType))
          : cart.items.map((i) =>
              i.clothingItemId === clothingItemId && i.serviceType === serviceType ? { ...i, quantity } : i
            );

      await persistCart({
        ...cart,
        providerId: nextItems.length === 0 ? '' : cart.providerId,
        providerName: nextItems.length === 0 ? '' : cart.providerName,
        items: nextItems,
        updatedAt: new Date().toISOString(),
      });
    },
    [cart, persistCart]
  );

  const removeCartItem = useCallback(
    async (clothingItemId: string, serviceType: ServiceType) => {
      await updateCartItemQuantity(clothingItemId, serviceType, 0);
    },
    [updateCartItemQuantity]
  );

  const clearCart = useCallback(async () => {
    await persistCart({
      userId: currentUser?.uid || activeCartKey,
      providerId: '',
      providerName: '',
      items: [],
      couponCode: '',
      isExpress: false,
      updatedAt: new Date().toISOString(),
    });
  }, [persistCart, currentUser, activeCartKey]);

  const setCartExpress = useCallback(
    async (isExpress: boolean) => {
      await persistCart({ ...cart, isExpress, updatedAt: new Date().toISOString() });
    },
    [cart, persistCart]
  );

  const applyCartCoupon = useCallback(
    async (code: string): Promise<{ ok: boolean; message: string }> => {
      const clean = code.trim().toUpperCase();
      if (!clean) {
        await persistCart({ ...cart, couponCode: '', updatedAt: new Date().toISOString() });
        return { ok: true, message: 'Coupon removed.' };
      }
      const found = coupons.find((c) => c.code === clean && c.active);
      if (!found) {
        return { ok: false, message: `Coupon "${clean}" is invalid or expired.` };
      }
      const subtotal = cart.items.reduce((acc, i) => acc + i.unitPricePkr * i.quantity, 0);
      if (subtotal < found.minOrderPkr) {
        return { ok: false, message: `Minimum order of Rs. ${found.minOrderPkr} required for ${found.code}.` };
      }
      await persistCart({ ...cart, couponCode: found.code, updatedAt: new Date().toISOString() });
      return {
        ok: true,
        message:
          found.discountType === 'percent'
            ? `${found.code} applied (${found.discountValue}% off, up to Rs. ${found.maxDiscountPkr}).`
            : `${found.code} applied (Rs. ${found.discountValue} off).`,
      };
    },
    [cart, coupons, persistCart]
  );

  // Trusted Backend Price Recalculation
  const fetchServerQuote = useCallback(
    async (commitOrder = false, idempotencyKey?: string): Promise<QuoteSummary | null> => {
      if (cart.items.length === 0 || !cart.providerId) return null;
      const provider = providers.find((p) => p.id === cart.providerId);
      if (!provider) return null;
      const coupon = coupons.find((c) => c.code === cart.couponCode && c.active) || null;

      const resp = await fetch('/api/orders/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          items: cart.items,
          pickupFeePkr: provider.pickupAvailable ? provider.pickupFeePkr : 0,
          deliveryFeePkr: provider.deliveryAvailable ? provider.deliveryFeePkr : 0,
          expressAvailable: provider.expressAvailable,
          expressSurchargePkr: provider.expressSurchargePkr,
          isExpress: cart.isExpress,
          minOrderPkr: provider.minOrderPkr,
          coupon,
          commissionPercent: platformSettings.commissionPercent,
          idempotencyKey,
          commitOrder,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to validate order quote on server.');
      }
      return data as QuoteSummary;
    },
    [cart, providers, coupons, platformSettings.commissionPercent]
  );

  const placeOrder = useCallback(
    async (input: CheckoutInput): Promise<{ order: LaundryOrder; paymentNotice: string }> => {
      if (!currentUser) {
        throw new Error('Please sign in or launch a Customer Demo session before placing an order.');
      }
      const provider = providers.find((p) => p.id === cart.providerId);
      if (!provider) {
        throw new Error('Selected laundry provider was not found.');
      }

      // 1. Server-side authoritative price validation & duplicate-order guard
      const quote = await fetchServerQuote(true, input.idempotencyKey);
      if (!quote) {
        throw new Error('Your cart is empty.');
      }

      const orderId = makeId('ord');
      const orderNumber = `WM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`;

      // 2. Payment intent check (never fakes online JazzCash/Easypaisa settlement)
      const payResp = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: input.paymentMethod,
          amountPkr: quote.grandTotalPkr,
          orderNumber,
        }),
      });
      const payData = await payResp.json();
      if (!payResp.ok) {
        throw new Error(payData.error || 'Payment setup check failed.');
      }

      const nowIso = new Date().toISOString();
      const newOrder: LaundryOrder = {
        id: orderId,
        orderNumber,
        customerId: currentUser.uid,
        providerId: provider.id,
        providerOwnerId: provider.ownerId,
        providerName: provider.businessName,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        customerEmail: input.customerEmail.trim(),
        pickupAddress: input.pickupAddress.trim(),
        area: input.area,
        hostelOrBuilding: input.hostelOrBuilding?.trim() || '',
        roomNumber: input.roomNumber?.trim() || '',
        pickupDate: input.pickupDate,
        pickupTimeSlot: input.pickupTimeSlot,
        deliveryDate: input.deliveryDate,
        deliveryTimeSlot: input.deliveryTimeSlot,
        specialInstructions: input.specialInstructions?.trim() || '',
        isExpress: cart.isExpress && provider.expressAvailable,
        items: quote.items as CartItem[],
        subtotalPkr: quote.subtotalPkr,
        pickupFeePkr: quote.pickupFeePkr,
        deliveryFeePkr: quote.deliveryFeePkr,
        expressFeePkr: quote.expressFeePkr,
        discountPkr: quote.discountPkr,
        couponCode: quote.appliedCouponCode,
        commissionPkr: quote.commissionPkr,
        grandTotalPkr: quote.grandTotalPkr,
        paymentMethod: input.paymentMethod,
        paymentStatus: payData.paymentStatus,
        status: 'Order Placed',
        statusHistory: [
          {
            status: 'Order Placed',
            timestamp: nowIso,
            note: `Order submitted (${input.paymentMethod})`,
            updatedByRole: 'customer',
          },
        ],
        collectedItemCount: 0,
        hasReviewed: false,
        isDemo: isDemoSession || provider.isDemo,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const txId = makeId('tx');
      const newTx: PlatformTransaction = {
        id: txId,
        orderId,
        customerId: currentUser.uid,
        providerId: provider.id,
        providerOwnerId: provider.ownerId,
        amountPkr: quote.grandTotalPkr,
        commissionPkr: quote.commissionPkr,
        providerNetPkr: Math.max(0, quote.subtotalPkr - quote.commissionPkr),
        paymentMethod: input.paymentMethod,
        status: payData.transactionStatus,
        createdAt: nowIso,
      };

      const notifId = makeId('notif');
      const newNotif: AppNotification = {
        id: notifId,
        userId: currentUser.uid,
        title: `Order ${orderNumber} Placed`,
        message: `Your pickup with ${provider.businessName} in ${input.area} is scheduled for ${input.pickupDate}.`,
        channel: 'whatsapp_ready',
        orderId,
        read: false,
        createdAt: nowIso,
      };

      if (firebaseUser && !provider.isDemo) {
        try {
          await setDoc(doc(db, 'orders', orderId), {
            ...newOrder,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await setDoc(doc(db, 'transactions', txId), {
            ...newTx,
            createdAt: serverTimestamp(),
          });
          await setDoc(doc(db, 'notifications', notifId), {
            ...newNotif,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          orders: [newOrder, ...prev.orders],
          transactions: [newTx, ...prev.transactions],
          notifications: [newNotif, ...prev.notifications],
        }));
      }

      await clearCart();
      return { order: newOrder, paymentNotice: payData.message };
    },
    [currentUser, providers, cart, fetchServerQuote, isDemoSession, firebaseUser, clearCart]
  );

  const repeatOrder = useCallback(
    async (order: LaundryOrder): Promise<'added' | 'switch_required'> => {
      const provider = providers.find((p) => p.id === order.providerId);
      if (!provider) throw new Error('Provider for this previous order is no longer available.');

      if (cart.providerId && cart.providerId !== provider.id && cart.items.length > 0) {
        const first = order.items[0];
        const matchingItem = clothingItems.find((ci) => ci.id === first.clothingItemId) || {
          id: first.clothingItemId,
          providerId: provider.id,
          ownerId: provider.ownerId,
          itemName: first.itemName,
          category: 'Accessories' as const,
          pricesByService: { [first.serviceType]: first.unitPricePkr },
          available: true,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
        setPendingCartSwitch({
          provider,
          item: matchingItem,
          serviceType: first.serviceType,
          quantity: first.quantity,
        });
        return 'switch_required';
      }

      await persistCart({
        userId: currentUser?.uid || activeCartKey,
        providerId: provider.id,
        providerName: provider.businessName,
        items: order.items.map((i) => ({ ...i })),
        couponCode: '',
        isExpress: order.isExpress,
        updatedAt: new Date().toISOString(),
      });
      return 'added';
    },
    [providers, cart, clothingItems, persistCart, currentUser, activeCartKey]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string, collectedItemCount?: number) => {
      const target = orders.find((o) => o.id === orderId);
      if (!target) return;
      const nowIso = new Date().toISOString();
      const nextHistory = [
        ...target.statusHistory,
        {
          status,
          timestamp: nowIso,
          note: note || `Updated to ${status}`,
          updatedByRole: currentUser?.role || 'provider',
        },
      ];
      const nextCount = typeof collectedItemCount === 'number' ? collectedItemCount : target.collectedItemCount;

      if (firebaseUser && !target.isDemo) {
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            status,
            statusHistory: nextHistory,
            collectedItemCount: nextCount,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  statusHistory: nextHistory,
                  collectedItemCount: nextCount,
                  paymentStatus: status === 'Delivered' && o.paymentMethod === 'COD' ? 'Paid' : o.paymentStatus,
                  updatedAt: nowIso,
                }
              : o
          ),
        }));
      }
    },
    [orders, currentUser, firebaseUser]
  );

  const cancelCustomerOrder = useCallback(
    async (orderId: string) => {
      const target = orders.find((o) => o.id === orderId);
      if (!target || target.status !== 'Order Placed') {
        throw new Error('Only newly placed orders can be cancelled by the customer.');
      }
      const nowIso = new Date().toISOString();
      const nextHistory = [
        ...target.statusHistory,
        { status: 'Cancelled' as OrderStatus, timestamp: nowIso, note: 'Cancelled by customer', updatedByRole: 'customer' as UserRole },
      ];

      if (firebaseUser && !target.isDemo) {
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            status: 'Cancelled',
            statusHistory: nextHistory,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'Cancelled', statusHistory: nextHistory, updatedAt: nowIso } : o
          ),
        }));
      }
    },
    [orders, firebaseUser]
  );

  // --- Customer Operations ---
  const toggleFavoriteProvider = useCallback(
    async (providerId: string) => {
      if (!currentUser) return;
      const exists = currentUser.favoriteProviderIds.includes(providerId);
      const nextFavs = exists
        ? currentUser.favoriteProviderIds.filter((id) => id !== providerId)
        : [...currentUser.favoriteProviderIds, providerId];

      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            favoriteProviderIds: nextFavs,
            updatedAt: serverTimestamp(),
          });
          setLiveUserProfile((prev) => (prev ? { ...prev, favoriteProviderIds: nextFavs } : prev));
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.uid === currentUser.uid ? { ...u, favoriteProviderIds: nextFavs } : u)),
        }));
      }
    },
    [currentUser, firebaseUser]
  );

  const saveAddress = useCallback(
    async (addr: Omit<SavedAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!currentUser) return;
      const id = makeId('addr');
      const nowIso = new Date().toISOString();
      const fullAddr: SavedAddress = {
        ...addr,
        id,
        userId: currentUser.uid,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'addresses', id), {
            ...fullAddr,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `addresses/${id}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          addresses: [
            fullAddr,
            ...prev.addresses.map((a) => (addr.isDefault && a.userId === currentUser.uid ? { ...a, isDefault: false } : a)),
          ],
        }));
      }
    },
    [currentUser, firebaseUser]
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      if (firebaseUser) {
        try {
          await deleteDoc(doc(db, 'addresses', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `addresses/${id}`);
        }
      } else {
        setDemoState((prev) => ({ ...prev, addresses: prev.addresses.filter((a) => a.id !== id) }));
      }
    },
    [firebaseUser]
  );

  const updateUserProfile = useCallback(
    async (updates: { displayName: string; phone: string }) => {
      if (!currentUser) return;
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            displayName: updates.displayName,
            phone: updates.phone,
            updatedAt: serverTimestamp(),
          });
          setLiveUserProfile((prev) => (prev ? { ...prev, ...updates } : prev));
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.uid === currentUser.uid ? { ...u, ...updates } : u)),
        }));
      }
    },
    [currentUser, firebaseUser]
  );

  const subscribeToPlan = useCallback(
    async (plan: StudentPlanDefinition): Promise<StudentSubscription> => {
      if (!currentUser) throw new Error('Please sign in first to enroll in a student plan.');
      const id = makeId('sub');
      const start = new Date();
      const end = new Date(start.getTime() + plan.validityDays * 24 * 60 * 60 * 1000);
      const nowIso = start.toISOString();
      const sub: StudentSubscription = {
        id,
        userId: currentUser.uid,
        planId: plan.id,
        planName: plan.name,
        monthlyLimit: plan.monthlyLimit,
        clothesUsed: 0,
        pricePkr: plan.pricePkr,
        extraChargePerItemPkr: plan.extraChargePerItemPkr,
        status: 'Pending Payment',
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'subscriptions', id), {
            ...sub,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `subscriptions/${id}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          subscriptions: [
            { ...sub, status: 'Active' },
            ...prev.subscriptions.map((s) =>
              s.userId === currentUser.uid && s.status === 'Active' ? { ...s, status: 'Cancelled' as const } : s
            ),
          ],
        }));
      }
      return sub;
    },
    [currentUser, firebaseUser]
  );

  const cancelSubscription = useCallback(
    async (subId: string) => {
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'subscriptions', subId), {
            status: 'Cancelled',
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${subId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          subscriptions: prev.subscriptions.map((s) => (s.id === subId ? { ...s, status: 'Cancelled' } : s)),
        }));
      }
    },
    [firebaseUser]
  );

  const submitReview = useCallback(
    async ({ order, rating, comment }: { order: LaundryOrder; rating: number; comment: string }) => {
      if (!currentUser) throw new Error('Sign in required.');
      if (order.status !== 'Delivered') {
        throw new Error('Only completed (Delivered) orders can be reviewed.');
      }
      const id = makeId('rev');
      const nowIso = new Date().toISOString();
      const review: ProviderReview = {
        id,
        orderId: order.id,
        providerId: order.providerId,
        providerOwnerId: order.providerOwnerId,
        customerId: currentUser.uid,
        customerName: currentUser.displayName,
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        comment: comment.trim(),
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      if (firebaseUser && !order.isDemo) {
        try {
          await setDoc(doc(db, 'reviews', id), {
            ...review,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await updateDoc(doc(db, 'orders', order.id), {
            hasReviewed: true,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `reviews/${id}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          reviews: [review, ...prev.reviews],
          orders: prev.orders.map((o) => (o.id === order.id ? { ...o, hasReviewed: true } : o)),
        }));
      }
    },
    [currentUser, firebaseUser]
  );

  const submitComplaint = useCallback(
    async (params: {
      order: LaundryOrder;
      type: LaundryComplaint['type'];
      description: string;
      affectedItemsCount: number;
    }) => {
      if (!currentUser) throw new Error('Sign in required.');
      const id = makeId('cmp');
      const nowIso = new Date().toISOString();
      const comp: LaundryComplaint = {
        id,
        orderId: params.order.id,
        customerId: currentUser.uid,
        providerId: params.order.providerId,
        providerOwnerId: params.order.providerOwnerId,
        type: params.type,
        description: params.description.trim(),
        affectedItemsCount: params.affectedItemsCount,
        status: 'Open',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      if (firebaseUser && !params.order.isDemo) {
        try {
          await setDoc(doc(db, 'complaints', id), {
            ...comp,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `complaints/${id}`);
        }
      } else {
        setDemoState((prev) => ({ ...prev, complaints: [comp, ...prev.complaints] }));
      }
    },
    [currentUser, firebaseUser]
  );

  const markNotificationRead = useCallback(
    async (notifId: string) => {
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'notifications', notifId), { read: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `notifications/${notifId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
        }));
      }
    },
    [firebaseUser]
  );

  // --- Provider Operations ---
  const registerLaundryBusiness = useCallback(
    async (input: ProviderRegistrationInput): Promise<LaundryProvider> => {
      if (!currentUser) throw new Error('Please sign in or register first.');
      const id = makeId('prov');
      const nowIso = new Date().toISOString();
      const newProv: LaundryProvider = {
        id,
        ownerId: currentUser.uid,
        businessName: input.businessName.trim(),
        description: input.description.trim(),
        coverImageUrl: input.coverImageUrl || '/src/assets/images/provider_gulshan_atelier_1794720458063.jpg',
        phone: input.phone.trim(),
        email: input.email.trim(),
        address: input.address.trim(),
        primaryArea: input.primaryArea,
        serviceAreas: input.serviceAreas.length ? input.serviceAreas : [input.primaryArea],
        operatingHours: input.operatingHours.trim(),
        pickupAvailable: input.pickupAvailable,
        deliveryAvailable: input.deliveryAvailable,
        expressAvailable: input.expressAvailable,
        expressSurchargePkr: Math.max(0, Math.round(input.expressSurchargePkr)),
        pickupFeePkr: Math.max(0, Math.round(input.pickupFeePkr)),
        deliveryFeePkr: Math.max(0, Math.round(input.deliveryFeePkr)),
        minOrderPkr: Math.max(0, Math.round(input.minOrderPkr)),
        turnaroundHours: Math.max(6, Math.round(input.turnaroundHours)),
        verificationStatus: 'Pending',
        isDemo: false,
        rating: 0,
        reviewCount: 0,
        completedOrdersCount: 0,
        startingPricePkr: 40,
        availableServices: input.availableServices.length ? input.availableServices : ['Washing', 'Wash + Dry + Fold'],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const defaultItems: ClothingItemPrice[] = CATALOG_ITEMS_TEMPLATE.slice(0, 10).map((tpl, idx) => {
        const pricesByService: Partial<Record<ServiceType, number>> = {};
        newProv.availableServices.forEach((svc) => {
          const factor = svc === 'Dry Cleaning' ? 2.2 : svc === 'Wash + Dry + Iron' ? 1.8 : svc === 'Wash + Dry + Fold' ? 1.5 : svc === 'Ironing' ? 0.65 : 1;
          pricesByService[svc] = Math.max(20, Math.round((tpl.baseWash * factor) / 5) * 5);
        });
        return {
          id: `${id}_item_${idx + 1}`,
          providerId: id,
          ownerId: currentUser.uid,
          itemName: tpl.itemName,
          category: tpl.category,
          pricesByService,
          available: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
      });

      const defaultSvcs: ProviderServiceConfig[] = ALL_SERVICES.map((svc, idx) => ({
        id: `${id}_svc_${idx + 1}`,
        providerId: id,
        ownerId: currentUser.uid,
        serviceType: svc,
        enabled: newProv.availableServices.includes(svc),
        turnaroundHours: newProv.turnaroundHours,
        description: `${svc} provided by ${newProv.businessName}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      }));

      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'providers', id), {
            ...newProv,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await Promise.all(
            defaultItems.map((item) =>
              setDoc(doc(db, 'clothingItems', item.id), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
            )
          );
          await Promise.all(
            defaultSvcs.map((svc) =>
              setDoc(doc(db, 'providerServices', svc.id), {
                ...svc,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
            )
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `providers/${id}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          providers: [newProv, ...prev.providers],
          clothingItems: [...defaultItems, ...prev.clothingItems],
          providerServices: [...defaultSvcs, ...prev.providerServices],
        }));
      }
      return newProv;
    },
    [currentUser, firebaseUser]
  );

  const updateProviderProfile = useCallback(
    async (providerId: string, updates: Partial<LaundryProvider>) => {
      const target = providers.find((p) => p.id === providerId);
      if (!target) return;
      if (firebaseUser && !target.isDemo) {
        try {
          await updateDoc(doc(db, 'providers', providerId), {
            ...updates,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `providers/${providerId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          providers: prev.providers.map((p) =>
            p.id === providerId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      }
    },
    [providers, firebaseUser]
  );

  const uploadProviderImage = useCallback(
    async (providerId: string, file: File): Promise<string> => {
      if (!firebaseUser) {
        throw new Error('Firebase Storage image upload requires signing in with a live Firebase account.');
      }
      const storageRef = ref(storage, `providers/${providerId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    },
    [firebaseUser]
  );

  const upsertClothingItemPrice = useCallback(
    async (providerId: string, item: ClothingItemPrice) => {
      const targetProv = providers.find((p) => p.id === providerId);
      if (!targetProv) return;
      if (firebaseUser && !targetProv.isDemo) {
        try {
          const exists = liveClothingItems.some((c) => c.id === item.id);
          if (exists) {
            await updateDoc(doc(db, 'clothingItems', item.id), {
              itemName: item.itemName,
              category: item.category,
              pricesByService: item.pricesByService,
              available: item.available,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(doc(db, 'clothingItems', item.id), {
              ...item,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `clothingItems/${item.id}`);
        }
      } else {
        setDemoState((prev) => {
          const exists = prev.clothingItems.some((c) => c.id === item.id);
          const nextItems = exists
            ? prev.clothingItems.map((c) => (c.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : c))
            : [item, ...prev.clothingItems];
          return { ...prev, clothingItems: nextItems };
        });
      }
    },
    [providers, firebaseUser, liveClothingItems]
  );

  const toggleProviderService = useCallback(
    async (providerId: string, serviceType: ServiceType, enabled: boolean, turnaroundHours: number) => {
      const targetProv = providers.find((p) => p.id === providerId);
      if (!targetProv) return;
      const nextServices = enabled
        ? Array.from(new Set([...targetProv.availableServices, serviceType]))
        : targetProv.availableServices.filter((s) => s !== serviceType);

      if (nextServices.length === 0) {
        throw new Error('At least one laundry service must remain enabled.');
      }

      await updateProviderProfile(providerId, { availableServices: nextServices });

      const existingSvc = providerServices.find((s) => s.providerId === providerId && s.serviceType === serviceType);
      const svcId = existingSvc?.id || `${providerId}_svc_${serviceType.replace(/[^a-zA-Z0-9]/g, '')}`;
      if (firebaseUser && !targetProv.isDemo) {
        try {
          if (existingSvc) {
            await updateDoc(doc(db, 'providerServices', svcId), {
              enabled,
              turnaroundHours,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(doc(db, 'providerServices', svcId), {
              id: svcId,
              providerId,
              ownerId: targetProv.ownerId,
              serviceType,
              enabled,
              turnaroundHours,
              description: `${serviceType} service`,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `providerServices/${svcId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          providerServices: prev.providerServices.some((s) => s.id === svcId)
            ? prev.providerServices.map((s) => (s.id === svcId ? { ...s, enabled, turnaroundHours } : s))
            : [
                ...prev.providerServices,
                {
                  id: svcId,
                  providerId,
                  ownerId: targetProv.ownerId,
                  serviceType,
                  enabled,
                  turnaroundHours,
                  description: `${serviceType} service`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
        }));
      }
    },
    [providers, providerServices, firebaseUser, updateProviderProfile]
  );

  const replyToReview = useCallback(
    async (reviewId: string, reply: string) => {
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'reviews', reviewId), {
            providerReply: reply.trim(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `reviews/${reviewId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) => (r.id === reviewId ? { ...r, providerReply: reply.trim() } : r)),
        }));
      }
    },
    [firebaseUser]
  );

  // --- Admin Operations ---
  const adminSetProviderStatus = useCallback(
    async (providerId: string, status: VerificationStatus) => {
      const target = providers.find((p) => p.id === providerId);
      if (!target) return;
      if (firebaseUser && !target.isDemo) {
        try {
          await updateDoc(doc(db, 'providers', providerId), {
            verificationStatus: status,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `providers/${providerId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          providers: prev.providers.map((p) =>
            p.id === providerId ? { ...p, verificationStatus: status, updatedAt: new Date().toISOString() } : p
          ),
        }));
      }
    },
    [providers, firebaseUser]
  );

  const adminToggleUserSuspension = useCallback(
    async (userId: string, suspended: boolean) => {
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'users', userId), {
            suspended,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.uid === userId ? { ...u, suspended } : u)),
        }));
      }
    },
    [firebaseUser]
  );

  const adminUpsertCoupon = useCallback(
    async (coupon: Omit<DiscountCoupon, 'createdAt' | 'updatedAt'>) => {
      const code = coupon.code.trim().toUpperCase();
      const nowIso = new Date().toISOString();
      if (firebaseUser) {
        try {
          const refDoc = doc(db, 'coupons', code);
          const snap = await getDoc(refDoc);
          if (snap.exists()) {
            await updateDoc(refDoc, { ...coupon, code, updatedAt: serverTimestamp() });
          } else {
            await setDoc(refDoc, { ...coupon, code, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `coupons/${code}`);
        }
      } else {
        setDemoState((prev) => {
          const exists = prev.coupons.some((c) => c.code === code);
          const next = exists
            ? prev.coupons.map((c) => (c.code === code ? { ...c, ...coupon, code, updatedAt: nowIso } : c))
            : [{ ...coupon, code, createdAt: nowIso, updatedAt: nowIso }, ...prev.coupons];
          return { ...prev, coupons: next };
        });
      }
    },
    [firebaseUser]
  );

  const adminDeleteCoupon = useCallback(
    async (code: string) => {
      if (firebaseUser) {
        try {
          await deleteDoc(doc(db, 'coupons', code));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `coupons/${code}`);
        }
      } else {
        setDemoState((prev) => ({ ...prev, coupons: prev.coupons.filter((c) => c.code !== code) }));
      }
    },
    [firebaseUser]
  );

  const adminUpdateSettings = useCallback(
    async (updates: Partial<PlatformSettings>) => {
      const merged: PlatformSettings = {
        ...platformSettings,
        ...updates,
        id: 'global',
        updatedAt: new Date().toISOString(),
      };
      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'platformSettings', 'global'), {
            ...merged,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'platformSettings/global');
        }
      } else {
        setDemoState((prev) => ({ ...prev, platformSettings: merged }));
      }
    },
    [platformSettings, firebaseUser]
  );

  const adminResolveComplaint = useCallback(
    async (complaintId: string, status: LaundryComplaint['status'], resolutionNote: string) => {
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'complaints', complaintId), {
            status,
            resolutionNote,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `complaints/${complaintId}`);
        }
      } else {
        setDemoState((prev) => ({
          ...prev,
          complaints: prev.complaints.map((c) =>
            c.id === complaintId ? { ...c, status, resolutionNote, updatedAt: new Date().toISOString() } : c
          ),
        }));
      }
    },
    [firebaseUser]
  );

  // Also fetch non-approved live providers if needed when someone views /admin/providers in demo
  useEffect(() => {
    if (!firebaseUser && currentUser?.role === 'admin') {
      getDocs(query(collection(db, 'providers'), where('verificationStatus', '==', 'Approved'))).catch(() => {});
    }
  }, [firebaseUser, currentUser]);

  const value: WashMateContextValue = {
    authReady,
    firebaseConnected,
    firebaseUser,
    currentUser,
    isDemoSession,
    selectedArea,
    setSelectedArea,
    providers,
    liveProviders,
    providerServices,
    clothingItems,
    orders,
    cart,
    subscriptions,
    reviews,
    coupons,
    addresses,
    notifications,
    complaints,
    transactions,
    allUsers,
    platformSettings,
    pendingCartSwitch,
    dismissCartSwitch,
    confirmCartSwitch,
    serverConfig,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    switchDemoRole,
    logout,
    resetDemoData,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    setCartExpress,
    applyCartCoupon,
    fetchServerQuote,
    placeOrder,
    repeatOrder,
    updateOrderStatus,
    cancelCustomerOrder,
    toggleFavoriteProvider,
    saveAddress,
    deleteAddress,
    updateUserProfile,
    subscribeToPlan,
    cancelSubscription,
    submitReview,
    submitComplaint,
    markNotificationRead,
    registerLaundryBusiness,
    updateProviderProfile,
    uploadProviderImage,
    upsertClothingItemPrice,
    toggleProviderService,
    replyToReview,
    adminSetProviderStatus,
    adminToggleUserSuspension,
    adminUpsertCoupon,
    adminDeleteCoupon,
    adminUpdateSettings,
    adminResolveComplaint,
  };

  return <WashMateContext.Provider value={value}>{children}</WashMateContext.Provider>;
};

export function useWashMate() {
  const ctx = useContext(WashMateContext);
  if (!ctx) throw new Error('useWashMate must be used within WashMateProvider');
  return ctx;
}
