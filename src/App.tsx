import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AppMainContent } from './components/AppMainContent';
import { AppOverlays } from './components/AppOverlays';
import { AtelierFooter } from './components/AtelierFooter';
import { Navbar } from './components/Navbar';
import type {
  CartItem,
  CurrencyCode,
  NavTabId,
  OrderRecord,
  ProductItem,
  TailorMeasurementProfile,
  UserAccount,
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
        parsed.includes('prod_suit_01') &&
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

    const fetchOrders = () =>
      fetch('/api/orders', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.orders && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch((err) => console.error('Failed to refresh orders:', err));

    fetchOrders();
    const refreshTimer = window.setInterval(fetchOrders, 3000);
    return () => window.clearInterval(refreshTimer);
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

      <AppMainContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        products={products}
        onOpenQuickView={setQuickViewProduct}
        onAddToCart={handleAddToCart}
        onOpenChatWithTailor={handleOpenChatWithTailor}
        currency={currency}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenUserAuth={() => handleOpenUserAuth('user-login')}
        chatTailorName={chatTailorName}
        chatContext={chatContext}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        searchQuery={searchQuery}
        orders={orders}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateOrder={handleUpdateOrder}
        onDeleteOrder={handleDeleteOrder}
        onLogout={handleLogout}
      />

      <AtelierFooter />

      <AppOverlays
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenMeasurements={() => setIsMeasurementModalOpen(true)}
        isMeasurementModalOpen={isMeasurementModalOpen}
        setIsMeasurementModalOpen={setIsMeasurementModalOpen}
        onOpenWishlist={() => {
          setIsAuthModalOpen(false);
          setActiveTab('saved');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onUpdateProfile={handleUpdateProfile}
        orders={orders}
        currency={currency}
        authInitialMode={authInitialMode}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onRemoveCartItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
        measurementProfiles={measurementProfiles}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
        quickViewProduct={quickViewProduct}
        setQuickViewProduct={setQuickViewProduct}
        onAddToCart={handleAddToCart}
        onOpenChatWithTailor={handleOpenChatWithTailor}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
}

export default App;
