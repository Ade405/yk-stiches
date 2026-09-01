import React, { useState, useMemo } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Star, 
  ShoppingBag, 
  Eye, 
  SlidersHorizontal, 
  Check, 
  Layers, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  X,
  RotateCcw,
  Heart
} from 'lucide-react';
import { ProductItem, GarmentCategory, GenderFilter, CartItem, CurrencyCode } from '../types';
import { formatPrice } from '../utils/formatters';

interface CatalogViewProps {
  products: ProductItem[];
  onOpenQuickView: (product: ProductItem) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenChatWithTailor?: (tailorName: string, context?: string) => void;
  currency: CurrencyCode;
  searchQuery: string;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Clothes' },
  { id: 'traditional', label: 'Imperial Agbada' },
  { id: 'senator-kaftan', label: 'Senator & Kaftans' },
  { id: 'bespoke-suits', label: 'Bespoke Suiting' },
  { id: 'evening-gowns', label: 'Couture Gowns' },
  { id: 'casual-atelier', label: 'Casual Wear' },
  { id: 'luxury-fabrics', label: 'Luxury Fabrics' },
] as const;

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onOpenQuickView,
  onAddToCart,
  onOpenChatWithTailor,
  currency,
  searchQuery,
  wishlist = [],
  onToggleWishlist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('all');
  const [selectedGender, setSelectedGender] = useState<GenderFilter>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under-200' | '200-350' | '350-500' | '500-plus'>('all');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [craftSpeed, setCraftSpeed] = useState<'all' | 'express' | 'standard'>('all');
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedGender !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (selectedFabric !== 'all') count++;
    if (craftSpeed !== 'all') count++;
    if (onlyCustomizable) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, selectedGender, priceRange, selectedFabric, craftSpeed, onlyCustomizable, inStockOnly]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setPriceRange('all');
    setSelectedFabric('all');
    setCraftSpeed('all');
    setOnlyCustomizable(false);
    setInStockOnly(false);
    setSortBy('featured');
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Gender filter
      if (selectedGender !== 'all' && item.gender !== selectedGender && item.gender !== 'unisex') {
        return false;
      }
      // Price range
      if (priceRange === 'under-200' && item.price >= 200) return false;
      if (priceRange === '200-350' && (item.price < 200 || item.price > 350)) return false;
      if (priceRange === '350-500' && (item.price < 350 || item.price > 500)) return false;
      if (priceRange === '500-plus' && item.price < 500) return false;

      // Fabric filter
      if (selectedFabric !== 'all') {
        const fabricLower = (item.fabric.name + ' ' + item.fabric.composition).toLowerCase();
        if (!fabricLower.includes(selectedFabric.toLowerCase())) return false;
      }

      // Craft speed
      if (craftSpeed === 'express' && item.craftTimeDays > 3) return false;
      if (craftSpeed === 'standard' && item.craftTimeDays <= 3) return false;

      // In stock
      if (inStockOnly && !item.inStock) return false;

      // Customizable filter
      if (onlyCustomizable && !item.isBespokeCustomizable) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchFabric = item.fabric.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchFabric && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [
    products, 
    selectedCategory, 
    selectedGender, 
    priceRange, 
    selectedFabric, 
    craftSpeed, 
    inStockOnly, 
    onlyCustomizable, 
    searchQuery, 
    sortBy
  ]);

  const handleDirectAddRTW = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem: CartItem = {
      id: `cart_${Date.now()}_${product.id}`,
      product,
      quantity: 1,
      isCustomTailored: false,
      selectedSize: product.sizes[1] || product.sizes[0],
      calculatedPrice: product.price,
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Luxury Editorial Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-200 bg-white text-black p-8 sm:p-12 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-black text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Sartorial Craft & Bespoke Tailoring</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif-luxury text-black tracking-tight leading-tight">
            Artisanal Precision for the <br className="hidden sm:inline" />
            <span>Discerning Aristocracy</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl">
            Explore YK Stitches’ collections of hand-embroidered Agbada robes, bespoke Senator suits, and red-carpet couture. Every seam is cut to anatomical blueprints by master pattern drafters.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-chat-tailor-btn"
              onClick={() => onOpenChatWithTailor?.('Adeyinka Adebowale', 'Inquiry about custom tailoring and sizing')}
              className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Scissors className="w-4 h-4" />
              <span>Chat With Tailors For Custom Fit</span>
            </button>
            <div className="flex items-center gap-6 text-xs text-zinc-600 pt-2 sm:pt-0 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>100% Guaranteed Fit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-black" />
                <span>Express Craft Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Category Quick Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Multi-Dimensional Filter Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-200 text-xs">
          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <span className="text-[11px] text-zinc-500 px-2 font-medium">Wearer:</span>
            {(['all', 'men', 'women'] as const).map((g) => (
              <button
                key={g}
                id={`gender-filter-${g}`}
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1 rounded-lg font-bold uppercase text-[11px] transition-all ${
                  selectedGender === g
                    ? 'bg-black text-white shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Toggle Advanced Filter Drawer Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
                showFilterDrawer || activeFiltersCount > 0
                  ? 'bg-black text-white border-black'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-black text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-black underline font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-zinc-500 font-medium">Sort:</span>
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="bg-zinc-50 border border-zinc-300 text-black text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-black cursor-pointer font-semibold"
              >
                <option value="featured">Featured Atelier Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilterDrawer && (
          <div className="pt-4 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-zinc-50 p-4 rounded-xl">
            {/* Price Range Filter */}
            <div>
              <label className="block font-bold text-zinc-800 mb-1.5">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                aria-label="Filter by price range"
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black font-medium"
              >
                <option value="all">All Prices</option>
                <option value="under-200">Under $200 (Accessories & RTW)</option>
                <option value="200-350">$200 - $350 (Senator & Kaftan)</option>
                <option value="350-500">$350 - $500 (Imperial Agbada)</option>
                <option value="500-plus">$500+ (Master Couture & Velvet)</option>
              </select>
            </div>

            {/* Fabric Filter */}
            <div>
              <label className="block font-bold text-zinc-800 mb-1.5">Fabric & Fiber</label>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                aria-label="Filter by fabric and fiber"
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black font-medium"
              >
                <option value="all">All Luxury Fabrics</option>
                <option value="cotton">Swiss / Giza Cotton</option>
                <option value="wool">Italian Wool & Cashmere</option>
                <option value="brocade">Imperial Gold Brocade</option>
                <option value="damask">Silk Damask</option>
                <option value="velvet">Pure Velvet</option>
                <option value="linen">Irish Linen</option>
              </select>
            </div>

            {/* Craft Speed */}
            <div>
              <label className="block font-bold text-zinc-800 mb-1.5">Crafting Timeline</label>
              <select
                value={craftSpeed}
                onChange={(e) => setCraftSpeed(e.target.value as any)}
                aria-label="Filter by crafting timeline"
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black font-medium"
              >
                <option value="all">All Timelines</option>
                <option value="express">Express Tailoring (≤ 3 Days)</option>
                <option value="standard">Artisanal Standard (4 - 7 Days)</option>
              </select>
            </div>

            {/* Checkbox toggles */}
            <div className="flex flex-col justify-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-zinc-800 cursor-pointer select-none font-semibold">
                <input
                  type="checkbox"
                  checked={onlyCustomizable}
                  onChange={(e) => setOnlyCustomizable(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-400 text-black focus:ring-0"
                />
                <span>Custom Sizing / Fit Available</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-800 cursor-pointer select-none font-semibold">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-400 text-black focus:ring-0"
                />
                <span>Ready-to-Ship Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Filter Results Summary */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> master atelier garments</span>
        {searchQuery && (
          <span>Search results for: "<strong>{searchQuery}</strong>"</span>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <Layers className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-xl font-bold font-serif-luxury text-black">No Matching Atelier Pieces</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view our full collection of bespoke garments.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-zinc-800 shadow transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              onClick={() => onOpenQuickView(product)}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 hover:border-black overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col cursor-pointer"
            >
              {/* Product Image Stage */}
              <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Badge & Craft Time */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  {product.badge && (
                    <span className="px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-wider shadow">
                      {product.badge}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-black text-[10px] font-bold border border-zinc-200 shadow-sm w-fit">
                    {product.craftTimeDays}d Handcraft
                  </span>
                </div>

                {/* Wishlist Heart Button */}
                {onToggleWishlist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full z-10 flex items-center justify-center border transition-all duration-200 shadow-md ${
                      wishlist?.includes(product.id)
                        ? 'bg-white text-red-600 border-red-200 scale-105'
                        : 'bg-white/90 text-zinc-600 hover:text-black border-zinc-200 hover:bg-white hover:scale-105'
                    }`}
                    title={wishlist?.includes(product.id) ? 'Remove from Saved' : 'Save for Later'}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlist?.includes(product.id) ? 'fill-red-600 text-red-600' : ''}`} />
                  </button>
                )}

                {/* Quick Action Floating Overlay: Visible on hover on desktop, always visible subtly on touch/mobile */}
                <div className="absolute inset-x-2.5 sm:inset-x-3 bottom-2.5 sm:bottom-3 flex gap-2 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenQuickView(product);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick View</span>
                  </button>

                  <button
                    onClick={(e) => handleDirectAddRTW(product, e)}
                    className="p-2.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-black shadow-lg transition-transform active:scale-95"
                    title="Quick Add to Bag"
                    aria-label="Quick Add to Bag"
                  >
                    <ShoppingBag className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>

              {/* Product Info Block */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                    <span className="uppercase tracking-wider font-bold text-zinc-600">
                      {product.gender.toUpperCase()} · {product.category.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1 text-black">
                      <Star className="w-3.5 h-3.5 fill-black" />
                      <span className="font-bold">{product.rating}</span>
                      <span className="text-zinc-400">({product.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="font-serif-luxury font-bold text-base text-black group-hover:text-zinc-700 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-zinc-600 line-clamp-2 mt-1">
                    {product.subtitle}
                  </p>
                </div>

                {/* Fabric Material Highlight */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-600 font-medium truncate max-w-[170px]" title={product.fabric.name}>
                    {product.fabric.name}
                  </span>

                  {/* Color Swatch Dots */}
                  <div className="flex items-center gap-1.5">
                    {product.colors.map((c) => (
                      <span
                        key={c.name}
                        className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Pricing & Customizer Prompt */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
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

                  <span className="text-xs text-black font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

