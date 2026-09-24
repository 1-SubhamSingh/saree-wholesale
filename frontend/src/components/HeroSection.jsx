import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-[#E5DAC8] bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] py-8 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#6B1626_1px,transparent_1px)] opacity-[0.03] [background-size:16px_16px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 space-y-4 text-center sm:space-y-6 lg:col-span-7 lg:text-left">
            <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-[#6B1626]/20 bg-[#6B1626]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B1626] sm:px-3.5 sm:text-xs sm:tracking-widest lg:mx-0">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#C5A059] animate-pulse" />
              <span className="truncate">Direct B2B Manufacturer &amp; Exporter</span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-[1.15] text-[#4A0E19] sm:text-4xl md:text-5xl lg:text-6xl">
              Exquisite Indian Sarees for Wholesale{' '}
              <span className="text-[#C5A059] italic font-normal">
                &amp; Bulk Buyers
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#55504E] sm:text-base lg:mx-0 lg:text-lg">
              Supply your boutique, retail store, or export business with
              authentic Kanjivaram, Banarasi, Chanderi &amp; Organza sarees.
              Direct weaver pricing, custom cataloguing, and fast global
              shipping.
            </p>

            <div className="flex w-full flex-col items-stretch justify-center gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4 sm:pt-4 lg:justify-start">
              <a
                href="#collections"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#C5A059]/40 bg-[#6B1626] px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-lg shadow-[#6B1626]/20 transition-all duration-200 hover:bg-[#4A0E19] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
              >
                Explore Collections
              </a>

              <Link
                to="/enquiry"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#C5A059] bg-[#FAF7F2] px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#4A0E19] transition-all duration-200 hover:bg-[#F4EFE6] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
              >
                Send Wholesale Enquiry
              </Link>
            </div>

            <div className="mx-auto grid max-w-lg grid-cols-3 gap-2 border-t border-[#E5DAC8] pt-5 text-center sm:gap-4 sm:pt-8 lg:mx-0 lg:text-left">
              <div className="min-w-0">
                <p className="font-serif text-xl font-bold text-[#6B1626] sm:text-3xl">
                  500+
                </p>
                <p className="mt-0.5 break-words text-[8px] uppercase tracking-wide text-[#55504E] sm:text-xs sm:tracking-wider">
                  Active Catalogues
                </p>
              </div>

              <div className="min-w-0">
                <p className="font-serif text-xl font-bold text-[#6B1626] sm:text-3xl">
                  100%
                </p>
                <p className="mt-0.5 break-words text-[8px] uppercase tracking-wide text-[#55504E] sm:text-xs sm:tracking-wider">
                  Weaver Quality
                </p>
              </div>

              <div className="min-w-0">
                <p className="font-serif text-xl font-bold text-[#6B1626] sm:text-3xl">
                  40+
                </p>
                <p className="mt-0.5 break-words text-[8px] uppercase tracking-wide text-[#55504E] sm:text-xs sm:tracking-wider">
                  Countries Exported
                </p>
              </div>
            </div>
          </div>

          <div className="order-first min-w-0 lg:order-last lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto flex min-h-[260px] w-full max-w-sm flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#E5DAC8] bg-[#6B1626] p-4 text-white shadow-2xl sm:min-h-[380px] sm:max-w-md sm:border-4 sm:p-8 lg:min-h-[420px] lg:max-w-none">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#C5A059]/10 blur-2xl sm:h-40 sm:w-40" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#4A0E19] blur-xl sm:h-40 sm:w-40" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <span className="max-w-[85%] rounded border border-[#C5A059]/30 bg-[#C5A059]/20 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#E8D39E] sm:px-3 sm:text-xs sm:tracking-widest">
                  Exclusive Craftsmanship
                </span>

                <span className="shrink-0 text-2xl text-[#C5A059] sm:text-3xl">
                  ✦
                </span>
              </div>

              <div className="relative z-10 my-4 space-y-3 text-center sm:my-8 sm:space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E8D39E] p-1 shadow-xl sm:h-24 sm:w-24">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#4A0E19] text-3xl sm:text-4xl">
                    🪔
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold leading-tight tracking-wide text-[#E8D39E] sm:text-2xl">
                  Traditional Royal Weaves
                </h3>

                <p className="mx-auto max-w-xs text-xs leading-relaxed text-[#FAF7F2]/80">
                  Heavy bridal silks, intricate zari borders &amp; pure handloom
                  creations engineered for high resale margins.
                </p>
              </div>

              <div className="relative z-10 flex items-start justify-between gap-3 border-t border-[#C5A059]/30 pt-4 text-[9px] text-[#E8D39E] sm:items-center sm:text-xs">
                <span className="min-w-0 break-words">
                  Surat &amp; Kanchipuram Hubs
                </span>

                <span className="shrink-0 text-right font-semibold uppercase tracking-wider">
                  Bulk Sets Only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}