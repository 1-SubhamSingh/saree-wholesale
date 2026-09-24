import { COLLECTIONS } from '../data/mockData';
import CollectionCard from './CollectionCard';

export default function FeaturedCollections() {
  return (
    <section
      id="collections"
      className="bg-[#FAF7F2] py-12 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center sm:mb-16 sm:space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C5A059] sm:text-xs sm:tracking-widest">
            Curated Wholesale Categories
          </p>

          <h2 className="font-serif text-2xl font-bold leading-tight text-[#4A0E19] sm:text-4xl">
            Featured Wholesale Collections
          </h2>

          <div className="mx-auto h-0.5 w-12 bg-[#C5A059] sm:w-16" />

          <p className="px-1 text-sm leading-relaxed text-[#55504E] sm:px-0 sm:text-base">
            Explore our handcrafted saree lines tailored for high retail
            turnover, boutique fashion, and wedding wardrobes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {COLLECTIONS.map((item) => (
            <CollectionCard key={item.id} collection={item} />
          ))}
        </div>
      </div>
    </section>
  );
}