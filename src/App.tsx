import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Package, 
  MessageSquare, 
  Ruler, 
  ShoppingBag, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  HeartHandshake, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CatalogView } from './components/CatalogView';
import { SavedView } from './components/SavedView';
import { OrderTrackingDashboard } from './components/OrderTrackingDashboard';
import { MasterTailorChat } from './components/MasterTailorChat';
import { PaymentDrawer } from './components/PaymentDrawer';
import { MeasurementModal } from './components/MeasurementModal';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { 
  ProductItem, 
  CartItem, 
  OrderRecord, 
  TailorMeasurementProfile, 
  CustomTailoringOption, 
  CurrencyCode,
  UserAccount,
  NavTabId
} from './types';
import { PRODUCTS_CATALOG } from './data/catalog';
import { DEFAULT_MEASUREMENT_PRESETS } from './data/tailors';

export function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication & User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'user-login' | 'register' | 'profile' | 'admin-login'>('user-login');

  const handleOpenUserAuth = (mode: 'user-login' | 'register' = 'user-login') => {
    setAuthInitialMode(currentUser ? 'profile' : mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenAdminAuth = () => {
    setAuthInitialMode('admin-login');
    setIsAuthModalOpen(true);
  };

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  // Wishlist State (persisted locally and synced with user)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      if (currentUser?.wishlist && currentUser.wishlist.length > 0) {
        return currentUser.wishlist;
      }
      const saved = localStorage.getItem('yk_user_wishlist');
      const parsed = saved ? JSON.parse(saved) : [];
      if (
        Array.isArray(parsed) &&
        parsed.length === 2 &&
        parsed.includes('prod_agbada_01') &&
        parsed.includes('prod_senator_02')
      ) {
        localStorage.removeItem('yk_user_wishlist');
        return [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const handleToggleWishlist = (productId: string) => {
    // If not logged in, prompt user to sign in
    if (!currentUser) {
      showToast('Please sign in or create an account to save items to your wishlist.');
      handleOpenUserAuth('user-login');
      return;
    }

    setWishlist((prev) => {
      const isAlreadySaved = prev.includes(productId);
      const updated = isAlreadySaved
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      localStorage.setItem('yk_user_wishlist', JSON.stringify(updated));

      // Sync with currentUser
      const updatedUser: UserAccount = {
        ...currentUser,
        wishlist: updated,
      };
      setCurrentUser(updatedUser);
      const matchedProd = products.find((p) => p.id === productId);
      const prodName = matchedProd ? matchedProd.title : 'Outfit';
      if (isAlreadySaved) {
        showToast(`Removed "${prodName}" from Saved.`);
      } else {
        showToast(`Saved "${prodName}" to your Saved Wardrobe.`);
      }

      return updated;
    });
  };

  // Products State (Dynamically managed for Admin CRUD)
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_CATALOG);

  // Customizer Base Product

  // Chat direct target state
  const [chatTailorName, setChatTailorName] = useState<string | undefined>(undefined);
  const [chatContext, setChatContext] = useState<string | undefined>(undefined);

  // Cart & Orders State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Measurement Profiles State
  const [measurementProfiles, setMeasurementProfiles] = useState<TailorMeasurementProfile[]>(
    DEFAULT_MEASUREMENT_PRESETS
  );

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // The authenticated user is supplied by the server session.
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
      showToast(`Welcome Master Administrator, ${user.name}`);
    } else {
      showToast(`Welcome back, ${user.name}`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch((): undefined => undefined);
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
    showToast('Signed out of YK Stitches session.');
  };

  const handleUpdateProfile = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    showToast('Profile & delivery details updated.');
  };

  // Restore the server-side session; the browser never supplies the authenticated identity.
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          const user = data.user as UserAccount;
          setCurrentUser(user);
          if (user.role === 'admin') setActiveTab('admin');
        }
      })
      .catch((): undefined => undefined);
  }, []);

  // Fetch public catalog and only the orders allowed by the current server session.
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error('Failed to load initial products:', err));

    if (!currentUser) {
      setOrders([]);
      return;
    }

    fetch('/api/orders', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error('Failed to load initial orders:', err));
  }, [currentUser]);

  // Product CRUD Operations for Admin
  const handleAddProduct = async (newProduct: ProductItem) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.product) {
        setProducts((prev) => [data.product, ...prev]);
        showToast(`Product "${data.product.title}" created successfully.`);
      }
    } catch (e) {
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Product "${newProduct.title}" created.`);
    }
  };

  const handleUpdateProduct = async (updatedProduct: ProductItem) => {
    try {
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      const data = await res.json();
      if (data.product) {
        setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? data.product : p)));
        showToast(`Product "${data.product.title}" updated.`);
      }
    } catch (e) {
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      showToast(`Product "${updatedProduct.title}" updated.`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Product deleted from catalog vault.');
    } catch (e) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Product deleted from catalog vault.');
    }
  };

  // Order CRUD Operations for Admin
  const handleUpdateOrder = async (updatedOrder: OrderRecord) => {
    try {
      const res = await fetch(`/api/orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? data.order : o)));
        showToast(`Order #${data.order.orderNumber} updated.`);
      }
    } catch (e) {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      showToast(`Order #${updatedOrder.orderNumber} updated.`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Order record removed.');
    } catch (e) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Order record removed.');
    }
  };

  // Add Item to Cart
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === item.product.id && !i.isCustomTailored && i.selectedSize === item.selectedSize
      );
      if (existingIdx >= 0 && !item.isCustomTailored) {
        const copy = [...prev];
        copy[existingIdx].quantity += item.quantity;
        return copy;
      }
      return [...prev, item];
    });

    showToast(`Added "${item.product.title}" to Atelier Bag.`);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Handle Order created from Checkout Drawer
  const handleOrderCreated = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    setActiveTab('tracking');
    showToast(`Order #${newOrder.orderNumber} successfully booked with Master Tailor!`);
  };

  // Advance production stage for real-time demonstration
  const handleAdvanceOrderStage = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.order) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
          const currentMilestone = data.order.milestones[data.order.currentStageIndex];
          showToast(`Atelier stage advanced: ${currentMilestone?.label || 'Next stage'}`);
          return;
        }
      }
    } catch (e) {
      console.warn('Network stage advance failed, applying local state fallback:', e);
    }

    // Local fallback if network endpoint is unavailable or returns non-JSON
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (order.currentStageIndex < order.milestones.length - 1) {
          const updatedMilestones = [...order.milestones];
          updatedMilestones[order.currentStageIndex] = {
            ...updatedMilestones[order.currentStageIndex],
            completed: true,
            active: false,
          };
          const nextIndex = order.currentStageIndex + 1;
          updatedMilestones[nextIndex] = {
            ...updatedMilestones[nextIndex],
            active: true,
            timestamp: 'Updated Just Now',
          };
          showToast(`Atelier stage advanced: ${updatedMilestones[nextIndex].label}`);
          return {
            ...order,
            currentStageIndex: nextIndex,
            milestones: updatedMilestones,
          };
        }
        return order;
      })
    );
  };

  // Jump to Chat with specific tailor & pre-filled context
  const handleOpenChatWithTailor = (tailorName: string, context?: string) => {
    setChatTailorName(tailorName);
    setChatContext(context);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Measurement Profile handlers
  const handleSaveProfile = (profile: TailorMeasurementProfile) => {
    setMeasurementProfiles((prev) => {
      const exists = prev.some((p) => p.id === profile.id);
      if (exists) {
        return prev.map((p) => (p.id === profile.id ? profile : p));
      }
      return [...prev, profile];
    });
    showToast(`Saved measurement blueprint for "${profile.profileName}".`);
  };

  const handleDeleteProfile = (id: string) => {
    setMeasurementProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black border border-zinc-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeOrdersCount={orders.length}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenUserAuth('user-login')}
        onOpenAdminAuth={handleOpenAdminAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 bg-white">
        {activeTab === 'home' && (
          <LandingPage
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenQuickView={(product) => setQuickViewProduct(product)}
            onAddToCart={handleAddToCart}
            currency={currency}
            products={products}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenUserAuth('user-login')}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogView
            products={products}
            onOpenQuickView={(product) => setQuickViewProduct(product)}
            onAddToCart={handleAddToCart}
            onOpenChatWithTailor={handleOpenChatWithTailor}
            currency={currency}
            searchQuery={searchQuery}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            products={products}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpenQuickView={(product) => setQuickViewProduct(product)}
            onAddToCart={handleAddToCart}
            onNavigateCatalog={() => {
              setActiveTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currency={currency}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenUserAuth('user-login')}
          />
        )}

        {activeTab === 'tracking' && (
          <OrderTrackingDashboard
            orders={orders}
            onOpenChatWithTailor={handleOpenChatWithTailor}
            currency={currency}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onAdvanceOrderStage={handleAdvanceOrderStage}
          />
        )}

        {activeTab === 'chat' && (
          <MasterTailorChat
            initialTailorName={chatTailorName}
            initialContext={chatContext}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            currency={currency}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Monochrome Minimalist Atelier Footer */}
      <footer className="bg-zinc-900 text-white border-t border-zinc-800 mt-16">
        {/* Value Proposition Bar */}
        <div className="border-b border-zinc-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-serif-luxury font-bold text-xs text-white">Anatomical Precision</h4>
                <p className="text-[11px] text-zinc-400">Individual pattern drafted for every customer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-serif-luxury font-bold text-xs text-white">Imperial Fabrics</h4>
                <p className="text-[11px] text-zinc-400">Swiss Voiles, Cashmeres, & Handwoven Aso-Oke</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-serif-luxury font-bold text-xs text-white">Live Atelier Tracking</h4>
                <p className="text-[11px] text-zinc-400">Direct photos & notes from your lead cutter</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-serif-luxury font-bold text-xs text-white">Flawless Fit Guarantee</h4>
                <p className="text-[11px] text-zinc-400">Complimentary atelier adjustments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links & Atelier Addresses */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shadow-md font-bold">
                <Scissors className="w-4 h-4 text-black" />
              </div>
              <span className="font-serif-luxury font-bold text-lg tracking-widest text-white">
                YK STITCHES
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Founded in 2012 by Master Tailor Adeyinka. Merging African royal ceremonial vestments with Savile Row suiting discipline.
            </p>
            <div className="text-[11px] text-white flex items-center gap-2 pt-1 font-semibold">
              <span>Haute Couture & Ready-to-Wear</span>
            </div>
          </div>

          <div>
            <h4 className="font-serif-luxury font-bold text-xs text-white uppercase tracking-wider mb-3">
              Atelier Locations
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white mt-0.5 shrink-0" />
                <span>Flagship: Plot 14, Victoria Island High Street, Lagos</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white mt-0.5 shrink-0" />
                <span>Bespoke Suite: 18 Savile Row, Mayfair, London UK</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-serif-luxury font-bold text-xs text-white uppercase tracking-wider mb-3">
              Client Concierge
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>+234 812 000 7801 (Master Tailor Line)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>concierge@ykstitches.com</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Hours: Mon - Sat: 8:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-serif-luxury font-bold text-xs text-white uppercase tracking-wider mb-3">
              Mobile Payment Gateways
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Accepting MTN MoMo, Safaricom M-Pesa, Airtel Money, Instant Bank USSD (*737#), and Visa/Mastercard.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">MTN MoMo</span>
              <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">M-Pesa</span>
              <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">Bank USSD</span>
              <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">Card 3DS</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} YK Stitches Atelier. All rights reserved. Handcrafted with bespoke sartorial excellence.
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenMeasurements={() => setIsMeasurementModalOpen(true)}
        onUpdateProfile={handleUpdateProfile}
        orders={orders}
        currency={currency}
        initialMode={authInitialMode}
      />

      {/* Shopping Bag & Multi-Channel Payment Drawer */}
      <PaymentDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currency={currency}
        onOrderCreated={handleOrderCreated}
      />

      {/* Measurement Vault Modal */}
      <MeasurementModal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        savedProfiles={measurementProfiles}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenChatWithTailor={handleOpenChatWithTailor}
        currency={currency}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
}

export default App;
