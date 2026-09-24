import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/common/SEO';
import ErrorState from '../components/common/ErrorState';
import { ALL_SAREES } from '../data/mockData';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const saree = useMemo(() => {
    return ALL_SAREES.find((item) => item.id === id);
  }, [id]);

  const [selectedVariant, setSelectedVariant] = useState(
    saree?.variants ? saree.variants[0] : null
  );

  if (!saree) {
    return (
      <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF7F2]">
        <Navbar />

        <main className="flex-grow py-8 sm:py-12 lg:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <ErrorState
              title="Saree Catalogue Not Found"
              message={`We could not find any saree catalogue matching ID '${id}'. It may have been renamed or archived.`}
            />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const handleEnquireClick = () => {
    navigate(
      `/enquiry?product=${encodeURIComponent(
        saree.name
      )}&sku=${encodeURIComponent(saree.sku)}`
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title={`${saree.name} (${saree.sku})`}
        description={`Wholesale details for ${saree.name}. Fabric: ${saree.fabric}, Category: ${saree.category}, MOQ: ${saree.minOrder}. Direct loom wholesale rate: ${saree.priceTier}.`}
      />

      <Navbar />

      <main className="flex-grow py-4 sm:py-8 lg:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] text-[#55504E] sm:mb-8 sm:gap-2 sm:text-xs"
          >
            <Link
              to="/"
              className="shrink-0 rounded-sm transition-colors hover:text-[#6B1626] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              to="/catalogue"
              className="shrink-0 rounded-sm transition-colors hover:text-[#6B1626] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            >
              Catalogue
            </Link>

            <span>/</span>

            <span className="min-w-0 truncate font-medium text-[#4A0E19]">
              {saree.name}
            </span>
          </nav>

          <div className="grid min-w-0 grid-cols-1 items-start gap-5 rounded-2xl border border-[#E5DAC8] bg-[#F4EFE6] p-3 shadow-sm sm:gap-8 sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-10">
            <div className="min-w-0 space-y-4 sm:space-y-6">
              <div
                className={`relative flex h-64 w-full flex-col justify-between overflow-hidden rounded-xl border border-[#E5DAC8] p-4 shadow-lg sm:h-80 sm:p-6 md:h-96 md:p-8 ${saree.imageBg}`}
                style={{
                  backgroundColor: selectedVariant?.hex
                    ? `${selectedVariant.hex}dd`
                    : undefined
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />

                <div className="relative z-10 flex min-w-0 items-start justify-between gap-2">
                  <span className="min-w-0 max-w-[65%] truncate rounded bg-[#FAF7F2]/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#4A0E19] shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-xs">
                    {saree.category}
                  </span>

                  <span className="max-w-[40%] shrink-0 truncate rounded border border-[#C5A059]/40 bg-[#6B1626] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#E8D39E] shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
                    {saree.badge}
                  </span>
                </div>

                <div className="relative z-10 my-auto min-w-0 text-center">
                  <div className="mb-2 text-4xl drop-shadow-md sm:text-6xl">
                    🥻
                  </div>

                  <p className="truncate px-2 font-mono text-[9px] font-semibold uppercase tracking-widest text-[#E8D39E] sm:text-xs">
                    {saree.sku}
                  </p>

                  {selectedVariant && (
                    <p className="mt-1 break-words px-2 text-[9px] font-medium leading-relaxed text-[#FAF7F2]/90 sm:text-xs">
                      Selected Tone:{' '}
                      <span className="font-bold text-[#E8D39E]">
                        {selectedVariant.name}
                      </span>
                    </p>
                  )}
                </div>

                <div className="relative z-10 flex min-w-0 items-center justify-between gap-3 border-t border-white/10 pt-2 text-[9px] font-medium text-[#FAF7F2] sm:pt-3 sm:text-xs">
                  <span className="min-w-0 truncate">{saree.fabric}</span>
                  <span className="shrink-0 font-bold text-[#E8D39E]">
                    {saree.minOrder}
                  </span>
                </div>
              </div>

              {saree.variants && saree.variants.length > 0 && (
                <div className="space-y-3 rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] p-3 sm:p-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C5A059] sm:text-xs">
                    Available Set Color Shades ({saree.variants.length})
                  </label>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {saree.variants.map((v) => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        aria-pressed={selectedVariant?.name === v.name}
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 sm:gap-2 sm:px-3 sm:text-xs ${
                          selectedVariant?.name === v.name
                            ? 'border-[#6B1626] bg-[#6B1626] text-[#FAF7F2] shadow-sm'
                            : 'border-[#E5DAC8] bg-[#F4EFE6] text-[#1F1C1D] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/50 sm:h-4 sm:w-4"
                          style={{ backgroundColor: v.hex }}
                        />

                        <span className="max-w-[180px] truncate sm:max-w-none">
                          {v.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-5 sm:space-y-6">
              <div className="min-w-0">
                <div className="mb-2 inline-block max-w-full truncate rounded bg-[#6B1626]/10 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-[#6B1626] sm:px-3 sm:text-xs">
                  {saree.sku}
                </div>

                <h1 className="break-words font-serif text-2xl font-bold leading-tight text-[#4A0E19] sm:text-3xl lg:text-4xl">
                  {saree.name}
                </h1>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-[#C5A059]/40 bg-[#FAF7F2] p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <p className="mb-1 text-[9px] uppercase tracking-wider text-[#55504E] sm:text-xs">
                    Wholesale Bulk Rate
                  </p>

                  <p className="break-words font-sans text-lg font-bold text-[#6B1626] sm:text-2xl">
                    {saree.priceTier}
                  </p>
                </div>

                <div className="min-w-0 sm:text-right">
                  <p className="mb-1 text-[9px] uppercase tracking-wider text-[#55504E] sm:text-xs">
                    Minimum Pack
                  </p>

                  <p className="inline-block max-w-full break-words rounded border border-[#C5A059]/30 bg-[#E8D39E]/30 px-3 py-1 text-xs font-bold text-[#4A0E19]">
                    {saree.minOrder}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-base font-bold text-[#4A0E19] sm:text-lg">
                  Description &amp; Weave Details
                </h3>

                <p className="break-words text-xs leading-relaxed text-[#55504E] sm:text-sm">
                  {saree.description}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-[#4A0E19] sm:text-lg">
                  Specifications
                </h3>

                <div className="divide-y divide-[#E5DAC8] overflow-hidden rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] text-[10px] sm:text-xs">
                  <div className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-[#55504E]">Fabric Quality</span>
                    <span className="break-words font-bold text-[#1F1C1D] sm:text-right">
                      {saree.fabric}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-[#55504E]">Primary Shade</span>
                    <span className="break-words font-bold text-[#1F1C1D] sm:text-right">
                      {saree.color}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-[#55504E]">Saree Cut Length</span>
                    <span className="break-words font-bold text-[#1F1C1D] sm:text-right">
                      {saree.sareeLength}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-[#55504E]">Blouse Attachment</span>
                    <span className="break-words font-bold text-[#1F1C1D] sm:text-right">
                      {saree.blouseIncluded}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-[#55504E]">Care Recommendation</span>
                    <span className="break-words font-bold text-[#1F1C1D] sm:text-right">
                      {saree.careInstructions}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-stretch sm:gap-4 sm:pt-4">
                <button
                  type="button"
                  onClick={handleEnquireClick}
                  className="inline-flex min-h-11 w-full flex-1 items-center justify-center rounded-lg border border-[#C5A059]/40 bg-[#6B1626] px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-lg transition-all hover:bg-[#4A0E19] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 sm:px-6 sm:py-4 sm:text-sm"
                >
                  Send Wholesale Enquiry ✉️
                </button>

                <Link
                  to="/catalogue"
                  className="inline-flex min-h-11 w-full flex-1 items-center justify-center rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#4A0E19] transition-colors hover:bg-[#F4EFE6] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 sm:flex-none sm:px-6 sm:py-4 sm:text-sm"
                >
                  Back to Catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}