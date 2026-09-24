import { COLLECTIONS } from '../data/mockData';
import CollectionCard from './CollectionCard';

export default function FeaturedCollections() {
  return (
    <section id="collections" className="py-16 sm:py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C5A059]">
            Curated Wholesale Categories
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A0E19]">
            Featured Wholesale Collections
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto"></div>
          <p className="text-base text-[#55504E]">
            Explore our handcrafted saree lines tailored for high retail turnover, boutique fashion, and wedding wardrobes.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {COLLECTIONS.map((item) => (
            <CollectionCard key={item.id} collection={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
