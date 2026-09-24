export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] py-12 sm:py-20 lg:py-24 border-b border-[#E5DAC8]">
      {/* Subtle Decorative Pattern Background Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#6B1626_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#6B1626]/10 border border-[#6B1626]/20 text-[#6B1626] text-[11px] sm:text-xs font-semibold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
              Direct B2B Manufacturer &amp; Exporter
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#4A0E19]">
              Exquisite Indian Sarees for Wholesale <span className="text-[#C5A059] italic font-normal">&amp; Bulk Buyers</span>
            </h1>

            <p className="text-sm sm:text-lg text-[#55504E] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Supply your boutique, retail store, or export business with authentic Kanjivaram, Banarasi, Chanderi &amp; Organza sarees. Direct weaver pricing, custom cataloguing, and fast global shipping.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-2 sm:pt-4">
              <a
                href="#collections"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-md bg-[#6B1626] hover:bg-[#4A0E19] text-[#FAF7F2] font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-[#6B1626]/20 border border-[#C5A059]/40 transition-all duration-200 text-center active:scale-95"
              >
                Explore Collections
              </a>
              <a
                href="#enquiry"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-md bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#4A0E19] font-semibold text-xs sm:text-sm tracking-wider uppercase border border-[#C5A059] transition-all duration-200 text-center active:scale-95"
              >
                Send Wholesale Enquiry
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 sm:pt-8 border-t border-[#E5DAC8] max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-[#6B1626]">500+</p>
                <p className="text-[10px] sm:text-xs text-[#55504E] uppercase tracking-wider mt-0.5">Active Catalogues</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-[#6B1626]">100%</p>
                <p className="text-[10px] sm:text-xs text-[#55504E] uppercase tracking-wider mt-0.5">Weaver Quality</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-[#6B1626]">40+</p>
                <p className="text-[10px] sm:text-xs text-[#55504E] uppercase tracking-wider mt-0.5">Countries Exported</p>
              </div>
            </div>
          </div>

          {/* Right Column: Polished Visual Banner Graphic */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-[#E5DAC8] bg-[#6B1626] text-white p-6 sm:p-8 min-h-[360px] sm:min-h-[420px] flex flex-col justify-between">
              
              {/* Decorative Frame Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#4A0E19] rounded-full blur-xl pointer-events-none"></div>

              {/* Graphic Banner Top */}
              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2.5 sm:px-3 py-1 rounded bg-[#C5A059]/20 text-[#E8D39E] text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-[#C5A059]/30">
                  Exclusive Craftsmanship
                </span>
                <span className="text-2xl sm:text-3xl text-[#C5A059]">✦</span>
              </div>

              {/* Center Artwork Illustration */}
              <div className="relative z-10 my-6 sm:my-8 text-center space-y-3 sm:space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E8D39E] p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-[#4A0E19] flex items-center justify-center text-3xl sm:text-4xl">
                    🪔
                  </div>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#E8D39E] tracking-wide">
                  Traditional Royal Weaves
                </h3>
                <p className="text-xs text-[#FAF7F2]/80 max-w-xs mx-auto leading-relaxed">
                  Heavy bridal silks, intricate zari borders &amp; pure handloom creations engineered for high resale margins.
                </p>
              </div>

              {/* Banner Footer */}
              <div className="relative z-10 pt-4 border-t border-[#C5A059]/30 flex items-center justify-between text-[11px] sm:text-xs text-[#E8D39E]">
                <span>Surat &amp; Kanchipuram Hubs</span>
                <span className="font-semibold uppercase tracking-wider">Bulk Sets Only</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
