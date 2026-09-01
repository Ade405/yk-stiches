import React from 'react';
import { 
  Scissors, 
  Sparkles, 
  Ruler, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Award, 
  MessageSquare, 
  PackageCheck, 
  Crown, 
  Check, 
  Star, 
  ChevronRight,
  Eye,
  ShoppingBag,
  ExternalLink,
  PhoneCall,
  User,
  UserPlus,
  Package,
  Receipt
} from 'lucide-react';
import { ProductItem, CurrencyCode, UserAccount, NavTabId } from '../types';
import { formatPrice } from '../utils/formatters';
import { FAQSection } from './FAQSection';

interface LandingPageProps {
  onNavigateTab: (tab: NavTabId) => void;
  onOpenQuickView: (product: ProductItem) => void;
  onAddToCart: (item: any) => void;
  currency: CurrencyCode;
  products: ProductItem[];
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'user-login' | 'register') => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateTab,
  onOpenQuickView,
  onAddToCart,
  currency,
  products,
  currentUser,
  onOpenAuth,
}) => {
  const featuredProducts = products.slice(0, 4);

  const curatedCollections = [
    {
      id: 'senators',
      title: 'Three Piece Suits',
      tagline: 'Classic Men\'s Wear',
      desc: 'Clean collar styles, hidden buttons, and fine fabrics tailored for events and business.',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      category: 'senator-kaftan',
      badge: 'Popular Choice',
    },
    {
      id: 'suit',
      title: '3-Piece Royal Suit',
      tagline: 'Wedding & Celebration Wear',
      desc: 'Grand flowing outer robe, inner shirt, and matching trousers with detailed embroidery.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      category: 'traditional',
      badge: 'Signature Style',
    },
    {
      id: 'tuxedos',
      title: 'Evening Suits & Tuxedos',
      tagline: 'Formal Black Tie',
      desc: 'Silk lapels, custom lining, and sharp padded shoulders made to your exact fit.',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      category: 'bespoke-suits',
      badge: 'Dinner & Galas',
    },
    {
      id: 'gowns',
      title: 'Couture Evening Dresses',
      tagline: 'Custom Fit & Draped',
      desc: 'Silk crepes and hand-beaded lace cut to complement your natural shape.',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      category: 'evening-gowns',
      badge: 'Women\'s Couture',
    },
  ];

  const craftSteps = [
    {
      step: '01',
      title: 'Save Your Measurements',
      desc: 'Enter your body sizes or choose a standard fit. We make sure every piece matches your body.',
      icon: Ruler,
    },
    {
      step: '02',
      title: 'Choose Your Fabric & Color',
      desc: 'Select from pure Swiss cottons, soft wools, cashmere blends, and authentic hand-woven fabrics.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'Customize Style & Embroidery',
      desc: 'Pick your collar style, buttons, pockets, custom embroidery patterns, and name initials.',
      icon: Scissors,
    },
    {
      step: '04',
      title: 'Track Your Order Live',
      desc: 'Watch real photos from our workshop as our master tailors cut, sew, iron, and package your outfit.',
      icon: PackageCheck,
    },
  ];

  const testimonials = [
    {
      quote: "YK Stitches made my wedding Suit and Senator outfits. The fit was 100% perfect, right out of the package without any adjustments needed.",
      author: "Oladipo Adeleke",
      title: "Business Executive",
      location: "Lagos & London",
      stars: 5,
    },
    {
      quote: "The 3D customizer made it super easy to design and order my suit from New York. In just a few days, my suit arrived and fit like a glove.",
      author: "Marcus Sterling",
      title: "Architect",
      location: "New York, USA",
      stars: 5,
    },
    {
      quote: "Speaking directly with Master Tailor Adeyinka made all the difference. His advice on fabric and colors was spot on.",
      author: "Dr. Amina Bello",
      title: "Doctor",
      location: "Abuja, Nigeria",
      stars: 5,
    },
  ];

  return (
    <div className="bg-white text-black animate-fade-in">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Column: Headline & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5" />
                  <span>YK STITCHES · CUSTOM TAILORING · EST. 2012</span>
                </div>

                {/* Account status badge */}
                {currentUser ? (
                  <button
                    onClick={() => onOpenAuth()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-bold text-black hover:bg-zinc-200 transition-all shadow-xs"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Welcome, {currentUser.name.split(' ')[0]} (My Orders & Receipts)</span>
                  </button>
                ) : (
                  <button
                    id="hero-patron-signin-badge"
                    onClick={() => onOpenAuth()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-xs font-bold text-zinc-800 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-black" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-luxury tracking-tight text-black leading-[1.15]">
                Custom African Styles & <br className="hidden sm:inline" />
                <span className="underline decoration-zinc-300 decoration-2 underline-offset-8">
                  Tailored Suits Made to Fit
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed">
                Handmade Senator suits, 3-piece Suits, formal tuxedos, and evening dresses. Tailored to your exact body measurements using high quality fabrics with fast worldwide delivery.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  id="hero-explore-catalog-btn"
                  onClick={() => onNavigateTab('catalog')}
                  className="flex items-center gap-2.5 bg-black hover:bg-zinc-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] text-sm"
                >
                  <Layers className="w-4 h-4" />
                  <span>Shop All Clothes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-chat-tailor-btn"
                  onClick={() => onNavigateTab('chat')}
                  className="flex items-center gap-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-bold px-5 py-3.5 rounded-xl shadow-xs transition-all active:scale-[0.98] text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Tailors for Custom Fits</span>
                </button>

                {!currentUser && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="hero-signin-action-btn"
                      onClick={() => onOpenAuth('user-login')}
                      className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-black text-black font-bold px-6 py-4 rounded-xl shadow-xs transition-all active:scale-[0.98] text-base"
                    >
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                    </button>
                    <button
                      id="hero-register-action-btn"
                      onClick={() => onOpenAuth('register')}
                      className="flex items-center gap-2 bg-black hover:bg-zinc-800 border border-black text-white font-bold px-6 py-4 rounded-xl shadow-xs transition-all active:scale-[0.98] text-base"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </button>
                  </div>
                )}

                {currentUser && (
                  <button
                    id="hero-my-orders-btn"
                    onClick={() => onOpenAuth()}
                    className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-300 text-black font-bold px-4 py-3.5 rounded-xl shadow-xs transition-all text-sm"
                  >
                    <Receipt className="w-4 h-4 text-black" />
                    <span>My Orders & Receipts</span>
                  </button>
                )}
              </div>

              {/* Trust Metric Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-200 max-w-xl">
                <div>
                  <span className="text-2xl sm:text-3xl font-bold font-serif-luxury text-black block">4,800+</span>
                  <span className="text-xs text-zinc-500 font-medium">Outfits Delivered</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold font-serif-luxury text-black block">48 Hours</span>
                  <span className="text-xs text-zinc-500 font-medium">Express Sewing Option</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-bold font-serif-luxury text-black block">100%</span>
                  <span className="text-xs text-zinc-500 font-medium">Perfect Fit Guarantee</span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Image Spotlight */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card */}
                <div className="rounded-3xl border border-zinc-200 overflow-hidden shadow-2xl bg-white relative">
                  <div className="relative h-96 sm:h-[460px] overflow-hidden group">
                    <img
                      src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"
                      alt="Handmade Royal Suit"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-xs font-bold w-fit mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Featured Outfit</span>
                      </div>
                      <h3 className="text-xl font-bold font-serif-luxury">Royal suit 3-Piece Set</h3>
                      <p className="text-xs text-zinc-200 mt-1 line-clamp-2">
                        Made with fine Swiss wool-cashmere with detailed gold chest embroidery.
                      </p>
                      <div className="mt-4 pt-3 border-t border-white/20" />
                    </div>
                  </div>
                </div>

                {/* Live Workshop Badge */}
                <div className="absolute -bottom-6 -left-6 bg-black text-white p-4 rounded-2xl border border-zinc-800 shadow-xl hidden sm:flex items-center gap-3 animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Live Workshop</span>
                    <span className="text-xs font-bold text-white">Lagos Tailoring Room is Open</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / VALUE PILLARS */}
      <section className="py-16 border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Why Choose Us</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-black mt-1">
              Quality Tailoring in Every Stitch
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-xs hover:border-black transition-all">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <Ruler className="w-6 h-6" />
              </div>
              <h3 className="font-serif-luxury font-bold text-base text-black">Made to Your Measurements</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every outfit is individually cut to your exact body sizes, shoulder width, chest, and height.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-xs hover:border-black transition-all">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif-luxury font-bold text-base text-black">High Quality Fabrics</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                We use authentic Swiss Voile, fine cashmere wool, Italian suit fabrics, and traditional Aso-Oke.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-xs hover:border-black transition-all">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif-luxury font-bold text-base text-black">Live Order Tracking</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Track your outfit step by step with real photos from the workshop as our tailors cut and sew.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-xs hover:border-black transition-all">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif-luxury font-bold text-base text-black">100% Fit Guarantee</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Free adjustments or a full replacement if your outfit doesn't fit you just the way you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR STYLES & COLLECTIONS */}
      <section className="py-20 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Our Catalog</span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-black mt-1">
                Popular Styles & Collections
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('catalog')}
              className="flex items-center gap-1.5 text-xs font-bold text-black hover:text-zinc-600 transition-colors uppercase tracking-wider self-start md:self-auto"
            >
              <span>View All 24 Outfits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {curatedCollections.map((col) => (
              <div
                key={col.id}
                onClick={() => onNavigateTab('catalog')}
                className="group cursor-pointer rounded-3xl border border-zinc-200 overflow-hidden bg-white hover:shadow-xl transition-all flex flex-col"
              >
                <div className="relative h-72 overflow-hidden bg-zinc-100">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {col.badge}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest block mb-1">
                      {col.tagline}
                    </span>
                    <h3 className="font-serif-luxury font-bold text-lg text-black group-hover:text-zinc-700 transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{col.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-black">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / 4 SIMPLE STEPS */}
      <section className="py-20 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">How It Works</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-black mt-1">
              4 Simple Steps to Your Custom Outfit
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Every order is made with care and overseen directly by Master Tailor Adeyinka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {craftSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative p-6 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif-luxury font-bold text-2xl text-zinc-300">{step.step}</span>
                  </div>
                  <h3 className="font-serif-luxury font-bold text-base text-black">{step.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigateTab('catalog')}
              className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-3.5 rounded-xl hover:bg-zinc-800 transition-all shadow-md text-sm"
            >
              <Layers className="w-4 h-4" />
              <span>Browse All Clothes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-20 border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Reviews</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-black mt-1">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-black text-black" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 italic leading-relaxed">"{t.quote}"</p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif-luxury font-bold text-sm text-black">{t.author}</h4>
                    <p className="text-xs text-zinc-500">{t.title}</p>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <FAQSection
        onOpenChatWithTailor={() => onNavigateTab('chat')}
        onBrowseCatalog={() => onNavigateTab('catalog')}
      />

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 bg-black text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Order?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-serif-luxury tracking-tight text-white">
            Get Your Custom Made Outfit Today
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Whether for a wedding, special celebration, church, work, or evening dinner, our tailors are ready to make your clothes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateTab('catalog')}
              className="bg-white text-black font-bold px-8 py-3.5 rounded-xl hover:bg-zinc-100 transition-all text-sm shadow-xl"
            >
              Shop All Clothes
            </button>
            
            <button
              onClick={() => onOpenAuth()}
              className="bg-zinc-900 border border-zinc-700 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-zinc-800 transition-all text-sm flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{currentUser ? 'My Account & Orders' : 'Sign In / Register'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('chat')}
              className="bg-zinc-900 border border-zinc-700 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-zinc-800 transition-all text-sm flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Chat with Tailors for Custom Fits</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
