export default function WholesaleCta() {
  return (
    <section
      id="enquiry"
      className="relative overflow-hidden bg-[#4A0E19] py-12 text-[#FAF7F2] sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#C5A059]/10 blur-3xl sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#6B1626] blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-6 px-4 text-center sm:space-y-8 sm:px-6 lg:px-8">
        <span className="inline-block max-w-full rounded-full border border-[#C5A059]/30 bg-[#C5A059]/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E8D39E] sm:text-xs sm:tracking-widest">
          B2B Bulk Buyers &amp; Resellers
        </span>

        <h2 className="font-serif text-xl font-bold leading-tight text-[#E8D39E] sm:text-3xl md:text-4xl lg:text-5xl">
          Ready to Elevate Your Saree Store's Collection?
        </h2>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#FAF7F2]/80 sm:text-lg">
          Request our latest digital catalogues, sample swatch boxes, or
          schedule a virtual video call with our Surat manufacturing studio.
        </p>

        <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-0 rounded-2xl border border-[#C5A059]/30 bg-[#FAF7F2]/5 p-4 text-left backdrop-blur-md sm:grid-cols-3 sm:gap-6 sm:p-8">
          <div className="min-w-0 space-y-1 border-b border-[#C5A059]/20 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] sm:text-sm">
              ⚡ Quick Dispatch
            </div>
            <div className="text-xs leading-relaxed text-[#FAF7F2]/70">
              24-48 Hours Order Dispatch for Ready Stock
            </div>
          </div>

          <div className="min-w-0 space-y-1 border-b border-[#C5A059]/20 py-4 sm:border-b-0 sm:border-r sm:py-0 sm:pr-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] sm:text-sm">
              📦 MOQ Advantage
            </div>
            <div className="text-xs leading-relaxed text-[#FAF7F2]/70">
              Flexible Low MOQ per Catalogue Set
            </div>
          </div>

          <div className="min-w-0 space-y-1 pt-4 sm:pt-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] sm:text-sm">
              🌐 Global Shipping
            </div>
            <div className="text-xs leading-relaxed text-[#FAF7F2]/70">
              Doorstep Delivery with Duty Assistance
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4 sm:pt-4">
          <a
            href="mailto:wholesale@rajwadasarees.com?subject=Wholesale%20Enquiry"
            className="inline-flex min-h-11 w-full items-center justify-center rounded border border-[#C5A059]/40 bg-[#C5A059] px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-[#1F1C1D] shadow-xl transition-all hover:bg-[#A27F38] focus:outline-none focus:ring-2 focus:ring-[#E8D39E] focus:ring-offset-2 focus:ring-offset-[#4A0E19] sm:w-auto sm:px-8 sm:py-4"
          >
            Email Wholesale Team
          </a>

          <a
            href="#contact"
            className="inline-flex min-h-11 w-full items-center justify-center rounded border border-[#C5A059] bg-transparent px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-[#FAF7F2] transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#E8D39E] focus:ring-offset-2 focus:ring-offset-[#4A0E19] sm:w-auto sm:px-8 sm:py-4"
          >
            Request Call Back
          </a>
        </div>
      </div>
    </section>
  );
}