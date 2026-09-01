import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Ruler, 
  Calendar, 
  ArrowUpRight, 
  Scissors, 
  Sparkles, 
  ExternalLink,
  Save,
  X,
  RefreshCw,
  Eye,
  AlertTriangle,
  FileSpreadsheet,
  LogOut,
  Upload,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { ProductItem, OrderRecord, UserAccount, GarmentCategory, GenderFilter, CurrencyCode } from '../types';
import { formatPrice } from '../utils/formatters';

interface AdminPortalProps {
  products: ProductItem[];
  onAddProduct: (product: ProductItem) => void;
  onUpdateProduct: (product: ProductItem) => void;
  onDeleteProduct: (productId: string) => void;
  orders: OrderRecord[];
  onUpdateOrder: (order: OrderRecord) => void;
  onDeleteOrder: (orderId: string) => void;
  currency: CurrencyCode;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrder,
  onDeleteOrder,
  currency,
  currentUser,
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'users' | 'inventory' | 'orders'>('sales');

  // Users CRM state
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Sales filter state
  const [salesSearch, setSalesSearch] = useState('');
  const [salesStatusFilter, setSalesStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  // Inventory modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [inventorySearch, setInventorySearch] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected order for detailed inspection/milestone advancement
  const [selectedOrderToEdit, setSelectedOrderToEdit] = useState<OrderRecord | null>(null);

  // Load registered users from API
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setUsersList(data.users);
        }
      })
      .catch((err) => console.error('Failed to load users for CRM:', err));
  }, [orders]);

  // Aggregate Sales & Financial Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const totalSalesCount = orders.length;
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'paid').length;
  const averageOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

  // Filtered Orders for Sales View
  const filteredOrders = orders.filter((o) => {
    if (salesStatusFilter !== 'all' && o.paymentStatus !== salesStatusFilter) return false;
    if (salesSearch.trim()) {
      const q = salesSearch.toLowerCase();
      const matchOrderNo = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      const matchAddress = o.deliveryAddress.toLowerCase().includes(q);
      const matchCity = o.deliveryCity.toLowerCase().includes(q);
      return matchOrderNo || matchName || matchEmail || matchAddress || matchCity;
    }
    return true;
  });

  // Filtered Users for CRM View
  const filteredUsers = usersList.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.address.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  // Filtered Products for Inventory View
  const filteredProducts = products.filter((p) => {
    if (!inventorySearch.trim()) return true;
    const q = inventorySearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.fabric.name.toLowerCase().includes(q)
    );
  });

  // Handler for advancing order milestone stage
  const handleAdvanceMilestone = (order: OrderRecord) => {
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
        timestamp: 'In Progress · Updated by Master Tailor',
      };

      const updatedOrder: OrderRecord = {
        ...order,
        currentStageIndex: nextIndex,
        milestones: updatedMilestones,
      };

      onUpdateOrder(updatedOrder);
      if (selectedOrderToEdit?.id === order.id) {
        setSelectedOrderToEdit(updatedOrder);
      }
    }
  };

  // Handler for image file selection / drag-and-drop
  const handleImageFileChange = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        if (base64Data) {
          try {
            const res = await fetch('/api/upload-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64Data,
                filename: file.name,
              }),
            });
            const data = await res.json();
            if (data.imageUrl) {
              setUploadedImageUrl(data.imageUrl);
            } else {
              setUploadedImageUrl(base64Data);
            }
          } catch {
            setUploadedImageUrl(base64Data);
          }
        }
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading failed:', err);
      setIsUploadingImage(false);
    }
  };

  // Handler for saving product from modal (Create or Edit)
  const handleSaveProductForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const category = formData.get('category') as GarmentCategory;
    const gender = formData.get('gender') as GenderFilter;
    const price = Number(formData.get('price')) || 250;
    const originalPrice = Number(formData.get('originalPrice')) || undefined;
    const craftTimeDays = Number(formData.get('craftTimeDays')) || 3;
    const badge = (formData.get('badge') as string) || undefined;
    const isBespokeCustomizable = formData.get('isBespokeCustomizable') === 'on';
    const inStock = formData.get('inStock') === 'on';
    const urlInput = (formData.get('imageUrl') as string) || '';
    const finalImageUrl = uploadedImageUrl || urlInput || (editingProduct?.images[0]) || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80';
    const fabricName = (formData.get('fabricName') as string) || 'Pure Cotton & Wool Blend';
    const fabricComposition = (formData.get('fabricComposition') as string) || '100% Luxury Fiber';
    const fabricOrigin = (formData.get('fabricOrigin') as string) || 'Italy / Lagos Atelier';
    const description = (formData.get('description') as string) || 'Exquisite bespoke creation crafted to individual anatomical measurements.';

    const newOrUpdatedProduct: ProductItem = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      subtitle,
      category,
      gender,
      price,
      originalPrice,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      images: [finalImageUrl],
      fabric: {
        name: fabricName,
        composition: fabricComposition,
        origin: fabricOrigin,
        weight: '260 GSM',
        textureDescription: 'Supple drape with hand-finished interior seams.',
        care: 'Specialist dry clean only.',
      },
      description,
      highlights: [
        'Anatomical pattern drafted to customer blueprint',
        'Reinforced stress seams with hand-sewn bar tacks',
        'Customizable collar, cuff, and button styles',
      ],
      colors: [
        { name: 'Classic Black', hex: '#111111', bgClass: 'bg-[#111111]' },
        { name: 'Pure White', hex: '#FFFFFF', bgClass: 'bg-[#FFFFFF]' },
        { name: 'Deep Navy', hex: '#1B2A4A', bgClass: 'bg-[#1B2A4A]' },
      ],
      sizes: ['Bespoke Custom', '38R', '40R', '42R', '44R', '46L'],
      isBespokeCustomizable,
      craftTimeDays,
      badge,
      inStock,
    };

    if (editingProduct) {
      onUpdateProduct(newOrUpdatedProduct);
    } else {
      onAddProduct(newOrUpdatedProduct);
    }

    setIsUploadModalOpen(false);
    setEditingProduct(null);
    setUploadedImageUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner: Master Admin Headquarters */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Master Atelier Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-white tracking-tight">
            YK Stitches Atelier Console
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Full control over store operations: real-time sales transactions, complete user & delivery address tracking, product catalog uploads and inventory updates, and live workshop milestone controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-black font-bold text-xs px-4 py-3 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Garment</span>
          </button>

          {onLogout && (
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-red-900/50 text-zinc-200 hover:text-white border border-zinc-700 hover:border-red-500 font-bold text-xs px-4 py-3 rounded-xl shadow-sm transition-all"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-1.5 grid grid-cols-2 md:grid-cols-4 gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveSubTab('sales')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'sales'
              ? 'bg-black text-white shadow-md'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Sales & Revenue ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'users'
              ? 'bg-black text-white shadow-md'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User CRM & Addresses ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'inventory'
              ? 'bg-black text-white shadow-md'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'orders'
              ? 'bg-black text-white shadow-md'
              : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Workshop Order Routing</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SALES & REVENUE TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'sales' && (
        <div className="space-y-6">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Total Sales Revenue</span>
              <div className="text-2xl font-bold font-serif-luxury text-black">
                {formatPrice(totalRevenue, currency)}
              </div>
              <p className="text-[11px] text-zinc-500">From {paidOrdersCount} verified transactions</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Total Orders</span>
              <div className="text-2xl font-bold font-serif-luxury text-black">{totalSalesCount}</div>
              <p className="text-[11px] text-zinc-500">Bespoke commissions & Ready-to-wear</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Average Order Value</span>
              <div className="text-2xl font-bold font-serif-luxury text-black">
                {formatPrice(averageOrderValue, currency)}
              </div>
              <p className="text-[11px] text-zinc-500">Luxury spend per patron</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Active Pipeline</span>
              <div className="text-2xl font-bold font-serif-luxury text-black">
                {orders.filter((o) => o.currentStageIndex < 4).length} in Craft
              </div>
              <p className="text-[11px] text-zinc-500">On master artisan cutting tables</p>
            </div>
          </div>

          {/* Sales Filter Bar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                placeholder="Search sales by order #, customer, or address..."
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-4 py-2 text-xs text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Status:</span>
              <select
                value={salesStatusFilter}
                onChange={(e) => setSalesStatusFilter(e.target.value as any)}
                aria-label="Filter sales by payment status"
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black cursor-pointer font-medium"
              >
                <option value="all">All Transactions</option>
                <option value="paid">Paid & Verified</option>
                <option value="pending">Pending Gateway</option>
              </select>
            </div>
          </div>

          {/* Sales & Transactions Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-200">
                  <tr>
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-4">Customer & Contact</th>
                    <th className="py-3.5 px-4">Full Shipping Address</th>
                    <th className="py-3.5 px-4">Garment Items</th>
                    <th className="py-3.5 px-4">Payment Channel</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500">
                        No sales transactions match the current query.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-black block">{order.orderNumber}</span>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-black block">{order.customerName}</span>
                          <span className="text-zinc-500 block">{order.customerEmail}</span>
                          <span className="text-zinc-500 block">{order.customerPhone}</span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-start gap-1.5 text-zinc-800">
                            <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium block leading-tight">{order.deliveryAddress}</span>
                              <span className="text-zinc-500 text-[11px] block">{order.deliveryCity}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="font-medium text-black">
                                {item.quantity}x {item.title || item.product?.title || 'Garment'}
                              </div>
                            ))}
                            <span className="text-[10px] uppercase font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-100">
                              {order.orderType}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-black block">{order.paymentGateway}</span>
                          <span className="text-[10px] text-zinc-500 font-mono block">{order.transactionRef}</span>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-serif-luxury font-bold text-sm text-black block">
                            {formatPrice(order.totalAmount, currency)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrderToEdit(order);
                              setActiveSubTab('orders');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 font-semibold text-xs transition-colors"
                          >
                            Manage Order
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USER / PATRON CRM & ADDRESS DIRECTORY TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* User Search Bar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search patrons by name, email, phone, or address..."
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-4 py-2 text-xs text-black focus:outline-none focus:border-black"
              />
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              Tracking {filteredUsers.length} VIP Patrons & Accounts
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Users Directory List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                    selectedUser?.id === user.id
                      ? 'border-black ring-1 ring-black shadow-md'
                      : 'border-zinc-200 hover:border-zinc-400 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-serif-luxury font-bold text-lg shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-black">{user.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
                            {user.vipTier || 'Patron'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                        <p className="text-xs text-zinc-500">{user.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block">Total Spend</span>
                      <span className="font-serif-luxury font-bold text-sm text-black block">
                        {formatPrice(user.totalSpent, currency)}
                      </span>
                      <span className="text-[11px] text-zinc-500">{user.ordersCount} Completed Orders</span>
                    </div>
                  </div>

                  {/* Address Badge */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-start gap-2 text-xs text-zinc-700">
                    <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{user.address}</span>, <span>{user.city}</span>, <span>{user.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected User Dossier / Detail Panel */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-24">
              {selectedUser ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                    <div>
                      <h3 className="font-bold text-base text-black font-serif-luxury">{selectedUser.name}</h3>
                      <p className="text-xs text-zinc-500">Patron Dossier & Sizing Records</p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-zinc-400 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contact & Address Details */}
                  <div className="space-y-3 text-xs">
                    <h5 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Contact & Delivery Address</h5>
                    
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-700">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-700">{selectedUser.phone}</span>
                      </div>
                      <div className="flex items-start gap-2 pt-1 border-t border-zinc-200">
                        <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                        <span className="font-medium text-black">
                          {selectedUser.address}, {selectedUser.city}, {selectedUser.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Saved Measurements Summary */}
                  {selectedUser.savedMeasurements && Object.keys(selectedUser.savedMeasurements).length > 0 && (
                    <div className="space-y-3 text-xs">
                      <h5 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-black" />
                        <span>Saved Anatomical Blueprints</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                        {Object.entries(selectedUser.savedMeasurements).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-[10px] text-zinc-500 uppercase block">{key}</span>
                            <span className="font-bold text-black">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tailor Internal Notes */}
                  {selectedUser.tailorNotes && (
                    <div className="space-y-2 text-xs">
                      <h5 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Lead Cutter Notes</h5>
                      <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-700 italic">
                        "{selectedUser.tailorNotes}"
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-zinc-300" />
                  <p className="text-xs">Select any patron to view their full order history, shipping addresses, and saved measurements.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRODUCT INVENTORY MANAGEMENT TAB (Upload, Edit, Delete) */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search products by title, category, fabric..."
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-4 py-2 text-xs text-black focus:outline-none focus:border-black"
              />
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setUploadedImageUrl('');
                setIsUploadModalOpen(true);
              }}
              className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Product</span>
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover object-center"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                        {product.badge}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/90 text-black text-[10px] font-bold shadow-sm">
                      {product.craftTimeDays}d Craft
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="uppercase font-bold tracking-wider">{product.category}</span>
                      <span className="font-semibold text-black">{product.gender.toUpperCase()}</span>
                    </div>

                    <h3 className="font-serif-luxury font-bold text-base text-black">{product.title}</h3>
                    <p className="text-xs text-zinc-600 line-clamp-2">{product.subtitle}</p>

                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="font-serif-luxury font-bold text-lg text-black">
                        {formatPrice(product.price, currency)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        product.inStock ? 'bg-zinc-100 text-zinc-900' : 'bg-red-50 text-red-700'
                      }`}>
                        {product.inStock ? 'In Atelier Vault' : 'Made to Order'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsUploadModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-black font-bold text-xs py-2 rounded-xl transition-colors shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Product</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${product.title}" from the atelier catalog?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-white border border-zinc-300 hover:bg-red-50 hover:text-red-700 text-zinc-700 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WORKSHOP ORDER ROUTING & MILESTONE ADVANCER */}
      {/* ========================================================================= */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders Selector List */}
            <div className="space-y-3">
              <h3 className="font-serif-luxury font-bold text-base text-black">Active Workshop Commissions</h3>
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderToEdit(order)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    selectedOrderToEdit?.id === order.id
                      ? 'border-black ring-1 ring-black shadow-md'
                      : 'border-zinc-200 hover:border-zinc-400 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-black text-xs">{order.orderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white uppercase">
                      Stage {order.currentStageIndex + 1}/5
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-black mt-1">{order.customerName}</h4>
                  <p className="text-[11px] text-zinc-500 truncate">{order.items[0]?.title || 'Garment'}</p>
                </div>
              ))}
            </div>

            {/* Selected Order Milestone Controller */}
            <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
              {selectedOrderToEdit ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200">
                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Managing Order</span>
                      <h2 className="text-xl font-bold font-serif-luxury text-black">{selectedOrderToEdit.orderNumber}</h2>
                      <p className="text-xs text-zinc-600">
                        Client: <strong className="text-black">{selectedOrderToEdit.customerName}</strong> ({selectedOrderToEdit.customerPhone})
                      </p>
                    </div>

                    <button
                      onClick={() => handleAdvanceMilestone(selectedOrderToEdit)}
                      disabled={selectedOrderToEdit.currentStageIndex >= selectedOrderToEdit.milestones.length - 1}
                      className="flex items-center gap-2 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all active:scale-95"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>Advance to Next Production Milestone</span>
                    </button>
                  </div>

                  {/* Production Milestone Checklist */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">Atelier Craft Milestones</h4>
                    <div className="space-y-3">
                      {selectedOrderToEdit.milestones.map((ms, idx) => (
                        <div
                          key={ms.id}
                          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                            ms.completed
                              ? 'bg-zinc-50 border-zinc-300'
                              : ms.active
                              ? 'bg-zinc-100 border-black ring-1 ring-black'
                              : 'bg-white border-zinc-200 opacity-60'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            ms.completed
                              ? 'bg-black text-white'
                              : ms.active
                              ? 'bg-black text-white animate-pulse'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}>
                            {idx + 1}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-black">{ms.label}</h5>
                              <span className="text-[10px] text-zinc-500 font-mono">{ms.timestamp}</span>
                            </div>
                            <p className="text-xs text-zinc-600">{ms.description}</p>
                            {ms.tailorNotes && (
                              <p className="text-[11px] text-zinc-700 bg-white p-2 rounded-lg border border-zinc-200 mt-2 italic">
                                Note: {ms.tailorNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <Scissors className="w-8 h-8 mx-auto text-zinc-300" />
                  <p className="text-xs">Select any commission from the list to advance its production stage or add notes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT UPLOAD / EDIT MODAL */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-black rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="bg-black text-white px-6 py-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-white" />
                <h3 className="font-serif-luxury font-bold text-lg text-white">
                  {editingProduct ? 'Edit Atelier Creation' : 'Upload New Product Creation'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setEditingProduct(null);
                }}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingProduct?.title || ''}
                    placeholder="e.g. Imperial Hand-Embroidered Agbada"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Subtitle / Cut Summary</label>
                  <input
                    type="text"
                    name="subtitle"
                    required
                    defaultValue={editingProduct?.subtitle || ''}
                    placeholder="e.g. Triple-piece grand ceremonial robe"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'traditional'}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2 py-2 text-black focus:outline-none focus:border-black font-medium"
                  >
                    <option value="traditional">Imperial Agbada</option>
                    <option value="senator-kaftan">Senator & Kaftan</option>
                    <option value="bespoke-suits">Bespoke Suiting</option>
                    <option value="evening-gowns">Couture Gowns</option>
                    <option value="casual-atelier">Casual Atelier</option>
                    <option value="luxury-fabrics">Luxury Fabrics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    defaultValue={editingProduct?.gender || 'men'}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2 py-2 text-black focus:outline-none focus:border-black font-medium"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Price (USD $)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    defaultValue={editingProduct?.price || 350}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Craft Time (Days)</label>
                  <input
                    type="number"
                    name="craftTimeDays"
                    defaultValue={editingProduct?.craftTimeDays || 4}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Direct File Image Upload with Drag and Drop & URL fallback */}
              <div className="space-y-2">
                <label className="block font-bold text-zinc-700">Product Image (Upload Photo or Paste Image Link)</label>
                
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-black bg-zinc-100 scale-[1.01]'
                      : 'border-zinc-300 hover:border-zinc-500 bg-zinc-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {uploadedImageUrl || editingProduct?.images[0] ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={uploadedImageUrl || editingProduct?.images[0]}
                          alt="Product preview"
                          className="w-16 h-16 object-cover rounded-xl border border-zinc-200 shadow-sm"
                        />
                        <div className="text-left">
                          <p className="font-bold text-black text-xs flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Photo Uploaded Successfully</span>
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Click or drag another image file to replace this photo
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-zinc-800"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-black text-xs">
                        {isUploadingImage ? 'Reading & Uploading Photo...' : 'Click to Upload Product Photo or Drag & Drop'}
                      </p>
                      <p className="text-[11px] text-zinc-500">Supports PNG, JPG, JPEG, WEBP files from your computer or phone</p>
                    </div>
                  )}
                </div>

                {/* Optional URL input fallback */}
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Or Enter Image Web URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={uploadedImageUrl ? '' : undefined}
                    defaultValue={!uploadedImageUrl ? (editingProduct?.images[0] || '') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setUploadedImageUrl('');
                      }
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Fabric Name</label>
                  <input
                    type="text"
                    name="fabricName"
                    defaultValue={editingProduct?.fabric.name || 'Royal Swiss Cotton Voile'}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Composition</label>
                  <input
                    type="text"
                    name="fabricComposition"
                    defaultValue={editingProduct?.fabric.composition || '100% Giza Cotton'}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Badge</label>
                  <input
                    type="text"
                    name="badge"
                    defaultValue={editingProduct?.badge || 'Atelier Signature'}
                    placeholder="e.g. Signature, Limited"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProduct?.description || 'Crafted with master single-needle precision in our flagship atelier.'}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    name="isBespokeCustomizable"
                    defaultChecked={editingProduct ? editingProduct.isBespokeCustomizable : true}
                    className="w-4 h-4 text-black rounded"
                  />
                  <span>Allow 3D Bespoke Customization</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    name="inStock"
                    defaultChecked={editingProduct ? editingProduct.inStock : true}
                    className="w-4 h-4 text-black rounded"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-black hover:bg-zinc-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 font-bold shadow-md"
                >
                  {editingProduct ? 'Save Product Changes' : 'Publish Product to Atelier Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
