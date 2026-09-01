import React, { useState } from 'react';
import { 
  PackageCheck, 
  Search, 
  Clock, 
  Scissors, 
  CheckCircle2, 
  CircleDot, 
  Truck, 
  UserCheck, 
  Phone, 
  MessageSquare, 
  Ruler, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Printer,
  ChevronRight,
  ExternalLink,
  MapPin,
  Lock,
  User
} from 'lucide-react';
import { OrderRecord, MasterTailor, CurrencyCode, UserAccount } from '../types';
import { formatPrice } from '../utils/formatters';

interface OrderTrackingDashboardProps {
  orders: OrderRecord[];
  onOpenChatWithTailor: (tailorName: string, orderContext?: string) => void;
  currency: CurrencyCode;
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
}

export const OrderTrackingDashboard: React.FC<OrderTrackingDashboardProps> = ({
  orders,
  onOpenChatWithTailor,
  currency,
  currentUser,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');

  // If user is not logged in, prompt them to sign in
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto text-black shadow-xs">
          <Lock className="w-8 h-8 text-black" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-black text-xs font-bold uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            <span>Account Required</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-black">
            Sign In to Track Your Orders
          </h2>
          <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            Order tracking is available for registered clients. Please sign in or create an account to view live workshop updates, tailor sewing notes, and courier delivery status.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="tracking-signin-btn"
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-md text-sm transition-all active:scale-95"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  // Filter orders by user if not admin
  const userOrders = currentUser.role === 'admin'
    ? orders
    : orders.filter((o) => o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) || [];
  
  // Only show orders that still have an unfinished production milestone.
  const displayOrders = userOrders.filter((order) => {
    const finalMilestone = order.milestones[order.milestones.length - 1];
    return !finalMilestone?.completed;
  });

  // Find active order
  const activeOrder = displayOrders.find(
    (o) => o.id === selectedOrderId || (searchQuery.trim() && o.orderNumber.toLowerCase() === searchQuery.trim().toLowerCase())
  );

  if (!activeOrder && displayOrders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <PackageCheck className="w-16 h-16 text-black mx-auto opacity-60" />
        <h2 className="text-2xl font-bold font-serif-luxury text-black">No Active Orders Yet</h2>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          You have no garments currently in production. Browse our catalog to place your first custom fit order.
        </p>
      </div>
    );
  }

  const currentStage = activeOrder?.milestones[activeOrder.currentStageIndex];
  const progressPercent = Math.min(
    100,
    activeOrder
      ? Math.round(((activeOrder.currentStageIndex + (currentStage?.completed ? 1 : 0.5)) / activeOrder.milestones.length) * 100)
      : 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header & Order Lookup Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-black text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Live Atelier Production Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif-luxury text-black">
            Real-Time Order Tracking
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Follow each stage of your commission as master artisans cut, embroider, and press your garment.
          </p>
        </div>

        {/* Search / Order Selector Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track by Order # (e.g. YKS-2026-9824)"
              className="bg-zinc-50 border border-zinc-300 text-black text-xs rounded-xl pl-9 pr-4 py-2.5 w-full sm:w-64 focus:outline-none focus:border-black"
            />
          </div>

        </div>
      </div>

      {/* Active orders remain compact until the customer selects one. */}
      <div className="space-y-3">
        {displayOrders.map((order) => {
          const orderStage = order.milestones[order.currentStageIndex];
          const isExpanded = order.id === activeOrder?.id;
          return (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrderId(isExpanded ? '' : order.id)}
              aria-expanded={isExpanded}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                isExpanded
                  ? 'border-black bg-zinc-950 text-white shadow-lg'
                  : 'border-zinc-200 bg-white text-black hover:border-zinc-400'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${isExpanded ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Active Order
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif-luxury font-bold">{order.orderNumber}</span>
                    <span className={`text-xs truncate ${isExpanded ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {order.items[0]?.title || 'Bespoke garment'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${isExpanded ? 'text-white' : 'text-zinc-700'}`}>
                    {orderStage?.label || 'In progress'}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Order Overview Details & Tracking Stage */}
      {activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Milestone Timeline (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Status Card Banner */}
            <div className="bg-black text-white rounded-3xl border border-zinc-800 p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-serif-luxury text-xl font-bold text-white">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-white text-[11px] font-bold uppercase">
                      {activeOrder.orderType}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Estimated Delivery
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white mt-0.5">
                    <Calendar className="w-4 h-4 text-zinc-300" />
                    <span>
                      {new Date(activeOrder.estimatedDeliveryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">Milestone: {currentStage?.label || 'In Crafting'}</span>
                  <span className="text-zinc-400">{progressPercent}% Completed</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Step-by-Step Milestone Visualizer */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold font-serif-luxury text-black flex items-center gap-2">
                <Scissors className="w-5 h-5 text-black" />
                <span>Atelier Milestone Timeline</span>
              </h2>

              <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
                {activeOrder.milestones.map((milestone, idx) => {
                  const isPast = milestone.completed;
                  const isCurrent = milestone.active;

                  return (
                    <div key={milestone.id} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <div
                        className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                          isPast
                            ? 'bg-black border-black text-white'
                            : isCurrent
                            ? 'bg-black border-zinc-900 text-white animate-pulse shadow-md'
                            : 'bg-zinc-100 border-zinc-300 text-zinc-500'
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : isCurrent ? (
                          <CircleDot className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Milestone Content Box */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-zinc-50 border-black ring-1 ring-black shadow-sm'
                            : isPast
                            ? 'bg-zinc-50/70 border-zinc-200'
                            : 'bg-white border-zinc-200 opacity-60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3
                            className={`font-bold text-sm ${
                              isCurrent ? 'text-black font-serif-luxury' : isPast ? 'text-zinc-900' : 'text-zinc-500'
                            }`}
                          >
                            {milestone.label}
                          </h3>
                          <span className="text-[11px] font-mono text-zinc-500">{milestone.timestamp}</span>
                        </div>

                        <p className="text-xs text-zinc-600 mt-1">{milestone.description}</p>

                        {/* Artisan Note */}
                        {milestone.tailorNotes && (
                          <div className="mt-3 p-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 flex items-start gap-2">
                            <span className="text-black font-bold">Artisan Note:</span>
                            <span className="italic">{milestone.tailorNotes}</span>
                          </div>
                        )}

                        {/* Progress Photo taken by tailor during craft */}
                        {milestone.photoUrl && (
                          <div className="mt-3">
                            <span className="text-[10px] uppercase font-bold text-black block mb-1">
                              📸 Workshop Progress Capture
                            </span>
                            <img
                              src={milestone.photoUrl}
                              alt="Garment craft in progress"
                              className="w-32 h-24 object-cover rounded-xl border border-zinc-200 shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Assigned Master Tailor & Measurement Blueprint (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Assigned Master Tailor Card */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Lead Artisan in Charge
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={activeOrder.assignedTailor.avatar}
                  alt={activeOrder.assignedTailor.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-zinc-300 shadow-sm"
                />
                <div>
                  <h3 className="font-serif-luxury font-bold text-sm text-black">
                    {activeOrder.assignedTailor.name}
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium">{activeOrder.assignedTailor.role}</p>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                    <Phone className="w-3 h-3 text-black" />
                    <span>{activeOrder.assignedTailor.phone}</span>
                  </div>
                </div>
              </div>

              <button
                id="chat-assigned-tailor-btn"
                onClick={() =>
                  onOpenChatWithTailor(
                    activeOrder.assignedTailor.name,
                    `Inquiry regarding order #${activeOrder.orderNumber} (${activeOrder.items[0]?.title})`
                  )
                }
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold py-3 rounded-xl shadow transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Master Tailor</span>
              </button>
            </div>

            {/* Garment Blueprint Summary */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Commissioned Garments
              </span>

              {activeOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || item.product?.images?.[0]}
                      alt={item.title || item.product?.title}
                      className="w-12 h-12 object-cover rounded-xl border border-zinc-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-black truncate">
                        {item.title || item.product?.title}
                      </h4>
                      <p className="text-[11px] text-zinc-600 truncate">{item.fabric || item.product?.fabric?.name}</p>
                      <span className="text-[10px] text-zinc-500 font-medium">Qty: {item.quantity} · {item.fit || 'Bespoke'}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Measurement Blueprint Details */}
              {activeOrder.measurementsSummary && Object.keys(activeOrder.measurementsSummary).length > 0 && (
                <div className="pt-3 border-t border-zinc-200">
                  <span className="text-[11px] font-bold text-black flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Cut Specifications</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(activeOrder.measurementsSummary).map(([key, val]) => (
                      <div key={key} className="bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                        <span className="text-zinc-500 block text-[10px] uppercase">{key}:</span>
                        <span className="font-bold text-black">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Details */}
              <div className="pt-3 border-t border-zinc-200 text-xs space-y-1.5">
                <div className="flex items-start gap-2 text-zinc-700">
                  <MapPin className="w-3.5 h-3.5 text-black mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-black">{activeOrder.deliveryAddress}</span>, <span>{activeOrder.deliveryCity}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                  <span>Courier: {activeOrder.expressDelivery ? 'White-Glove Express' : 'Atelier Standard'}</span>
                  <span className="text-black font-bold">Payment: {activeOrder.paymentGateway}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
