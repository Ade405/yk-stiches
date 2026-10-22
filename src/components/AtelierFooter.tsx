import { useState } from 'react';
import {
  Award,
  Clock,
  Mail,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
} from 'lucide-react';
import { LegalModal, type LegalDocumentId } from './LegalModal';

export function AtelierFooter() {
  const [openDocument, setOpenDocument] = useState<LegalDocumentId | null>(null);

  return (
    <footer className="bg-zinc-900 text-white border-t border-zinc-800 mt-16">
      {/* Value Proposition Bar */}
      <div className="border-b border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-xs text-white">Anatomical Precision</h4>
              <p className="text-[11px] text-zinc-400">Individual pattern drafted for every customer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-xs text-white">Imperial Fabrics</h4>
              <p className="text-[11px] text-zinc-400">Swiss Voiles, Cashmeres, & Handwoven Aso-Oke</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-xs text-white">Live Atelier Tracking</h4>
              <p className="text-[11px] text-zinc-400">Direct photos & notes from your lead cutter</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-xs text-white">Flawless Fit Guarantee</h4>
              <p className="text-[11px] text-zinc-400">Complimentary atelier adjustments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links & Atelier Addresses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shadow-md font-bold">
              <Scissors className="w-4 h-4 text-black" />
            </div>
            <span className="font-serif-luxury font-bold text-lg tracking-widest text-white">
              YK STITCHES
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Founded in 2012 by Master Tailor Adeyinka. Merging African royal ceremonial vestments with Savile Row suiting discipline.
          </p>
          <div className="text-[11px] text-white flex items-center gap-2 pt-1 font-semibold">
            <span>Haute Couture & Ready-to-Wear</span>
          </div>
        </div>

        <div>
          <h4 className="font-serif-luxury font-bold text-xs text-white uppercase tracking-wider mb-3">
            Atelier Locations
          </h4>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-white mt-0.5 shrink-0" />
              <span>Flagship: Plot 14, Victoria Island High Street, Lagos</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-white mt-0.5 shrink-0" />
              <span>Bespoke Suite: 18 Savile Row, Mayfair, London UK</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-serif-luxury font-bold text-xs text-white uppercase tracking-wider mb-3">
            Client Concierge
          </h4>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>+234 812 000 7801 (Master Tailor Line)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-white" />
              <span>concierge@ykstitches.com</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Hours: Mon - Sat: 8:00 AM - 8:00 PM</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-serif-luxury font-bold text-xs text-white uppercase tracking-wider mb-3">
            Mobile Payment Gateways
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            Accepting MTN MoMo, Safaricom M-Pesa, Airtel Money, Instant Bank USSD (*737#), and Visa/Mastercard.
          </p>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">MTN MoMo</span>
            <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">M-Pesa</span>
            <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">Bank USSD</span>
            <span className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-300">Card 3DS</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        <nav
          aria-label="Legal and customer policies"
          className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2 px-4"
        >
          {([
            ['terms', 'Terms of Use'],
            ['privacy', 'Privacy Policy'],
            ['cookies', 'Cookies'],
            ['shipping', 'Shipping & Returns'],
            ['acceptable-use', 'Acceptable Use'],
          ] as const).map(([id, label]) => (
            <button
              className="underline underline-offset-4 hover:text-white"
              key={id}
              onClick={() => setOpenDocument(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>
        © {new Date().getFullYear()} YK Stitches Atelier. All rights reserved. Handcrafted with bespoke sartorial excellence.
      </div>
      {openDocument && (
        <LegalModal
          documentId={openDocument}
          onClose={() => setOpenDocument(null)}
        />
      )}
    </footer>
  );
}
