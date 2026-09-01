import React, { useRef } from 'react';
import { 
  ShoppingBag, 
  PackageCheck, 
  MessageSquare, 
  Search, 
  Layers, 
  Menu, 
  X, 
  PhoneCall, 
  User, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  LogOut, 
  Heart,
  ChevronDown
} from 'lucide-react';
import { CurrencyCode, UserAccount, NavTabId } from '../types';

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

interface NavbarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeOrdersCount?: number;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenAdminAuth?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  cartCount,
  wishlistCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  activeOrdersCount = 1,
  currentUser,
  onOpenAuth,
  onOpenAdminAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const lastLogoTapRef = useRef<number>(0);
  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'tailor';

  // Navigation Items
  const allNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'catalog', label: 'All Clothes', icon: Layers },
    { 
      id: 'saved', 
      label: 'Saved', 
      icon: Heart, 
      badge: wishlistCount > 0 ? `${wishlistCount}` : undefined 
    },
    { id: 'chat', label: 'Chat with Tailors', icon: MessageSquare, badge: 'Consult' },
    { 
      id: 'tracking', 
      label: 'Track Order', 
      icon: PackageCheck, 
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} Active` : undefined 
    },
    { 
      id: 'admin', 
      label: currentUser?.role === 'admin' ? 'Admin Portal' : 'Workshop HQ', 
      icon: ShieldCheck, 
      badge: 'HQ', 
      adminOnly: true 
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (isStaff) return false;
    if (item.id === 'saved') return false;
    if (item.adminOnly && currentUser?.role !== 'admin') return false;
    if (item.id === 'tracking' && !currentUser) return false;
    return true;
  });

  // Double tap handler on logo from landing page opens Admin / Tailor Portal
  const handleLogoClick = () => {
    const now = Date.now();
    if (activeTab === 'home' && now - lastLogoTapRef.current < 550) {
      lastLogoTapRef.current = 0;
      if (onOpenAdminAuth) {
        onOpenAdminAuth();
      }
    } else {
      lastLogoTapRef.current = now;
      setActiveTab('home');
    }
  };

  const handleLogoDoubleClick = () => {
    if (activeTab === 'home' && onOpenAdminAuth) {
      onOpenAdminAuth();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all shadow-xs">
      {/* Top Luxury Announcement & Currency Bar */}
      <div className="bg-black text-white py-1.5 px-4 sm:px-6 lg:px-8 text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] sm:text-xs font-medium tracking-wider uppercase text-zinc-200 truncate">
              YK STITCHES · Bespoke Tailoring & Ready-to-Wear · Worldwide Express Delivery
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-zinc-300 text-xs shrink-0">
            <div 
              className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors" 
              onClick={() => setActiveTab('chat')}
            >
              <PhoneCall className="w-3 h-3 text-white" />
              <span className="font-mono text-[11px]">+234 812 YK-STITCH</span>
            </div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[11px]">Currency:</span>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                aria-label="Select currency"
                className="bg-zinc-900 text-white rounded-md px-2 py-0.5 text-[11px] border border-zinc-700 focus:outline-none focus:border-white cursor-pointer font-bold"
              >
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Identity / Logo */}
          <div 
            id="brand-logo-btn"
            onClick={handleLogoClick}
            onDoubleClick={handleLogoDoubleClick}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0 min-w-0"
            title="YK Stitches · Double tap for Admin/Tailor Login"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black border border-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
              <span className="font-serif-luxury text-xl font-bold text-white tracking-tighter">YK</span>
            </div>
            <div>
              <span className="font-serif-luxury text-base sm:text-xl font-bold tracking-wider text-black uppercase block leading-none whitespace-nowrap">
                YK Stitches
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 uppercase font-bold block mt-0.5 whitespace-nowrap">
                Atelier & Bespoke
              </span>
            </div>
          </div>

          {/* Desktop Primary Nav Links */}
          <nav className="hidden lg:flex flex-1 justify-start items-center gap-0.5 min-w-0 overflow-hidden">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSavedTab = item.id === 'saved';

              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] 2xl:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-white bg-black shadow-xs'
                      : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${
                    isActive 
                      ? 'text-white' 
                      : isSavedTab && wishlistCount > 0 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-zinc-500'
                  }`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-zinc-800 text-white'
                          : isSavedTab
                          ? 'bg-red-100 text-red-700'
                          : 'bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 2xl:gap-2.5 shrink-0">
            
            {/* Search Input Bar (Desktop) */}
            {!isStaff && <div className="hidden lg:flex items-center relative w-32 2xl:w-40">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-zinc-50 border border-zinc-300 text-black text-xs rounded-xl pl-8 pr-2.5 py-2 placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-2 text-xs text-zinc-400 hover:text-black font-bold"
                >
                  ×
                </button>
              )}
            </div>}

            {/* Wishlist / Saved Outfits Shortcut */}
            {/* User Authentication Trigger */}
            <div className="flex items-center gap-1">
              <button
                id="auth-modal-btn"
                onClick={onOpenAuth}
                className={`flex items-center gap-1.5 px-2.5 2xl:px-3 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                  currentUser
                    ? currentUser.role === 'admin'
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-zinc-100 text-black border-zinc-300 hover:bg-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800 border-black shadow-xs'
                }`}
                title={currentUser ? `Account: ${currentUser.name}` : 'Sign In or Create Account'}
              >
                {currentUser?.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-white" />
                ) : currentUser ? (
                  <Crown className="w-4 h-4 text-black" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
                <span className="hidden sm:inline">
                  {currentUser
                    ? currentUser.role === 'admin'
                      ? 'Atelier HQ'
                      : currentUser.name.split(' ')[0]
                    : 'Sign In'}
                </span>
              </button>

            </div>

            {/* Shopping Cart Drawer Trigger */}
            {currentUser && !isStaff && (
              <button
                id="shopping-cart-drawer-btn"
                onClick={onOpenCart}
                className="relative p-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center"
                aria-label={`Shopping Bag (${cartCount} items)`}
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span
                    id="cart-count-badge"
                    className="absolute -top-1.5 -right-1.5 bg-white text-black border border-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            {!isStaff && <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && !isStaff && (
        <div className="lg:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-6 space-y-3.5 animate-fade-in shadow-lg">
          {/* User Status Bar in Mobile */}
          {currentUser ? (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs font-serif-luxury">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-black">{currentUser.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      currentUser.role === 'admin' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-800'
                    }`}>
                      {currentUser.role === 'admin' ? 'Atelier HQ' : 'Patron'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block truncate max-w-[170px]">{currentUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-black text-white text-xs font-semibold"
                >
                  My Account
                </button>
                <button
                  id="mobile-menu-logout-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="py-2.5 bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="py-2.5 bg-zinc-100 border border-zinc-300 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>
          )}

          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments, fabrics..."
              className="w-full bg-zinc-50 border border-zinc-300 text-black text-xs rounded-xl pl-9 pr-3 py-2.5 placeholder-zinc-400 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Mobile Nav Links */}
          <div className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSavedTab = item.id === 'saved';

              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${
                      isActive 
                        ? 'text-white' 
                        : isSavedTab && wishlistCount > 0
                        ? 'text-red-500 fill-red-500'
                        : 'text-zinc-500'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-zinc-800 text-white' 
                        : isSavedTab 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-zinc-200 text-zinc-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

          </div>

          {/* Currency selection on mobile */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
            <span className="font-bold">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              aria-label="Select mobile currency"
              className="bg-zinc-100 text-black font-bold rounded-lg px-2.5 py-1 text-xs border border-zinc-300"
            >
              <option value="USD">USD ($)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};
