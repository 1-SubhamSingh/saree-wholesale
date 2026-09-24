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
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <Navbar />
        <main className="flex-grow py-16">
          <ErrorState
            title="Saree Catalogue Not Found"
            message={`We could not find any saree catalogue matching ID '${id}'. It may have been renamed or archived.`}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const handleEnquireClick = () => {
    navigate(`/enquiry?product=${encodeURIComponent(saree.name)}&sku=${encodeURIComponent(saree.sku)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title={`${saree.name} (${saree.sku})`}
        description={`Wholesale details for ${saree.name}. Fabric: ${saree.fabric}, Category: ${saree.category}, MOQ: ${saree.minOrder}. Direct loom wholesale rate: ${saree.priceTier}.`}
      />
      <Navbar />

      <main className="flex-grow py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#55504E] mb-8">
            <Link to="/" className="hover:text-[#6B1626]">Home</Link>
            <span>/</span>
            <Link to="/catalogue" className="hover:text-[#6B1626]">Catalogue</Link>
            <span>/</span>
            <span className="text-[#4A0E19] font-medium truncate max-w-xs">{saree.name}</span>
          </nav>

          {/* Main Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-[#F4EFE6] border border-[#E5DAC8] rounded-2xl p-6 sm:p-10 shadow-sm">
            
            {/* Left Column: Visual Product Box & Variant Thumbnails */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Main Image Box */}
              <div
                className={`relative w-full h-80 sm:h-96 ${saree.imageBg} rounded-xl p-8 flex flex-col justify-between overflow-hidden shadow-lg border border-[#E5DAC8]`}
                style={{
                  backgroundColor: selectedVariant?.hex ? `${selectedVariant.hex}dd` : undefined,
                }}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Badges */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-3 py-1 rounded bg-[#FAF7F2]/90 backdrop-blur-sm text-[#4A0E19] text-xs font-bold uppercase tracking-wider shadow-sm">
                    {saree.category}
                  </span>
                  <span className="px-3 py-1 rounded bg-[#6B1626] text-[#E8D39E] text-xs font-bold uppercase tracking-wider shadow-sm border border-[#C5A059]/40">
                    {saree.badge}
                  </span>
                </div>

                {/* Center Artwork */}
                <div className="relative z-10 text-center my-auto">
                  <div className="text-6xl mb-2 drop-shadow-md">🥻</div>
                  <p className="font-mono text-xs text-[#E8D39E] tracking-widest uppercase font-semibold">
                    {saree.sku}
                  </p>
                  {selectedVariant && (
                    <p className="text-xs text-[#FAF7F2]/90 mt-1 font-medium">
                      Selected Tone: <span className="text-[#E8D39E] font-bold">{selectedVariant.name}</span>
                    </p>
                  )}
                </div>

                {/* Footer Info */}
                <div className="relative z-10 flex justify-between items-center text-xs text-[#FAF7F2] font-medium border-t border-white/10 pt-3">
                  <span>{saree.fabric}</span>
                  <span className="text-[#E8D39E] font-bold">{saree.minOrder}</span>
                </div>
              </div>

              {/* Color/Shade Variant Selector */}
              {saree.variants && saree.variants.length > 0 && (
                <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DAC8]">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block">
                    Available Set Color Shades ({saree.variants.length})
                  </label>
                  <div className="flex items-center gap-3">
                    {saree.variants.map((v) => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          selectedVariant?.name === v.name
                            ? 'border-[#6B1626] bg-[#6B1626] text-[#FAF7F2] shadow-sm'
                            : 'border-[#E5DAC8] bg-[#F4EFE6] text-[#1F1C1D] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/50"
                          style={{ backgroundColor: v.hex }}
                        ></span>
                        <span>{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Product Specifications & Enquiry Actions */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="inline-block px-3 py-1 rounded bg-[#6B1626]/10 text-[#6B1626] text-xs font-mono font-bold tracking-wider mb-2">
                  {saree.sku}
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#4A0E19] leading-tight">
                  {saree.name}
                </h1>
              </div>

              {/* Pricing & MOQ Highlight Box */}
              <div className="bg-[#FAF7F2] border border-[#C5A059]/40 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs text-[#55504E] uppercase tracking-wider">Wholesale Bulk Rate</p>
                  <p className="font-sans text-2xl font-bold text-[#6B1626]">{saree.priceTier}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#55504E] uppercase tracking-wider">Minimum Pack</p>
                  <p className="text-xs font-bold text-[#4A0E19] bg-[#E8D39E]/30 px-3 py-1 rounded border border-[#C5A059]/30 mt-1">
                    {saree.minOrder}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-[#4A0E19]">Description &amp; Weave Details</h3>
                <p className="text-sm text-[#55504E] leading-relaxed">
                  {saree.description}
                </p>
              </div>

              {/* Product Specifications Table */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#4A0E19]">Specifications</h3>
                <div className="bg-[#FAF7F2] rounded-xl border border-[#E5DAC8] divide-y divide-[#E5DAC8] text-xs">
                  <div className="p-3 flex justify-between">
                    <span className="text-[#55504E] font-medium">Fabric Quality</span>
                    <span className="font-bold text-[#1F1C1D]">{saree.fabric}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-[#55504E] font-medium">Primary Shade</span>
                    <span className="font-bold text-[#1F1C1D]">{saree.color}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-[#55504E] font-medium">Saree Cut Length</span>
                    <span className="font-bold text-[#1F1C1D]">{saree.sareeLength}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-[#55504E] font-medium">Blouse Attachment</span>
                    <span className="font-bold text-[#1F1C1D]">{saree.blouseIncluded}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-[#55504E] font-medium">Care Recommendation</span>
                    <span className="font-bold text-[#1F1C1D]">{saree.careInstructions}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={handleEnquireClick}
                  className="w-full sm:w-auto flex-1 px-8 py-4 rounded-lg bg-[#6B1626] hover:bg-[#4A0E19] text-[#FAF7F2] font-semibold text-sm tracking-wider uppercase border border-[#C5A059]/40 shadow-lg transition-all text-center"
                >
                  Send Wholesale Enquiry ✉️
                </button>
                <Link
                  to="/catalogue"
                  className="w-full sm:w-auto px-6 py-4 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#4A0E19] font-semibold text-sm tracking-wider uppercase border border-[#E5DAC8] text-center transition-colors"
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
