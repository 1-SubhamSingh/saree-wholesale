import { FEATURED_SAREES } from '../data/mockData';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  return (
    <section id="catalogue" className="py-12 sm:py-20 lg:py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#C5A059]">
              Trending Wholesale Designs
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#4A0E19]">
              Featured Saree Catalogues
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A059]"></div>
          </div>
          <div className="pt-2 sm:pt-0">
            <a
              href="#enquiry"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded bg-[#6B1626] hover:bg-[#4A0E19] text-[#FAF7F2] font-semibold text-xs tracking-wider uppercase shadow-md transition-colors"
            >
              Request Full Price List ➔
            </a>
          </div>
        </div>

        {/* 4 Featured Saree Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {FEATURED_SAREES.map((item) => (
            <ProductCard key={item.id} saree={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
