import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Scissors,
  Truck,
  Layers,
  ShieldCheck,
  MessageSquare,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export type FAQCategory = 'all' | 'tailoring' | 'shipping' | 'fabrics';

interface FAQItem {
  id: string;
  category: 'tailoring' | 'shipping' | 'fabrics';
  question: string;
  answer: string;
  highlight?: string;
}

interface FAQSectionProps {
  onOpenChatWithTailor?: () => void;
  onBrowseCatalog?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenChatWithTailor,
  onBrowseCatalog,
}) => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>('tailor-1');
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems: FAQItem[] = [
    // Tailoring Process
    {
      id: 'tailor-1',
      category: 'tailoring',
      question: 'How do I provide my measurements for a custom fit?',
      answer:
        'You can easily submit your measurements during checkout or directly via our Master Tailor Chat. We guide you through key body measurements (chest, shoulders, sleeve length, waist, trouser length). If you are unsure, our tailors can assist you in real time or recommend standard sizing profiles based on your height and build.',
      highlight: 'Free live sizing consultation available with our master artisan.',
    },
    {
      id: 'tailor-2',
      category: 'tailoring',
      question: 'How long does it take to make and complete a custom outfit?',
      answer:
        'Standard custom tailoring takes between 5 to 10 business days depending on garment complexity. Intricate pieces such as 3-Piece Royal Suits with hand embroidery or fully canvassed tuxedo suits typically require 8 to 14 business days. We also offer express priority atelier stitching if you have an upcoming wedding or event.',
      highlight: 'Express crafting available for urgent celebrations.',
    },
    {
      id: 'tailor-3',
      category: 'tailoring',
      question: 'What happens if my garment needs minor adjustments after delivery?',
      answer:
        'We stand behind our Perfect Fit Guarantee. If your piece requires any minor fitting adjustments, you can contact our atelier within 14 days of delivery. We will arrange free alteration assistance or guide you through localized adjustments covered by our fitting guarantee.',
      highlight: '100% Perfect Fit Guarantee on all bespoke orders.',
    },
    {
      id: 'tailor-4',
      category: 'tailoring',
      question: 'Can I request custom collar styles, embroidery patterns, or monograms?',
      answer:
        'Absolutely. YK Stitches specializes in custom bespoke details. You can specify collar cuts (mandarin, bishop, classic spread), custom chest embroidery designs, hidden button plackets, and personalized monogram initials inside your jacket or chest pocket.',
    },

    // Shipping & Delivery
    {
      id: 'shipping-1',
      category: 'shipping',
      question: 'Where do you ship, and what are the delivery timelines?',
      answer:
        'We ship domestically across Nigeria (Lagos delivery takes 24–48 hours post-completion; other states take 2–4 days via insured courier). We also provide express worldwide shipping to the UK, US, Canada, Europe, and Ghana via DHL Express (3–6 business days).',
      highlight: 'Fast worldwide express delivery with DHL & FedEx.',
    },
    {
      id: 'shipping-2',
      category: 'shipping',
      question: 'How do I track my order while it is being made and shipped?',
      answer:
        'Once logged in to your account, you can visit the "Track Order" dashboard to follow each milestone live: from fabric inspection and pattern drafting, to hand embroidery, quality pressing, and courier dispatch with live tracking numbers.',
    },
    {
      id: 'shipping-3',
      category: 'shipping',
      question: 'How are the clothes packaged for transit?',
      answer:
        'Every outfit is steam-pressed and packed in premium breathable garment bags and reinforced protective presentation boxes to ensure your attire arrives crisp, uncreased, and ready to wear straight out of the box.',
    },

    // Fabric Quality & Sourcing
    {
      id: 'fabrics-1',
      category: 'fabrics',
      question: 'What types of fabrics do you use for Senator suits and Kaftans?',
      answer:
        'We source only high-grade premium textiles: 100% Swiss and Egyptian cottons, structured tropical worsted wools, cashmere wool blends, and smooth crepe fabrics. All fabrics are breathable, resistant to fading, and maintain a sharp, elegant drape throughout the day.',
      highlight: 'Pre-shrunk, color-fast, and breathable luxury textiles.',
    },
    {
      id: 'fabrics-2',
      category: 'fabrics',
      question: 'Are your traditional fabrics (Aso-Oke and Brocade) authentic?',
      answer:
        'Yes. Our traditional ceremonial attire uses authentic hand-woven Aso-Oke woven by heritage weavers in southwestern Nigeria, alongside original Austrian brocades and luxury jacquards with rich luster and durability.',
    },
    {
      id: 'fabrics-3',
      category: 'fabrics',
      question: 'How should I wash and care for my custom tailored clothes?',
      answer:
        'For Senator suits, traditional suits, and bespoke tuxedos, we recommend professional dry cleaning to protect structured interlinings and hand embroidery. For pure cotton Kaftans, gentle hand wash with mild detergent and low steam pressing will keep your garment looking pristine for years.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'tailoring', label: 'Tailoring & Fit', icon: Scissors },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'fabrics', label: 'Fabric & Quality', icon: Layers },
  ];

  const filteredItems = faqItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-white border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-black text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-black" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-black">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Find quick answers about our bespoke tailoring process, international shipping, and premium fabric selection.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          {/* Search input */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              id="faq-search-input"
              type="text"
              placeholder="Search questions (e.g. measurements, shipping, cotton, delivery)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`faq-tab-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id as FAQCategory)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 pt-2">
          {filteredItems.length === 0 ? (
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-8 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="font-serif-luxury font-bold text-base text-black">No matching questions found</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Try searching with different keywords or chat with our master tailor directly.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all"
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  id={`faq-item-${item.id}`}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-white border-black shadow-sm'
                      : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 focus:outline-none"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-zinc-200/70 text-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {item.category === 'tailoring' && <Scissors className="w-3 h-3" />}
                        {item.category === 'shipping' && <Truck className="w-3 h-3" />}
                        {item.category === 'fabrics' && <Layers className="w-3 h-3" />}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-black leading-snug">
                        {item.question}
                      </span>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isExpanded
                          ? 'bg-black text-white border-black rotate-180'
                          : 'bg-white text-zinc-600 border-zinc-300'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-zinc-100 space-y-3 text-xs sm:text-sm text-zinc-600 leading-relaxed animate-fade-in">
                      <p>{item.answer}</p>
                      {item.highlight && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100 text-black text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                          <span>{item.highlight}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions? Banner */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif-luxury font-bold text-base sm:text-lg text-black flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span>Still have questions or need custom styling advice?</span>
            </h3>
            <p className="text-xs text-zinc-500 max-w-lg">
              Our Master Tailors are available online to assist with fabric choices, custom fitting, and special event deadlines.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenChatWithTailor && (
              <button
                id="faq-chat-tailor-btn"
                onClick={onOpenChatWithTailor}
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-2 active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat with Master Tailor</span>
              </button>
            )}
            {onBrowseCatalog && (
              <button
                id="faq-browse-catalog-btn"
                onClick={onBrowseCatalog}
                className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-black border border-zinc-300 font-bold rounded-xl text-xs transition-all active:scale-95"
              >
                Browse Clothes
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
