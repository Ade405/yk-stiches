import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Package,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  LogOut,
  Crown,
  KeyRound,
  Download,
  Receipt,
  FileText,
  Printer,
  Scissors,
  CheckCircle2,
  Sliders,
  Users
} from 'lucide-react';
import { UserAccount, OrderRecord, CurrencyCode } from '../types';
import { formatPrice } from '../utils/formatters';
import { MASTER_TAILORS } from '../data/tailors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenMeasurements: () => void;
  onUpdateProfile: (user: UserAccount) => void;
  initialMode?: 'user-login' | 'register' | 'profile' | 'admin-login';
  orders?: OrderRecord[];
  currency: CurrencyCode;
}

// -------------------------------------------------------------
// Digital Invoice / Receipt Component
// -------------------------------------------------------------
const DigitalReceiptModal: React.FC<{
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
}> = ({ order, isOpen, onClose, currency }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-300 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Invoice Header */}
        <div className="border-b border-zinc-200 pb-5 text-center space-y-2">
          <div className="inline-block p-2 bg-black text-white rounded-xl shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif-luxury text-black uppercase tracking-wider">
              YK Stitches Atelier
            </h3>
            <p className="text-xs text-zinc-500 font-mono">
              Official Digital Receipt & Bespoke Work Order
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500 block">Order Reference:</span>
            <span className="font-mono font-bold text-black text-sm">#{order.orderNumber}</span>
          </div>
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            <span className="text-zinc-500 block">Order Date:</span>
            <span className="font-bold text-black">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 col-span-2">
            <span className="text-zinc-500 block">Customer & Delivery:</span>
            <span className="font-bold text-black block">{order.customerName}</span>
            <span className="text-zinc-600 block text-[11px] truncate">{order.customerEmail} · {order.shippingAddress}</span>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Garment Items</h4>
          <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-200">
            {order.items.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-black block">{item.product.title}</span>
                  <span className="text-zinc-500 text-[11px]">
                    Size: {item.selectedSize} · Qty: {item.quantity}
                    {item.isCustomTailored && ' · (Custom Bespoke Fitting)'}
                  </span>
                </div>
                <span className="font-mono font-bold text-black">
                  {formatPrice(item.calculatedPrice * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-zinc-900 text-white p-4 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-zinc-300">
            <span>Payment Method:</span>
            <span className="capitalize">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-zinc-300">
            <span>Payment Status:</span>
            <span className="font-bold text-emerald-400 capitalize">{order.paymentStatus}</span>
          </div>
          <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-bold">
            <span>Total Amount Paid:</span>
            <span className="font-mono text-emerald-300">{formatPrice(order.totalAmount, currency)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-black text-white hover:bg-zinc-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Primary Auth Modal Component
// -------------------------------------------------------------
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onOpenMeasurements,
  onUpdateProfile,
  initialMode = 'user-login',
  orders = [],
  currency,
}) => {
  const [authMode, setAuthMode] = useState<'user-login' | 'register' | 'profile' | 'admin-login'>(
    currentUser ? 'profile' : initialMode || 'user-login'
  );

  // Staff Login Toggle: Admin vs Tailor slider
  const [staffRole, setStaffRole] = useState<'admin' | 'tailor'>('admin');
  const [selectedTailorId, setSelectedTailorId] = useState<string>('tailor_yinka');

  const [profileTab, setProfileTab] = useState<'orders' | 'address'>('orders');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [country, setCountry] = useState('Nigeria');
  
  // Admin & Tailor credentials
  const [adminEmail, setAdminEmail] = useState('admin@yk.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [tailorEmail, setTailorEmail] = useState('tailor.yinka@yk.com');
  const [tailorPassword, setTailorPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected order for digital receipt modal
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'admin-login') {
        setAuthMode('admin-login');
        setAdminEmail('admin@yk.com');
        setAdminPassword('');
      } else if (currentUser) {
        setAuthMode('profile');
      } else if (initialMode) {
        setAuthMode(initialMode);
      } else {
        setAuthMode('user-login');
      }
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode, currentUser]);

  if (!isOpen) return null;

  // Preset demo accounts
  const DEMO_USER: UserAccount = {
    id: 'usr_adeyinka_1',
    name: 'Adeyinka Adebowale',
    email: 'adeyinka@example.com',
    phone: '+234 803 456 7890',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    address: 'Plot 14, Victoria Island High Street, Suite 402',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postalCode: '101241',
    joinedDate: '2025-11-12T10:00:00.000Z',
    totalSpent: 1240,
    ordersCount: 3,
    measurementsCount: 2,
    vipTier: 'Aristocrat',
    tailorNotes: 'Prefers extra 1.5 inch sleeve ease for ceremonial agbada drape.',
    savedMeasurements: {
      chest: '42 in',
      shoulders: '19.5 in',
      agbadaLength: '58 in',
      neck: '16.5 in',
      trouserLength: '41 in',
      waist: '34 in',
    },
    wishlist: ['prod_agbada_01', 'prod_senator_02'],
  };

  const DEMO_ADMIN: UserAccount = {
    id: 'usr_admin_master',
    name: 'Master Tailor Adeyinka (HQ Admin)',
    email: 'admin@yk.com',
    phone: '+234 812 000 7801',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    address: 'YK Stitches Atelier Flagship, 14 Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postalCode: '101241',
    joinedDate: '2024-01-01T00:00:00.000Z',
    totalSpent: 0,
    ordersCount: 0,
    measurementsCount: 0,
    vipTier: 'Master',
    tailorNotes: 'Lead master cutter & founder. Full store administration & workshop access.',
  };

  const authenticate = async (endpoint: string, payload: Record<string, string>) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.user) throw new Error(data.error || 'Authentication failed');
    onLogin(data.user as UserAccount);
  };

  const handleUserLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await authenticate('/api/auth/login', { email: email.trim(), password });
      setSuccessMsg('Signed in successfully!');
      setTimeout(onClose, 600);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to sign in');
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await authenticate('/api/auth/login', {
        email: adminEmail.trim(),
        password: adminPassword,
      });
      setSuccessMsg('Master Admin HQ authentication verified!');
      setTimeout(onClose, 600);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to sign in');
    }
  };

  const handleTailorLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const chosenTailor = MASTER_TAILORS.find(t => t.id === selectedTailorId) || MASTER_TAILORS[0];
    try {
      await authenticate('/api/auth/login', {
        email: (tailorEmail || `${chosenTailor.id.replace('tailor_', 'tailor.')}@yk.com`).trim(),
        password: tailorPassword,
        role: 'tailor',
      });
      setSuccessMsg(`Welcome to the Atelier Workshop, ${chosenTailor.name}!`);
      setTimeout(onClose, 600);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to sign in');
    }
  };

  const handleSelectTailorPreset = (tailorId: string) => {
    setSelectedTailorId(tailorId);
    const t = MASTER_TAILORS.find(item => item.id === tailorId);
    if (t) {
      setTailorEmail(`${t.id.replace('tailor_', 'tailor.')}@yk.com`);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await authenticate('/api/auth/register', { name, email: email.trim(), password, phone, address, city, country });
      setSuccessMsg('Patron account created successfully!');
      setTimeout(onClose, 600);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to create account');
    }
  };

  const handleUpdateAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated: UserAccount = {
      ...currentUser,
      name: name || currentUser.name,
      address: address || currentUser.address,
      city: city || currentUser.city,
      country: country || currentUser.country,
    };
    fetch(`/api/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: updated.name,
        address: updated.address,
        city: updated.city,
        country: updated.country,
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.user) throw new Error(data.error || 'Unable to update profile');
        onUpdateProfile(data.user as UserAccount);
        setSuccessMsg('Delivery details updated successfully.');
      })
      .catch((error) => setErrorMsg(error instanceof Error ? error.message : 'Unable to update profile'));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-3xl border border-zinc-200 max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-xs">
                {authMode === 'admin-login' ? (
                  staffRole === 'admin' ? <ShieldCheck className="w-5 h-5 text-white" /> : <Scissors className="w-5 h-5 text-white" />
                ) : currentUser ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-serif-luxury font-bold text-base sm:text-lg text-black">
                  {authMode === 'admin-login'
                    ? staffRole === 'admin'
                      ? 'Atelier HQ Admin Portal'
                      : 'Master Tailor Workshop Login'
                    : currentUser
                    ? `Patron Profile · ${currentUser.name}`
                    : authMode === 'register'
                    ? 'Join YK Stitches Atelier'
                    : 'Customer Sign In'}
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  {authMode === 'admin-login'
                    ? 'Authorized Staff & Master Tailor Access'
                    : currentUser
                    ? 'Manage your custom fittings & saved orders'
                    : 'Luxury Bespoke Tailoring & Couture Wardrobe'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-500 hover:text-black border border-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback message banners */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {currentUser && authMode === 'profile' ? (
              // LOGGED IN USER PROFILE VIEW
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg font-serif-luxury">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-black">{currentUser.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          currentUser.role === 'admin' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-800'
                        }`}>
                          {currentUser.role === 'admin' ? 'Atelier HQ' : currentUser.vipTier || 'Patron'}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">{currentUser.email}</span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenMeasurements}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-colors"
                >
                  My Sizes
                </button>

                {/* Profile Navigation Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold">
                  <button
                    onClick={() => setProfileTab('orders')}
                    className={`py-2 rounded-lg transition-all ${
                      profileTab === 'orders' ? 'bg-white text-black shadow-xs' : 'text-zinc-500 hover:text-black'
                    }`}
                  >
                    My Orders & Receipts
                  </button>
                  <button
                    onClick={() => setProfileTab('address')}
                    className={`py-2 rounded-lg transition-all ${
                      profileTab === 'address' ? 'bg-white text-black shadow-xs' : 'text-zinc-500 hover:text-black'
                    }`}
                  >
                    Delivery Address
                  </button>
                </div>

                {/* Orders Tab */}
                {profileTab === 'orders' && (
                  <div className="space-y-3">
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 text-xs">
                        No orders recorded yet. Start shopping in our catalog.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-black">#{order.orderNumber}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 font-bold uppercase">
                                  {order.currentStage}
                                </span>
                              </div>
                              <span className="text-zinc-500 text-[11px] block mt-0.5">
                                {order.items.length} item(s) · Total: {formatPrice(order.totalAmount, currency)}
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-[11px] font-bold shadow-2xs"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Address Tab */}
                {profileTab === 'address' && (
                  <form onSubmit={handleUpdateAddressSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        defaultValue={currentUser.name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Street Address</label>
                      <input
                        type="text"
                        defaultValue={currentUser.address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-600 font-semibold mb-1">City</label>
                        <input
                          type="text"
                          defaultValue={currentUser.city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-semibold mb-1">Country</label>
                        <input
                          type="text"
                          defaultValue={currentUser.country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-black text-white hover:bg-zinc-800 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm mt-2"
                    >
                      Save Address
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                {/* ------------------------------------------------------------- */}
                {/* STAFF LOGIN VIEW (Admin HQ vs Master Tailor Slider) */}
                {/* ------------------------------------------------------------- */}
                {authMode === 'admin-login' ? (
                  <div className="space-y-4">
                    {/* Sliding Account Selector: Store Admin vs Tailor */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Select Staff Account Type:
                      </label>
                      <div className="relative p-1 bg-zinc-100 rounded-2xl border border-zinc-300 flex items-center">
                        {/* Smooth Active Background Slider Pill */}
                        <div
                          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-black rounded-xl transition-all duration-300 shadow-md ${
                            staffRole === 'admin' ? 'left-1' : 'left-[calc(50%+2px)]'
                          }`}
                        />

                        <button
                          type="button"
                          id="staff-slider-admin-btn"
                          onClick={() => {
                            setStaffRole('admin');
                            setErrorMsg('');
                          }}
                          className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                            staffRole === 'admin' ? 'text-white' : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Store Admin (HQ)</span>
                        </button>

                        <button
                          type="button"
                          id="staff-slider-tailor-btn"
                          onClick={() => {
                            setStaffRole('tailor');
                            setErrorMsg('');
                          }}
                          className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                            staffRole === 'tailor' ? 'text-white' : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          <Scissors className="w-4 h-4" />
                          <span>Master Tailor (Workshop)</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: STORE ADMIN HQ */}
                    {staffRole === 'admin' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600">
                          <p className="font-bold text-black mb-1">Store Administrator & Financial Console</p>
                          <p>Manage product catalog, track global revenue, approve client orders, and manage tailoring pipeline.</p>
                          <p className="mt-2 pt-2 border-t border-zinc-200 text-[11px] font-mono text-zinc-700">
                            Staff credentials are verified securely by the atelier server.
                          </p>
                        </div>

                        <form onSubmit={handleAdminLoginSubmit} className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-zinc-700 mb-1">Admin Email</label>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                              <input
                                type="email"
                                required
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                placeholder="admin@yk.com"
                                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:border-black font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-zinc-700 mb-1">Security Passcode</label>
                            <div className="relative">
                              <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                              <input
                                type="password"
                                required
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="Enter your staff passcode"
                                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:border-black font-mono"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            id="submit-admin-login-btn"
                            className="w-full bg-black text-white hover:bg-zinc-800 font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Log In to Admin Console</span>
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Mode 2: MASTER TAILOR WORKSHOP */}
                    {staffRole === 'tailor' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600">
                          <p className="font-bold text-black mb-1">Master Tailor & Artisan Workshop Access</p>
                          <p>Access active cutting schedules, customer measurements, and garment stage transitions.</p>
                        </div>

                        {/* Quick Master Tailor Roster Picker */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-zinc-600 uppercase">
                            Choose Master Tailor Account:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {MASTER_TAILORS.map((tailor) => {
                              const isSelected = selectedTailorId === tailor.id;
                              return (
                                <button
                                  key={tailor.id}
                                  type="button"
                                  onClick={() => handleSelectTailorPreset(tailor.id)}
                                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                                    isSelected
                                      ? 'bg-black text-white border-black shadow-xs'
                                      : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                                  }`}
                                >
                                  <img
                                    src={tailor.avatar}
                                    alt={tailor.name}
                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                  />
                                  <div className="overflow-hidden">
                                    <span className="font-bold text-[11px] block truncate leading-tight">
                                      {tailor.name.replace('Master Tailor ', '').replace('Senior Couturier ', '')}
                                    </span>
                                    <span className={`text-[9px] block truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                      {tailor.title}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <form onSubmit={handleTailorLoginSubmit} className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-zinc-700 mb-1">Tailor Login Handle</label>
                            <div className="relative">
                              <Scissors className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                              <input
                                type="text"
                                required
                                value={tailorEmail}
                                onChange={(e) => setTailorEmail(e.target.value)}
                                placeholder="tailor.yinka@yk.com"
                                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:border-black font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-zinc-700 mb-1">Workshop Access Passcode</label>
                            <div className="relative">
                              <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                              <input
                                type="password"
                                value={tailorPassword}
                                onChange={(e) => setTailorPassword(e.target.value)}
                                placeholder="Enter your workshop passcode"
                                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:border-black font-mono"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            id="submit-tailor-login-btn"
                            className="w-full bg-black text-white hover:bg-zinc-800 font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                          >
                            <Scissors className="w-4 h-4" />
                            <span>Sign In as Master Tailor</span>
                          </button>
                        </form>
                      </div>
                    )}

                    <div className="text-center pt-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('user-login');
                          setErrorMsg('');
                        }}
                        className="text-xs text-zinc-500 hover:text-black underline font-medium"
                      >
                        Return to Customer Sign In
                      </button>
                    </div>
                  </div>
                ) : (
                  // -------------------------------------------------------------
                  // CUSTOMER SIGN IN & REGISTER
                  // -------------------------------------------------------------
                  <>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-semibold">
                      <button
                        type="button"
                        id="tab-user-login-btn"
                        onClick={() => { setAuthMode('user-login'); setErrorMsg(''); }}
                        className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          authMode === 'user-login' ? 'bg-white text-black shadow-xs font-bold' : 'text-zinc-500 hover:text-black'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>

                      <button
                        type="button"
                        id="tab-user-signup-btn"
                        onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                        className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          authMode === 'register' ? 'bg-white text-black shadow-xs font-bold' : 'text-zinc-500 hover:text-black'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </button>
                    </div>

                    {/* Quick Demo Button */}
                    <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-[11px] text-zinc-500 font-medium">Quick Test Login:</span>
                      <button
                        type="button"
                        onClick={async () => {
                          setErrorMsg('');
                          try {
                            await authenticate('/api/auth/demo', {});
                            setSuccessMsg('Logged in as Adeyinka Adebowale');
                            setTimeout(onClose, 600);
                          } catch (error) {
                            setErrorMsg(error instanceof Error ? error.message : 'Unable to sign in');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-zinc-300 text-black hover:bg-zinc-100 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs"
                      >
                        <Crown className="w-3 h-3 text-black" />
                        <span>Customer Account (Adeyinka)</span>
                      </button>
                    </div>

                    {/* USER LOGIN FORM */}
                    {authMode === 'user-login' && (
                      <form onSubmit={handleUserLoginSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          id="submit-user-login-btn"
                          className="w-full bg-black text-white hover:bg-zinc-800 font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    {/* USER REGISTER / SIGN UP FORM */}
                    {authMode === 'register' && (
                      <form onSubmit={handleRegisterSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Adeyinka Adebowale"
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1">Email</label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@domain.com"
                              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+234 800 000 0000"
                              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                            <input
                              type="password"
                              required
                              minLength={8}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="At least 8 characters"
                              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Delivery Address</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Street address, Apartment or Suite"
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                          />
                        </div>

                        <button
                          type="submit"
                          id="submit-user-signup-btn"
                          className="w-full bg-black text-white hover:bg-zinc-800 font-bold py-3 rounded-xl text-xs transition-all shadow-md"
                        >
                          Create Account
                        </button>
                      </form>
                    )}

                    {/* Staff / Tailor Login direct link at footer */}
                    <div className="text-center pt-3 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('admin-login');
                          setErrorMsg('');
                        }}
                        className="text-xs text-zinc-500 hover:text-black flex items-center justify-center gap-1.5 mx-auto font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Staff & Master Tailor Login</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal Component */}
      <DigitalReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        currency={currency}
      />
    </>
  );
};
