import { FEATURED_SAREES } from '../data/mockData';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  return (
    <section
      id="catalogue"
      className="bg-[#FAF7F2] py-12 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2 sm:space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C5A059] sm:text-xs sm:tracking-widest">
              Trending Wholesale Designs
            </p>

            <h2 className="font-serif text-2xl font-bold leading-tight text-[#4A0E19] sm:text-4xl">
              Featured Saree Catalogues
            </h2>

            <div className="h-0.5 w-12 bg-[#C5A059] sm:w-16" />
          </div>

          <div className="w-full sm:w-auto">
            <a
              href="#enquiry"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-[#6B1626] px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-md transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] sm:w-auto sm:px-6 sm:py-3"
            >
              Request Full Price List ➔
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {FEATURED_SAREES.map((item) => (
            <ProductCard key={item.id} saree={item} />
          ))}
        </div>
      </div>
    </section>
  );
}