import { X } from 'lucide-react';

export type LegalDocumentId = 'terms' | 'privacy' | 'cookies' | 'shipping' | 'acceptable-use';

interface LegalModalProps {
  documentId: LegalDocumentId;
  onClose: () => void;
}

const documents: Record<LegalDocumentId, { title: string; updated: string; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: 'Terms of Use',
    updated: 'October 22, 2026',
    sections: [
      { heading: 'About these terms', body: 'These terms describe the proposed rules for using the YK Stitches storefront, account features, tailoring consultation, and order tools. The business owner must confirm the legal entity, governing law, and final terms before accepting real orders.' },
      { heading: 'Accounts and security', body: 'Provide accurate account details, keep credentials private, and notify the business if you suspect unauthorized access. Do not impersonate another person or attempt to access another customer’s account.' },
      { heading: 'Products, measurements, and bespoke work', body: 'Product images, colors, fabric appearance, and measurements may vary by screen, material, and fitting. Customers should review garment specifications, measurements, price, delivery estimate, and customization details before confirming an order. Any fitting, alteration, cancellation, and remake commitments must be confirmed in writing for the specific order.' },
      { heading: 'Orders and payment', body: 'An order request is not a guarantee of acceptance or availability. Prices, taxes, delivery charges, payment methods, and order status must be shown clearly before purchase. This repository currently contains demonstration/mock payment flows; do not submit real payment details or treat a demo payment status as proof of payment.' },
      { heading: 'Acceptable use and availability', body: 'Do not misuse the service, upload unlawful or harmful content, probe for vulnerabilities without authorization, or disrupt other users. Features may change or be unavailable during maintenance.' },
      { heading: 'Consumer rights and contact', body: 'Nothing in these terms is intended to remove rights that cannot legally be excluded. These draft terms are not legal advice and must be reviewed by qualified counsel for the countries where the business operates. Proposed contact: concierge@ykstitches.com; confirm this address before launch.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'October 22, 2026',
    sections: [
      { heading: 'Information the app may handle', body: 'Depending on features used, the app may process your name, email, phone number, address, account credentials (stored as password hashes by the server), order and delivery details, garment measurements, tailoring instructions, saved items, chat messages, session identifiers, and staff activity logs. Do not enter sensitive information that is not needed for tailoring or an order.' },
      { heading: 'Why information is used', body: 'Information may be used to create and secure accounts, prepare and track orders, communicate about tailoring, provide customer support, operate staff tools, prevent abuse, and maintain the service.' },
      { heading: 'Service providers and transfers', body: 'If configured, AI consultation may send the message and context you submit to Google Gemini. Supabase may be used for configured backend features. Review the relevant provider privacy terms and configure data processing and retention before enabling these integrations for real customers. This draft does not claim that every integration is enabled.' },
      { heading: 'Storage, security, and retention', body: 'The current app has in-memory data stores for key runtime records; data can be lost on restart and this is not suitable as the sole store for production customer records. Session cookies and security controls are implemented, but no online system can guarantee absolute security. A production operator must set retention periods, backups, access controls, and a process for secure deletion.' },
      { heading: 'Your choices and rights', body: 'Depending on applicable law, you may be able to request access, correction, deletion, restriction, or a copy of your personal information, or object to certain processing. Contact the business to make a request. The operator must add a verified privacy contact and a process to respond within applicable legal deadlines.' },
      { heading: 'Children and policy updates', body: 'The service is not designed to knowingly collect children’s personal information without appropriate authorization. The operator should establish an age policy appropriate to its customers and local law. Material policy changes should be dated and communicated.' },
      { heading: 'Privacy contact', body: 'Proposed contact: concierge@ykstitches.com. Confirm ownership and monitoring before launch. This draft requires legal review, including review for the Nigeria Data Protection Act and any other applicable privacy laws.' },
    ],
  },
  cookies: {
    title: 'Cookies and Session Storage',
    updated: 'October 22, 2026',
    sections: [
      { heading: 'Essential session cookies', body: 'The server uses session cookies to maintain authentication. They are configured as HttpOnly and SameSite=Lax, with Secure enabled in production. These cookies support account security and core service operation.' },
      { heading: 'Other storage', body: 'The application may use browser storage for user-interface state or saved demo data depending on the feature. Review the frontend code and any future analytics or advertising integrations before describing these as exhaustive.' },
      { heading: 'Analytics and advertising', body: 'This project documentation does not establish that analytics or advertising cookies are deployed. If analytics, marketing tags, or other non-essential tracking are added, update this notice and implement any consent controls required by applicable law before enabling them.' },
      { heading: 'Managing cookies', body: 'You can control cookies through your browser, but blocking essential cookies may prevent sign-in and other account features from working.' },
    ],
  },
  shipping: {
    title: 'Shipping, Returns, and Alterations',
    updated: 'October 22, 2026',
    sections: [
      { heading: 'Delivery estimates', body: 'Delivery dates shown in the app are estimates and may depend on fabric availability, fitting approval, production workload, carrier performance, and destination. Confirm the delivery destination, fees, and expected timeline before accepting an order.' },
      { heading: 'Bespoke and customized garments', body: 'Custom garments depend on the measurements and design choices approved by the customer. Before production begins, document the final specifications and the process for measurement corrections, fitting, alterations, delays, and remake requests.' },
      { heading: 'Returns, cancellations, and refunds', body: 'The business owner must publish a clear, legally reviewed policy that states the request window, eligible conditions, cancellation cut-off, refund method and timing, and exceptions for personalized goods. Do not assume that all bespoke items are automatically non-returnable; statutory consumer rights may apply.' },
      { heading: 'Damaged, incorrect, or defective orders', body: 'Customers should be given a clear channel and timeframe to report damaged, incorrect, or defective items, with instructions for supplying order details and supporting photos where appropriate. The final remedy must follow the published policy and applicable law.' },
      { heading: 'Policy status', body: 'This is a draft checklist, not a final commercial promise. Fill in the actual shipping regions, carriers, delivery fees, return address, processing timelines, and customer support process before taking live orders.' },
    ],
  },
  'acceptable-use': {
    title: 'Acceptable Use',
    updated: 'October 22, 2026',
    sections: [
      { heading: 'Use the service lawfully', body: 'Use the storefront, account, order, and chat features only for lawful purposes. Do not submit fraudulent orders, impersonate others, harass staff, or attempt to access information that does not belong to you.' },
      { heading: 'Uploads and messages', body: 'Only submit images, measurements, and messages that you have the right to share. Do not upload unlawful content, malware, private information about others without permission, or content that infringes intellectual-property rights.' },
      { heading: 'Security', body: 'Do not probe, scan, scrape, overload, reverse engineer authentication controls, or interfere with the service without written authorization. Report suspected security issues responsibly to the operator.' },
      { heading: 'Enforcement', body: 'The operator may investigate suspected misuse and restrict access where reasonably necessary and lawful. The final terms should describe an appropriate notice and appeal process where required.' },
    ],
  },
};

export function LegalModal({ documentId, onClose }: LegalModalProps) {
  const document = documents[documentId];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="presentation" onClick={onClose}>
      <section
        aria-labelledby="legal-modal-title"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-2xl"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">YK Stitches · Policy draft</p>
            <h2 className="mt-2 font-serif-luxury text-2xl font-bold" id="legal-modal-title">{document.title}</h2>
            <p className="mt-1 text-xs text-zinc-500">Last updated: {document.updated}</p>
          </div>
          <button aria-label="Close policy" className="rounded-full p-2 hover:bg-zinc-100" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-5 sm:p-6">
          <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            Draft for product review only. Confirm business details and obtain qualified legal review before accepting real customer orders.
          </p>
          <div className="space-y-6">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="mb-2 font-semibold">{section.heading}</h3>
                <p className="text-sm leading-7 text-zinc-700">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
        <footer className="border-t border-zinc-200 p-4 text-right">
          <button className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700" onClick={onClose} type="button">Close</button>
        </footer>
      </section>
    </div>
  );
}
