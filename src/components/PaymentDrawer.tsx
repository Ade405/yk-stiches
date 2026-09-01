import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Copy, 
  QrCode,
  CheckCircle2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, OrderRecord, PaymentMethod, CurrencyCode } from '../types';
import { formatPrice } from '../utils/formatters';

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  currency: CurrencyCode;
  onOrderCreated: (order: OrderRecord) => void;
}

export const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currency,
  onOrderCreated,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'processing' | 'success'>('cart');
  const [paymentGateway, setPaymentGateway] = useState<PaymentMethod>('momo');

  // Customer Contact & Shipping Form State
  const [customerName, setCustomerName] = useState('Adeyinka Adebowale');
  const [customerEmail, setCustomerEmail] = useState('adeyinka@example.com');
  const [customerPhone, setCustomerPhone] = useState('+234 803 456 7890');
  const [deliveryAddress, setDeliveryAddress] = useState('Plot 14, Victoria Island High Street');
  const [deliveryCity, setDeliveryCity] = useState('Lagos');
  const [expressDelivery, setExpressDelivery] = useState(true);

  // Mobile Payment Gateway Specific Inputs
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('+234 803 456 7890');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'mtn' | 'mpesa' | 'airtel'>('mtn');
  const [momoPin, setMomoPin] = useState('••••');
  const [stkPromptReceived, setStkPromptReceived] = useState(false);

  // Card Payment Inputs
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardHolder, setCardHolder] = useState('ADEYINKA ADEBOWALE');

  // USSD Bank Selection
  const [selectedBank, setSelectedBank] = useState('GTBank (*737*)');
  const [copiedUssd, setCopiedUssd] = useState(false);

  // Generated Order Details State
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.calculatedPrice * item.quantity, 0);
  const deliveryFee = expressDelivery ? 35 : 15;
  const grandTotal = subtotal + (cartItems.length > 0 ? deliveryFee : 0);

  const handleInitiatePayment = async () => {
    setCheckoutStep('processing');

    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: paymentGateway,
          amount: grandTotal,
          currency,
          customerName,
          customerEmail,
          phoneNumber: customerPhone,
        }),
      });

      const paymentResult = await response.json();

      // Create Order on Backend
      const orderPayload = {
        customerName,
        customerPhone,
        customerEmail,
        items: cartItems,
        orderType: cartItems.some((i) => i.isCustomTailored) ? 'bespoke' : 'ready-to-wear',
        totalAmount: grandTotal,
        currency,
        paymentStatus: 'paid',
        paymentGateway:
          paymentGateway === 'momo'
            ? 'MTN MoMo'
            : paymentGateway === 'mpesa'
            ? 'M-Pesa'
            : paymentGateway === 'airtel'
            ? 'Airtel Money'
            : paymentGateway === 'card'
            ? 'Visa / Mastercard'
            : paymentGateway === 'ussd'
            ? `Instant USSD (${selectedBank.split(' ')[0]})`
            : 'Apple Pay Biometric',
        transactionRef: paymentResult.transactionRef || `TX-${Date.now()}`,
        deliveryAddress,
        deliveryCity,
        expressDelivery,
        assignedTailor: {
          name: 'Master Tailor Adeyinka',
          role: 'Founder & Principal Master Cutter',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          phone: '+234 812 000 7801',
        },
        measurementsSummary: cartItems[0]?.customConfig?.measurements
          ? {
              'Chest Width': `${cartItems[0].customConfig.measurements.chestBust} ${cartItems[0].customConfig.measurements.unit}`,
              'Shoulder Span': `${cartItems[0].customConfig.measurements.shoulderWidth} ${cartItems[0].customConfig.measurements.unit}`,
              'Sleeve Length': `${cartItems[0].customConfig.measurements.sleeveLength} ${cartItems[0].customConfig.measurements.unit}`,
              'Collar Neck': `${cartItems[0].customConfig.measurements.neckCollar} ${cartItems[0].customConfig.measurements.unit}`,
              'Trouser Inseam': `${cartItems[0].customConfig.measurements.inseam} ${cartItems[0].customConfig.measurements.unit}`,
            }
          : undefined,
        specialInstructions: cartItems[0]?.customConfig?.specialInstructions || 'White-glove luxury garment packaging.',
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const newOrderData = await orderResponse.json();
      const createdOrder = newOrderData.order;

      setCompletedOrder(createdOrder);
      setCheckoutStep('success');
      onClearCart();
      onOrderCreated(createdOrder);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#000000', '#52525b', '#a1a1aa', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (error) {
      console.error('Payment failure:', error);
      setCheckoutStep('payment');
    }
  };

  const ussdCode = `*737*50*${Math.round(grandTotal * 1550)}*9824#`;

  const copyUssd = () => {
    navigator.clipboard?.writeText(ussdCode);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end transition-opacity animate-fade-in">
      <div className="w-full max-w-xl bg-white border-l border-zinc-200 h-full flex flex-col shadow-2xl overflow-hidden text-black">
        {/* Drawer Header */}
        <div className="p-5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-base text-black">
                {checkoutStep === 'cart'
                  ? 'Atelier Shopping Bag'
                  : checkoutStep === 'shipping'
                  ? 'Delivery & Patron Details'
                  : checkoutStep === 'payment'
                  ? 'Secure Mobile Payment'
                  : checkoutStep === 'processing'
                  ? 'Authorizing Transaction...'
                  : 'Order Confirmed'}
              </h2>
              <span className="text-[11px] text-zinc-500 font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'Garment' : 'Garments'} · 256-Bit Encrypted
              </span>
            </div>
          </div>

          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors"
            aria-label="Close Shopping Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Shopping Bag Items List */}
        {checkoutStep === 'cart' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto" />
                  <h3 className="font-serif-luxury font-bold text-base text-black">Your Bag is Empty</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Explore our clothing catalog or chat with our master tailors to order your custom made clothes.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex gap-3.5 relative"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-20 object-cover rounded-xl border border-zinc-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif-luxury font-bold text-sm text-black truncate">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.isCustomTailored ? (
                        <div className="mt-1 space-y-0.5">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-black text-white font-bold tracking-wider uppercase">
                            Bespoke Tailored Cut
                          </span>
                          <p className="text-[11px] text-zinc-600 truncate mt-1">
                            {item.customConfig?.fabric} · {item.customConfig?.collarStyle}
                          </p>
                          {item.customConfig?.monogramText && (
                            <p className="text-[10px] text-black font-semibold">
                              Monogram: "{item.customConfig.monogramText}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600 font-medium">Size: {item.selectedSize}</p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200">
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-zinc-300 px-2 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="text-xs text-zinc-600 hover:text-black font-bold px-1"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-black px-1">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="text-xs text-zinc-600 hover:text-black font-bold px-1"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif-luxury font-bold text-sm text-black">
                          {formatPrice(item.calculatedPrice * item.quantity, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-5 bg-zinc-50 border-t border-zinc-200 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600 font-medium">
                    <span>Atelier Subtotal:</span>
                    <span className="text-black font-bold">{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 font-medium">
                    <span>White-Glove Express Delivery:</span>
                    <span className="text-emerald-700 font-bold">{formatPrice(deliveryFee, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-zinc-200">
                    <span className="text-black">Total:</span>
                    <span className="text-black font-serif-luxury text-base">
                      {formatPrice(grandTotal, currency)}
                    </span>
                  </div>
                </div>

                <button
                  id="proceed-shipping-btn"
                  onClick={() => setCheckoutStep('shipping')}
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-transform active:scale-98"
                >
                  <span>Proceed to Shipping & Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Shipping & Patron Information Form */}
        {checkoutStep === 'shipping' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <h3 className="font-serif-luxury font-bold text-sm text-black flex items-center gap-2">
                <User className="w-4 h-4 text-black" />
                <span>Patron & Delivery Information</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-600 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Adeyinka Adebowale"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-black font-medium focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-600 font-medium block mb-1">Email (Order Tracking Link)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@luxury.com"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-black font-medium focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600 font-medium block mb-1">Mobile Phone (Delivery Alerts)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234 803 456 7890"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-black font-medium focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-600 font-medium block mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Plot 14, Victoria Island High Street"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-black font-medium focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-zinc-600 font-medium block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="Lagos, Nigeria"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-black font-medium focus:outline-none focus:border-black"
                  />
                </div>

                {/* Delivery Tier Switcher */}
                <div className="pt-2">
                  <label className="text-zinc-600 font-medium block mb-1.5">Courier Speed</label>
                  <div
                    onClick={() => setExpressDelivery(!expressDelivery)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      expressDelivery
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-zinc-50 border-zinc-300 text-black'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${expressDelivery ? 'bg-white text-black' : 'border border-zinc-400'}`}>
                        {expressDelivery && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-bold block">White-Glove Express Air Dispatch</span>
                        <span className={`text-[10px] ${expressDelivery ? 'text-zinc-300' : 'text-zinc-500'}`}>Garment hand-carried in protective atelier suit carrier</span>
                      </div>
                    </div>
                    <span className="font-bold text-sm">{formatPrice(35, currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-zinc-50 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => setCheckoutStep('cart')}
                className="px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200 border border-zinc-300 text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                id="proceed-payment-gateway-btn"
                onClick={() => setCheckoutStep('payment')}
                className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3 rounded-xl shadow-md transition-all"
              >
                <span>Proceed to Mobile Payment ({formatPrice(grandTotal, currency)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Multi-Channel Mobile Payment Gateways */}
        {checkoutStep === 'payment' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black uppercase tracking-wider">
                  Select Payment Gateway
                </span>
                <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure SSL 256-Bit</span>
                </span>
              </div>

              {/* Gateway Channel Selector Pills */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'momo', label: 'Mobile Money', icon: Smartphone, desc: 'MoMo / M-Pesa' },
                  { id: 'card', label: 'Card Payment', icon: CreditCard, desc: 'Visa / MC' },
                  { id: 'ussd', label: 'Bank USSD', icon: Building2, desc: 'Instant *737#' },
                ].map((g) => {
                  const Icon = g.icon;
                  const isSelected = paymentGateway === g.id;
                  return (
                    <button
                      key={g.id}
                      id={`gateway-pill-${g.id}`}
                      onClick={() => setPaymentGateway(g.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-zinc-50 border-zinc-200 text-black hover:border-zinc-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-white' : 'text-zinc-600'}`} />
                      <div>
                        <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-black'}`}>
                          {g.label}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>{g.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Channel 1: Mobile Money (MTN MoMo, M-Pesa, Airtel) */}
              {paymentGateway === 'momo' && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                    <span className="text-zinc-600 font-medium">Network Provider:</span>
                    <div className="flex gap-2">
                      {[
                        { id: 'mtn', label: 'MTN MoMo' },
                        { id: 'mpesa', label: 'M-Pesa' },
                        { id: 'airtel', label: 'Airtel Money' },
                      ].map((prov) => (
                        <button
                          key={prov.id}
                          onClick={() => setMobileMoneyProvider(prov.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            mobileMoneyProvider === prov.id
                              ? 'bg-black text-white shadow-xs'
                              : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                          }`}
                        >
                          {prov.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-600 font-medium block mb-1">Registered Mobile Money Phone #</label>
                    <input
                      type="tel"
                      value={mobileMoneyNumber}
                      onChange={(e) => setMobileMoneyNumber(e.target.value)}
                      placeholder="+234 803 456 7890"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-black font-mono text-sm focus:outline-none focus:border-black font-medium"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 space-y-1 text-[11px] text-zinc-600">
                    <div className="flex items-center gap-1.5 text-black font-bold">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Instant STK Push Prompt</span>
                    </div>
                    <p>
                      Clicking "Authorize Payment" will prompt a secure push confirmation to your mobile device. Enter your 4-digit PIN on phone to finalize.
                    </p>
                  </div>
                </div>
              )}

              {/* Channel 2: Card Payment */}
              {paymentGateway === 'card' && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-600 font-medium block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8901 2345 6789"
                        className="w-full bg-white border border-zinc-300 rounded-xl pl-3.5 pr-10 py-2.5 text-black font-mono text-sm focus:outline-none focus:border-black"
                      />
                      <CreditCard className="w-4 h-4 text-black absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-600 font-medium block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-black font-mono focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-600 font-medium block mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="892"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-black font-mono focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-600 font-medium block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="ADEYINKA ADEBOWALE"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-black text-xs font-mono uppercase focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              )}

              {/* Channel 3: Bank USSD Instant Code */}
              {paymentGateway === 'ussd' && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-600 font-medium block mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      aria-label="Select Bank for USSD"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-black focus:outline-none focus:border-black font-medium"
                    >
                      <option>GTBank (*737*)</option>
                      <option>Zenith Bank (*966*)</option>
                      <option>Access Bank (*901*)</option>
                      <option>Kuda Microfinance (*894*)</option>
                      <option>Ecobank (*326*)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-zinc-300 text-center space-y-2">
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-bold">
                      Dial USSD String from Phone
                    </span>
                    <div className="font-mono text-base font-bold text-black tracking-wider bg-zinc-100 p-2.5 rounded-xl border border-zinc-200 flex items-center justify-between">
                      <span>{ussdCode}</span>
                      <button
                        onClick={copyUssd}
                        className="text-xs bg-black text-white hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-bold"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedUssd ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Follow on-screen instructions to authorize instant YK Stitches Atelier order settlement.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pay Button Bar */}
            <div className="p-5 bg-zinc-50 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => setCheckoutStep('shipping')}
                className="px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200 border border-zinc-300 text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                id="authorize-payment-btn"
                onClick={handleInitiatePayment}
                className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Authorize & Pay {formatPrice(grandTotal, currency)}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Processing State */}
        {checkoutStep === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-black animate-spin flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-serif-luxury font-bold text-lg text-black">
              Authenticating with Secure Gateway...
            </h3>
            <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
              Verifying tokenized transaction ref with {paymentGateway.toUpperCase()} secure node and logging bespoke garment blueprint into workshop queue.
            </p>
          </div>
        )}

        {/* STEP 5: Order Confirmed & Success */}
        {checkoutStep === 'success' && completedOrder && (
          <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto space-y-6">
            <div className="text-center space-y-3 pt-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif-luxury font-bold text-2xl text-black">
                Commission Received!
              </h3>
              <p className="text-xs text-zinc-600">
                Your order has been officially allocated to Master Tailor Adeyinka at YK Stitches Atelier.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                <span className="text-zinc-500 font-medium">Order Number:</span>
                <span className="font-bold font-serif-luxury text-black text-sm">
                  {completedOrder.orderNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Transaction Ref:</span>
                <span className="font-mono text-emerald-700 font-bold">{completedOrder.transactionRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Total Amount Paid:</span>
                <span className="font-bold text-black">
                  {formatPrice(completedOrder.totalAmount, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Payment Channel:</span>
                <span className="text-black font-medium">{completedOrder.paymentGateway}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                <span className="text-zinc-500 font-medium">Assigned Lead Artisan:</span>
                <span className="text-black font-bold">{completedOrder.assignedTailor.name}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id="view-live-tracking-btn"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-transform active:scale-98"
              >
                <span>View Real-Time Atelier Tracking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

