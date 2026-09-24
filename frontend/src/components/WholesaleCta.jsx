export default function WholesaleCta() {
  return (
    <section id="enquiry" className="py-16 sm:py-24 bg-[#4A0E19] text-[#FAF7F2] relative overflow-hidden">
      {/* Decorative Blur Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B1626] rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <span className="px-4 py-1.5 rounded-full bg-[#C5A059]/20 text-[#E8D39E] text-xs font-semibold uppercase tracking-widest border border-[#C5A059]/30 inline-block">
          B2B Bulk Buyers &amp; Resellers
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#E8D39E] leading-tight">
          Ready to Elevate Your Saree Store’s Collection?
        </h2>

        <p className="text-base sm:text-lg text-[#FAF7F2]/80 max-w-2xl mx-auto leading-relaxed">
          Request our latest digital catalogues, sample swatch boxes, or schedule a virtual video call with our Surat manufacturing studio.
        </p>

        {/* Contact/Enquiry Options Box */}
        <div className="bg-[#FAF7F2]/5 backdrop-blur-md rounded-2xl p-8 border border-[#C5A059]/30 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-[#C5A059]/20 pb-4 sm:pb-0 sm:pr-4">
            <div className="text-[#C5A059] text-sm font-semibold uppercase tracking-wider">⚡ Quick Dispatch</div>
            <div className="text-xs text-[#FAF7F2]/70">24-48 Hours Order Dispatch for Ready Stock</div>
          </div>

          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-[#C5A059]/20 pb-4 sm:pb-0 sm:pr-4">
            <div className="text-[#C5A059] text-sm font-semibold uppercase tracking-wider">📦 MOQ Advantage</div>
            <div className="text-xs text-[#FAF7F2]/70">Flexible Low MOQ per Catalogue Set</div>
          </div>

          <div className="space-y-1">
            <div className="text-[#C5A059] text-sm font-semibold uppercase tracking-wider">🌐 Global Shipping</div>
            <div className="text-xs text-[#FAF7F2]/70">Doorstep Delivery with Duty Assistance</div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="mailto:wholesale@rajwadasarees.com?subject=Wholesale%20Enquiry"
            className="w-full sm:w-auto px-8 py-4 rounded bg-[#C5A059] hover:bg-[#A27F38] text-[#1F1C1D] font-bold text-xs uppercase tracking-widest shadow-xl transition-all"
          >
            Email Wholesale Team
          </a>
          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-4 rounded bg-transparent hover:bg-white/10 text-[#FAF7F2] border border-[#C5A059] font-bold text-xs uppercase tracking-widest transition-all"
          >
            Request Call Back
          </a>
        </div>

      </div>
    </section>
  );
}
