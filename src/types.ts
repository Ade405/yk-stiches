export type GarmentCategory =
  | 'all'
  | 'traditional'
  | 'bespoke-suits'
  | 'senator-kaftan'
  | 'evening-gowns'
  | 'casual-atelier'
  | 'luxury-fabrics';

export type GenderFilter = 'all' | 'men' | 'women' | 'unisex';

export interface ProductFabric {
  name: string;
  composition: string;
  origin: string;
  provenance?: string;
  weight: string;
  textureDescription: string;
  description?: string;
  care: string;
}

export interface ProductItem {
  id: string;
  title: string;
  subtitle: string;
  category: GarmentCategory;
  gender: GenderFilter;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  fabric: ProductFabric;
  description: string;
  highlights: string[];
  colors: { name: string; hex: string; bgClass: string }[];
  sizes: string[];
  isBespokeCustomizable: boolean;
  craftTimeDays: number;
  badge?: string;
  inStock: boolean;
}

export interface TailorMeasurementProfile {
  id: string;
  profileName: string;
  gender: 'men' | 'women';
  unit: 'inches' | 'cm';
  height: number;
  chestBust: number;
  shoulderWidth: number;
  sleeveLength: number;
  neckCollar: number;
  waist: number;
  hip: number;
  inseam: number;
  thigh: number;
  suitKaftanLength?: number;
  notes?: string;
  updatedAt: string;
}

export interface CustomTailoringOption {
  garmentBase: string; // 'Senator Suit' | 'Royal Suit' | 'Italian Tuxedo' | 'Kaftan Lounge' | 'Structured Corset Gown' | 'Safari Bush Jacket'
  fabric: string;
  fabricColor: string;
  collarStyle: string; // 'Mandarin / Banded' | 'Cuban Notch' | 'Classic Spread' | 'Shawl Silk Lapel' | 'Grandad Collar'
  sleeveStyle: string; // 'Standard Barrel Cuff' | 'French Double Cuff' | 'Embroidered Long' | 'Short Clean Hem'
  cuffType: string;
  buttonType: string; // 'Handmade Horn' | 'Polished Brass' | 'Mother of Pearl' | 'Hidden Placket' | 'Gold Crested'
  pocketStyle: string; // 'Single Besom' | 'Double Flap' | 'Traditional Slanted' | 'Chest Patch'
  cutSilhouette: 'Slim European' | 'Modern Tailored' | 'Relaxed Traditional';
  liningColor: string;
  embroideryPattern: 'None' | 'Minimalist Edge Stitch' | 'Royal Filigree Plaque' | 'Geometric Chevron' | 'Floral Chain-Stitch';
  embroideryThread: string;
  monogramText: string;
  monogramPlacement: 'None' | 'Left Chest' | 'Inner Pocket Lining' | 'Cuff Edge';
  measurements: TailorMeasurementProfile;
  specialInstructions: string;
}

export interface CartItem {
  id: string;
  product: ProductItem;
  quantity: number;
  isCustomTailored: boolean;
  selectedSize?: string;
  customConfig?: CustomTailoringOption;
  calculatedPrice: number;
}

export interface OrderMilestone {
  id: string;
  stage: string;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp: string;
  tailorNotes?: string;
  photoUrl?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[] | any[];
  orderType: 'bespoke' | 'ready-to-wear' | 'custom-fabric';
  totalAmount: number;
  currency: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentGateway: string;
  transactionRef: string;
  paymentMethod?: string;
  deliveryAddress: string;
  shippingAddress?: string;
  deliveryCity: string;
  expressDelivery: boolean;
  createdAt: string;
  estimatedDeliveryDate: string;
  assignedTailor: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
  };
  currentStageIndex: number;
  currentStage?: string;
  milestones: OrderMilestone[];
  measurementsSummary?: Record<string, string | number>;
  specialInstructions?: string;
}

export interface MasterTailor {
  id: string;
  name: string;
  title: string;
  experienceYears: number;
  specialty: string;
  avatar: string;
  status: 'available' | 'in-fitting' | 'crafting';
  phone: string;
  bio: string;
  completedGarments: number;
  rating: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tailor' | 'system';
  tailorId?: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  metaBadge?: string;
  suggestedActions?: string[];
}

export type PaymentMethod = 'momo' | 'mpesa' | 'airtel' | 'card' | 'ussd' | 'applepay';

export type CurrencyCode = 'USD' | 'NGN' | 'GBP' | 'EUR';

export type NavTabId = 'home' | 'catalog' | 'saved' | 'chat' | 'tracking' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'vip' | 'tailor';
  avatar?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  joinedDate: string;
  totalSpent: number;
  ordersCount: number;
  measurementsCount: number;
  vipTier: 'Aristocrat' | 'Executive' | 'Patron' | 'Master' | 'Artisan Tailor';
  tailorNotes?: string;
  savedMeasurements?: Record<string, any>;
  wishlist?: string[];
}

export interface CatalogFilterState {
  category: GarmentCategory;
  gender: GenderFilter;
  fabricType: string;
  priceRange: 'all' | 'under-200' | '200-350' | '350-500' | '500-plus';
  onlyCustomizable: boolean;
  inStockOnly: boolean;
  craftTime: 'all' | 'express' | 'standard';
  minRating: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
