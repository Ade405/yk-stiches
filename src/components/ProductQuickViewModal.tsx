import React, { useState } from 'react';
import { 
  X, 
  Scissors, 
  ShoppingBag, 
  Star, 
  Check, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Sparkles, 
  Ruler,
  ChevronRight,
  Heart
} from 'lucide-react';
import { ProductItem, CartItem, CurrencyCode } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductQuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenChatWithTailor?: (tailorName: string, context?: string) => void;
  currency: CurrencyCode;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenChatWithTailor,
  currency,
  wishlist = [],
  onToggleWishlist,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');

  if (!isOpen || !product) return null;

  const currentSize = selectedSize || product.sizes[1] || product.sizes[0];
  const isSaved = wishlist.includes(product.id);

  const handleAddReadyToWear = () => {
    const item: CartItem = {
      id: `cart_${Date.now()}_${product.id}`,
      product,
      quantity: 1,
      isCustomTailored: false,
      selectedSize: currentSize,
      calculatedPrice: product.price,
    };
    onAddToCart(item);
    onClose();
  };

  const handleChatAboutFit = () => {
    if (onOpenChatWithTailor) {
      onOpenChatWithTailor(
        'Adeyinka Adebowale',
        `Custom Fit Inquiry for "${product.title}" (${product.category})`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-3xl border border-zinc-200 w-full max-w-4xl shadow-2xl overflow-hidden relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200 transition-all shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Gallery (5 cols) */}
          <div className="md:col-span-5 bg-zinc-50 p-6 flex flex-col justify-between space-y-4 border-r border-zinc-200">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-200 bg-white relative">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail previews */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIdx === idx ? 'border-black shadow-xs' : 'border-zinc-300 opacity-60'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Garment Spec & Actions (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[80vh]">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span className="uppercase tracking-widest font-bold text-zinc-600">
                  {product.category.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-1 text-black">
                  <Star className="w-3.5 h-3.5 fill-black" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-zinc-400">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="font-serif-luxury font-bold text-2xl text-black">
                {product.title}
              </h2>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-zinc-200">
              <span className="font-serif-luxury text-3xl font-bold text-black">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            {/* Fabric Detail Highlight */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                Fabric Provenance
              </span>
              <div className="flex justify-between font-semibold text-black">
                <span>{product.fabric.name}</span>
                <span className="font-bold">{product.fabric.provenance}</span>
              </div>
              <p className="text-[11px] text-zinc-600">{product.fabric.description}</p>
            </div>

            {/* Standard RTW Size Selector */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-600 font-medium">Ready-to-Wear Size:</span>
                <span className="text-black font-bold">Selected: {currentSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      currentSize === sz
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-zinc-50 text-zinc-800 border-zinc-300 hover:border-black'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="pt-3 border-t border-zinc-200 space-y-3">
              <div className="flex gap-2">
                <button
                  id="quick-add-bag-btn"
                  onClick={handleAddReadyToWear}
                  className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>Order Now — Size {currentSize} ({formatPrice(product.price, currency)})</span>
                </button>

                {onToggleWishlist && (
                  <button
                    id="quick-toggle-wishlist-btn"
                    onClick={() => onToggleWishlist(product.id)}
                    className={`px-4 rounded-xl border flex items-center justify-center transition-all ${
                      isSaved
                        ? 'bg-red-50 border-red-300 text-red-600 shadow-2xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
                    aria-label="Toggle Saved Outfit"
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
                  </button>
                )}
              </div>

              <button
                id="quick-chat-fit-btn"
                onClick={handleChatAboutFit}
                className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-bold py-3 rounded-xl transition-all text-xs"
              >
                <Scissors className="w-4 h-4 text-black" />
                <span>Chat with Tailors for Custom Sizing & Adjustments</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

