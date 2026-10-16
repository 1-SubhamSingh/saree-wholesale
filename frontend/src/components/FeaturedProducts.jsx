import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import LoadingSpinner from './common/LoadingSpinner';
import { getFeaturedProducts } from '../services/api';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getFeaturedProducts()
      .then((res) => {
        if (isMounted) {
          const list = Array.isArray(res.data) ? res.data : [];
          setFeaturedProducts(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load featured products:', err);
          setError('Failed to load featured sarees.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              to="/catalogue"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-[#6B1626] bg-transparent px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[#6B1626] transition-colors hover:bg-[#6B1626] hover:text-[#FAF7F2]"
            >
              Browse Full Catalogue ➔
            </Link>
            <a
              href="#enquiry"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#6B1626] px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-md transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2]"
            >
              Request Price List
            </a>
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Loading trending wholesale catalogues..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-xs font-semibold text-red-700">
            {error}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5DAC8] p-12 text-center">
            <p className="font-serif text-lg font-bold text-[#4A0E19]">
              Featured Collections Arriving Shortly
            </p>
            <p className="mt-1 text-xs text-[#55504E]">
              Our wholesale artisans are preparing exclusive bridal and festive weaves.
            </p>
            <Link
              to="/catalogue"
              className="mt-4 inline-block rounded bg-[#6B1626] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
            >
              Explore Full Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {featuredProducts.map((item) => (
              <ProductCard key={item.id} saree={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}