import type { Dispatch, SetStateAction } from 'react';
import { AuthModal } from './AuthModal';
import { MeasurementModal } from './MeasurementModal';
import { PaymentDrawer } from './PaymentDrawer';
import { ProductQuickViewModal } from './ProductQuickViewModal';
import type {
  CartItem,
  CurrencyCode,
  OrderRecord,
  ProductItem,
  TailorMeasurementProfile,
  UserAccount,
} from '../types';

interface AppOverlaysProps {
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: Dispatch<SetStateAction<boolean>>;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => Promise<void>;
  isMeasurementModalOpen: boolean;
  setIsMeasurementModalOpen: Dispatch<SetStateAction<boolean>>;
  onOpenWishlist: () => void;
  onUpdateProfile: (user: UserAccount) => void;
  orders: OrderRecord[];
  currency: CurrencyCode;
  authInitialMode: 'user-login' | 'register' | 'profile' | 'admin-login';
  isCartOpen: boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  cartItems: CartItem[];
  onUpdateCartQuantity: (id: string, delta: number) => void;
  onRemoveCartItem: (id: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: OrderRecord) => void;
  measurementProfiles: TailorMeasurementProfile[];
  onSaveProfile: (profile: TailorMeasurementProfile) => void;
  onDeleteProfile: (id: string) => void;
  quickViewProduct: ProductItem | null;
  setQuickViewProduct: Dispatch<SetStateAction<ProductItem | null>>;
  onAddToCart: (item: CartItem) => void;
  onOpenChatWithTailor: (tailorName: string, context?: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

export function AppOverlays(props: AppOverlaysProps) {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    onLogin,
    onLogout,
    isMeasurementModalOpen,
    setIsMeasurementModalOpen,
    onOpenWishlist,
    onUpdateProfile,
    orders,
    currency,
    authInitialMode,
    isCartOpen,
    setIsCartOpen,
    cartItems,
    onUpdateCartQuantity,
    onRemoveCartItem,
    onClearCart,
    onOrderCreated,
    measurementProfiles,
    onSaveProfile,
    onDeleteProfile,
    quickViewProduct,
    setQuickViewProduct,
    onAddToCart,
    onOpenChatWithTailor,
    wishlist,
    onToggleWishlist,
  } = props;

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={onLogin}
        onLogout={onLogout}
        onOpenMeasurements={onOpenMeasurements}
        onOpenWishlist={onOpenWishlist}
        onUpdateProfile={onUpdateProfile}
        orders={orders}
        currency={currency}
        initialMode={authInitialMode}
      />

      <PaymentDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={onUpdateCartQuantity}
        onRemoveItem={onRemoveCartItem}
        onClearCart={onClearCart}
        currency={currency}
        onOrderCreated={onOrderCreated}
      />

      <MeasurementModal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        savedProfiles={measurementProfiles}
        onSaveProfile={onSaveProfile}
        onDeleteProfile={onDeleteProfile}
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
        onOpenChatWithTailor={onOpenChatWithTailor}
        currency={currency}
        wishlist={wishlist}
        onToggleWishlist={onToggleWishlist}
      />
    </>
  );
}
