import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Crown, 
  Scissors, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  CreditCard, 
  FileText
} from 'lucide-react';
import { OrderRecord, CurrencyCode } from '../types';
import { formatPrice } from '../utils/formatters';

interface DigitalReceiptModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  currency,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTextReceipt = () => {
    const lines = [
      '==================================================',
      '                 YK STITCHES                      ',
      '          Official Order Receipt                  ',
      '==================================================',
      `Receipt No:     ${order.orderNumber}`,
      `Date:           ${new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'full' })}`,
      `Customer Name:  ${order.customerName}`,
      `Email:          ${order.customerEmail}`,
      `Phone:          ${order.customerPhone}`,
      `Delivery To:    ${order.deliveryAddress}, ${order.deliveryCity}`,
      '--------------------------------------------------',
      'ORDERED ITEMS:',
      ...order.items.map((item: any, idx: number) => {
        const title = item.product?.title || item.title || 'Custom Outfit';
        const price = item.calculatedPrice || item.price || 0;
        const qty = item.quantity || 1;
        return ` [${idx + 1}] ${title} (x${qty}) - ${formatPrice(price * qty, currency)}`;
      }),
      '--------------------------------------------------',
      `Total Paid:     ${formatPrice(order.totalAmount, currency)}`,
      `Payment Method: ${order.paymentGateway} (${order.transactionRef})`,
      `Payment Status: ${order.paymentStatus.toUpperCase()} (Confirmed)`,
      `Tailor:         ${order.assignedTailor?.name || 'Master Tailor Adeyinka'}`,
      '==================================================',
      'Thank you for choosing YK Stitches.',
      '14 Victoria Island · Lagos, Nigeria · +234 812 YK-STITCH',
      '==================================================',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white text-black rounded-3xl border border-zinc-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Bar (Hidden in Print) */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-sm text-white">
                Official Digital Receipt
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                {order.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white transition-all shadow-xs"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadTextReceipt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs font-bold transition-all shadow-xs"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close receipt"
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white font-sans text-xs text-black">
          
          {/* Atelier Brand Banner */}
          <div className="flex items-start justify-between border-b border-zinc-300 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-serif-luxury font-bold text-sm">
                  YK
                </div>
                <span className="font-serif-luxury font-bold text-xl tracking-wider text-black">
                  YK STITCHES
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                Custom Tailoring & Made-to-Fit Clothes
              </p>
              <p className="text-[11px] text-zinc-600">
                14 Victoria Island High Street · Lagos, Nigeria<br />
                support@ykstitches.com · +234 812 YK-STITCH
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                Official Receipt
              </span>
              <p className="font-mono font-bold text-xs text-black">{order.orderNumber}</p>
              <p className="text-[10px] text-zinc-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Bill-To & Delivery Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                Customer Details
              </span>
              <p className="font-bold text-black text-xs">{order.customerName}</p>
              <p className="text-zinc-600 text-[11px]">{order.customerEmail}</p>
              <p className="text-zinc-600 text-[11px]">{order.customerPhone}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                Delivery Address
              </span>
              <p className="font-medium text-black text-[11px]">{order.deliveryAddress}</p>
              <p className="text-zinc-600 text-[11px]">{order.deliveryCity}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">
                Expected Delivery: {order.estimatedDeliveryDate}
              </p>
            </div>
          </div>

          {/* Itemized Garment Table */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Items in this Order
            </span>

            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 border-b border-zinc-200 text-[10px] uppercase font-bold text-zinc-600">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {order.items.map((item: any, idx: number) => {
                    const title = item.product?.title || item.title || 'Custom Outfit';
                    const fabric = item.product?.fabric?.name || item.fabric || 'Quality Wool & Cotton Fabric';
                    const isCustom = item.isCustomTailored || item.isCustom;
                    const price = item.calculatedPrice || item.price || 0;
                    const qty = item.quantity || 1;

                    return (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-black">{title}</p>
                          <p className="text-[10px] text-zinc-500">{fabric}</p>
                          {isCustom && (
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 uppercase mt-0.5">
                              Custom Tailored to Fit
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center text-zinc-700">{qty}</td>
                        <td className="py-2.5 px-3 text-right text-zinc-700 font-mono">{formatPrice(price, currency)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-black font-mono">{formatPrice(price * qty, currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(order.totalAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tailoring & Sewing</span>
                <span className="text-emerald-700 font-medium">Included</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Fitting & Sizing</span>
                <span className="text-emerald-700 font-medium">Included</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping / Delivery</span>
                <span className="text-emerald-700 font-medium">Free</span>
              </div>
              <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-sm text-black">
                <span>Total Paid</span>
                <span className="font-mono font-serif-luxury text-base">{formatPrice(order.totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Guarantee Stamp */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Confirmed & Verified</span>
              </div>
              <p className="text-[11px] text-zinc-600">
                Payment Method: <strong className="text-black">{order.paymentGateway}</strong>
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Transaction Ref: {order.transactionRef}
              </p>
            </div>

            {/* Official Atelier Seal */}
            <div className="border border-black rounded-xl p-2.5 text-center shrink-0 w-full sm:w-auto">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black">
                <Scissors className="w-3 h-3" />
                <span>YK STITCHES</span>
              </div>
              <p className="text-[9px] text-zinc-500 italic mt-0.5">Master Tailor Adeyinka Certified</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 space-y-1">
            <p>Every outfit comes with our 100% Perfect Fit Guarantee and free adjustments.</p>
            <p className="font-mono text-zinc-400">YK STITCHES · LAGOS · LONDON · NEW YORK</p>
          </div>

        </div>
      </div>
    </div>
  );
};
