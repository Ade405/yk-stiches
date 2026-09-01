import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Eye,
  Trash2,
  Sparkles,
  ArrowRight,
  Lock,
  User,
  Layers,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { ProductItem, CurrencyCode, UserAccount, CartItem } from '../types';
import { formatPrice } from '../utils/formatters';

interface SavedViewProps {
  products: ProductItem[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenQuickView: (product: ProductItem) => void;
  onAddToCart: (item: CartItem) => void;
  onNavigateCatalog: () => void;
  currency: CurrencyCode;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  products,
  wishlist,
  onToggleWishlist,
  onOpenQuickView,
  onAddToCart,
  onNavigateCatalog,
  currency,
  currentUser,
  onOpenAuth,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);

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
            Sign In to Access Your Saved Outfits
          </h2>
          <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            Save your favorite Senator suits, Agbadas, and bespoke tuxedos across devices. Sign in or create an account to view and manage your saved luxury wardrobe.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="saved-signin-btn"
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-md text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Sign In / Create Account</span>
          </button>
          <button
            onClick={onNavigateCatalog}
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-sm transition-all"
          >
            Browse All Clothes
          </button>
        </div>
      </div>
    );
  }

  // Filter products by wishlist IDs
  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleDirectAddToCart = (product: ProductItem) => {
    const selectedSize = selectedSizes[product.id] || product.sizes[0] || 'L';
    onAddToCart({
      id: `cart_${product.id}_${Date.now()}`,
      product,
      quantity: 1,
      isCustomTailored: false,
      selectedSize,
      calculatedPrice: product.price,
    });
  };

  const handleMoveAllToBag = () => {
    savedProducts.forEach((product) => {
      handleDirectAddToCart(product);
    });
  };

  const handleShareWishlist = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-black text-xs font-bold uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5 fill-black text-black" />
            <span>Saved Luxury Wardrobe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-luxury text-black">
            My Saved Outfits ({savedProducts.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-xl">
            Keep track of your favorite bespoke pieces, compare fabric specifications, and move garments directly to your tailoring bag.
          </p>
        </div>

        {savedProducts.length > 0 && (
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <button
              onClick={handleShareWishlist}
              className="flex-1 md:flex-none px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-zinc-300"
              title="Copy link to your wishlist"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-black" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Saved List'}</span>
            </button>

            <button
              id="move-all-to-bag-btn"
              onClick={handleMoveAllToBag}
              className="flex-1 md:flex-none px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add All to Bag</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid or Empty State */}
      {savedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-5 shadow-xs max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-black">
              Your Saved Wardrobe is Empty
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              Explore our ready-to-wear Senator cuts, authentic Agbadas, and Italian suits. Click the heart icon on any outfit to save it here for later.
            </p>
          </div>
          <button
            onClick={onNavigateCatalog}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-black text-white font-bold text-xs sm:text-sm hover:bg-zinc-800 shadow-md transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Browse All Clothes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {savedProducts.map((product) => {
            const currentSize = selectedSizes[product.id] || product.sizes[0] || 'L';
            return (
              <div
                key={product.id}
                id={`saved-card-${product.id}`}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 hover:border-black overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col relative"
              >
                {/* Product Image Box */}
                <div
                  onClick={() => onOpenQuickView(product)}
                  className="relative aspect-[4/5] bg-zinc-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Heart / Remove from saved button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-red-600 border border-zinc-200 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    title="Remove from saved"
                    aria-label="Remove from saved"
                  >
                    <Heart className="w-4 h-4 fill-red-600" />
                  </button>

                  {/* Craft Time Pill */}
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2.5 py-1 rounded-lg border border-zinc-300">
                    {product.craftTimeDays}d Handcraft
                  </span>
                </div>

                {/* Info Block */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                      <span className="uppercase tracking-wider font-bold text-zinc-600">
                        {product.category.replace('-', ' ')}
                      </span>
                      <span className="font-mono text-zinc-400">{product.gender}</span>
                    </div>

                    <h3
                      onClick={() => onOpenQuickView(product)}
                      className="font-serif-luxury font-bold text-sm sm:text-base text-black group-hover:text-zinc-700 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {product.title}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  {/* Size Selector for quick add */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                      <span>Size:</span>
                      <span className="font-mono text-black font-bold">{currentSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSizeChange(product.id, s)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                            currentSize === s
                              ? 'bg-black text-white border-black shadow-2xs'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="pt-3 border-t border-zinc-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif-luxury text-base sm:text-lg font-bold text-black">
                          {formatPrice(product.price, currency)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-zinc-400 line-through">
                            {formatPrice(product.originalPrice, currency)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onToggleWishlist(product.id)}
                        className="text-xs text-zinc-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenQuickView(product)}
                        className="flex-1 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleDirectAddToCart(product)}
                        className="flex-1 px-3 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
