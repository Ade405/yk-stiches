import type { Dispatch, SetStateAction } from 'react';
import { AdminPortal } from './AdminPortal';
import { CatalogView } from './CatalogView';
import { LandingPage } from './LandingPage';
import { MasterTailorChat } from './MasterTailorChat';
import { OrderTrackingDashboard } from './OrderTrackingDashboard';
import { SavedView } from './SavedView';
import type { CartItem, CurrencyCode, NavTabId, OrderRecord, ProductItem, UserAccount } from '../types';

interface AppMainContentProps {
  activeTab: NavTabId;
  setActiveTab: Dispatch<SetStateAction<NavTabId>>;
  products: ProductItem[];
  onOpenQuickView: (product: ProductItem | null) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenChatWithTailor: (tailorName: string, context?: string) => void;
  currency: CurrencyCode;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenUserAuth: () => void;
  chatTailorName?: string;
  chatContext?: string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  searchQuery: string;
  orders: OrderRecord[];
  onAddProduct: (product: ProductItem) => void;
  onUpdateProduct: (product: ProductItem) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrder: (order: OrderRecord) => void;
  onDeleteOrder: (orderId: string) => void;
  onLogout: () => Promise<void>;
}

export function AppMainContent(props: AppMainContentProps) {
  const {
    activeTab,
    setActiveTab,
    products,
    onOpenQuickView,
    onAddToCart,
    onOpenChatWithTailor,
    currency,
    currentUser,
    onOpenAuth,
    onOpenUserAuth,
    chatTailorName,
    chatContext,
    wishlist,
    onToggleWishlist,
    searchQuery,
    orders,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onUpdateOrder,
    onDeleteOrder,
    onLogout,
  } = props;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <main className="flex-1 bg-white">
      {activeTab === 'home' && (
        <LandingPage
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            scrollToTop();
          }}
          onOpenQuickView={onOpenQuickView}
          onAddToCart={onAddToCart}
          currency={currency}
          products={products}
          currentUser={currentUser}
          onOpenAuth={onOpenUserAuth}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
        />
      )}

      {activeTab === 'catalog' && (
        <CatalogView
          products={products}
          onOpenQuickView={onOpenQuickView}
          onAddToCart={onAddToCart}
          onOpenChatWithTailor={onOpenChatWithTailor}
          currency={currency}
          searchQuery={searchQuery}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
        />
      )}

      {activeTab === 'saved' && (
        <SavedView
          products={products}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          onOpenQuickView={onOpenQuickView}
          onAddToCart={onAddToCart}
          onNavigateCatalog={() => {
            setActiveTab('catalog');
            scrollToTop();
          }}
          currency={currency}
          currentUser={currentUser}
          onOpenAuth={onOpenUserAuth}
        />
      )}

      {activeTab === 'tracking' && (
        <OrderTrackingDashboard
          orders={orders}
          onOpenChatWithTailor={onOpenChatWithTailor}
          currency={currency}
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
        />
      )}

      {activeTab === 'chat' && (
        <MasterTailorChat initialTailorName={chatTailorName} initialContext={chatContext} />
      )}

      {activeTab === 'admin' && (
        <AdminPortal
          products={products}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
          orders={orders}
          onUpdateOrder={onUpdateOrder}
          onDeleteOrder={onDeleteOrder}
          currency={currency}
          currentUser={currentUser}
          onLogout={onLogout}
        />
      )}
    </main>
  );
}
