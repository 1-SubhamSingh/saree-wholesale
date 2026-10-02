import { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SEO from '../components/common/SEO';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { getProducts } from '../services/api';

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Silk Sarees',
  'Banarasi Weave',
  'Designer Collection',
  'Festive & Party',
  'Cotton Handloom',
  'Georgette & Chiffon',
];

const DEFAULT_FABRICS = [
  'All Fabrics',
  'Pure Mulberry Silk',
  'Katan Silk Brocade',
  'Viscose Organza',
  'Chanderi Silk Cotton',
  'Tussar Silk',
  'Pure Georgette',
  'Pure Silk',
  'Organza',
  'Silk',
];

const DEFAULT_COLORS = [
  'All Colors',
  'Crimson Red',
  'Mustard Gold',
  'Pastel Pink',
  'Peacock Blue',
  'Deep Wine',
  'Royal Navy',
  'Maroon',
  'Red',
  'Pink',
];

const SORT_OPTIONS = [
  { label: 'Featured First', value: 'featured' },
  { label: 'Wholesale Price: Low to High', value: 'price_asc' },
  { label: 'Wholesale Price: High to Low', value: 'price_desc' },
  { label: 'Catalogue Name (A-Z)', value: 'name_asc' },
];

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFabric, setSelectedFabric] = useState('All Fabrics');
  const [selectedColor, setSelectedColor] = useState('All Colors');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts();
      // Only show active products on public catalogue
      const data = Array.isArray(response.data) ? response.data : [];
      const activeProducts = data.filter((p) => p.active !== false);
      setProducts(activeProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(
        err.response?.data?.message ||
          'Failed to connect to the saree wholesale catalogue. Please make sure the backend is active.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileFilterOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  // Dynamically compute available filter options from current backend products
  const categoryOptions = useMemo(() => {
    const fromData = products.map((p) => p.category).filter(Boolean);
    const combined = Array.from(new Set(['All Categories', ...DEFAULT_CATEGORIES, ...fromData]));
    return combined;
  }, [products]);

  const fabricOptions = useMemo(() => {
    const fromData = products.map((p) => p.fabric).filter(Boolean);
    const combined = Array.from(new Set(['All Fabrics', ...DEFAULT_FABRICS, ...fromData]));
    return combined;
  }, [products]);

  const colorOptions = useMemo(() => {
    const fromData = products.map((p) => p.color).filter(Boolean);
    const combined = Array.from(new Set(['All Colors', ...DEFAULT_COLORS, ...fromData]));
    return combined;
  }, [products]);

  const filteredSarees = useMemo(() => {
    let result = [...products];

    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();

      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.sku && s.sku.toLowerCase().includes(query)) ||
          (s.category && s.category.toLowerCase().includes(query)) ||
          (s.fabric && s.fabric.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'All Categories') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (selectedFabric !== 'All Fabrics') {
      result = result.filter((s) => s.fabric === selectedFabric);
    }

    if (selectedColor !== 'All Colors') {
      result = result.filter((s) => s.color === selectedColor);
    }

    if (priceRange === 'under_2000') {
      result = result.filter((s) => Number(s.price) < 2000);
    } else if (priceRange === '2000_3500') {
      result = result.filter((s) => Number(s.price) >= 2000 && Number(s.price) <= 3500);
    } else if (priceRange === 'above_3500') {
      result = result.filter((s) => Number(s.price) > 3500);
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedFabric,
    selectedColor,
    priceRange,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedFabric('All Fabrics');
    setSelectedColor('All Colors');
    setPriceRange('all');
    setSortBy('featured');
  };

  const activeFilterCount = [
    selectedCategory !== 'All Categories',
    selectedFabric !== 'All Fabrics',
    selectedColor !== 'All Colors',
    priceRange !== 'all',
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-5 rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 sm:space-y-6 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-[#E5DAC8] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#4A0E19]">
          Filter Catalogues
        </h3>

        <button
          type="button"
          onClick={handleResetFilters}
          className="shrink-0 text-xs font-semibold text-[#6B1626] transition-colors hover:text-[#4A0E19] hover:underline focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category-filter"
          className="block text-xs font-bold uppercase tracking-wider text-[#C5A059]"
        >
          Category
        </label>

        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="min-h-11 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1F1C1D] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="fabric-filter"
          className="block text-xs font-bold uppercase tracking-wider text-[#C5A059]"
        >
          Fabric Type
        </label>

        <select
          id="fabric-filter"
          value={selectedFabric}
          onChange={(e) => setSelectedFabric(e.target.value)}
          className="min-h-11 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1F1C1D] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
        >
          {fabricOptions.map((fab) => (
            <option key={fab} value={fab}>
              {fab}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="color-filter"
          className="block text-xs font-bold uppercase tracking-wider text-[#C5A059]"
        >
          Primary Shade
        </label>

        <select
          id="color-filter"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="min-h-11 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1F1C1D] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
        >
          {colorOptions.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059]">
          Wholesale Price Range
        </label>

        <div className="space-y-2 text-sm text-[#1F1C1D]">
          {[
            { label: 'All Rates', value: 'all' },
            { label: 'Under ₹2,000 / pc', value: 'under_2000' },
            { label: '₹2,000 – ₹3,500 / pc', value: '2000_3500' },
            { label: 'Above ₹3,500 / pc', value: 'above_3500' },
          ].map((range) => (
            <label
              key={range.value}
              className="flex min-h-9 cursor-pointer items-center gap-2.5"
            >
              <input
                type="radio"
                name="priceRange"
                value={range.value}
                checked={priceRange === range.value}
                onChange={(e) => setPriceRange(e.target.value)}
                className="h-4 w-4 accent-[#6B1626]"
              />

              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title="Wholesale Saree Catalogue"
        description="Browse our complete catalogue of wholesale Kanjivaram silk, Banarasi brocades, Chanderi cotton, and designer organza sarees directly from loom to boutique."
      />

      <Navbar />

      <main className="flex-grow py-6 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 space-y-2 sm:mb-8">
            <h1 className="font-serif text-3xl font-bold leading-tight text-[#4A0E19] sm:text-5xl">
              Wholesale Saree Catalogue
            </h1>

            <p className="text-sm leading-relaxed text-[#55504E] sm:text-base">
              Explore authentic wholesale weaves direct from looms for boutique owners, resellers, and retail chains.
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-3 sm:mb-8 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <input
                type="text"
                id="catalogue-search"
                placeholder="Search by saree name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] py-2.5 pl-10 pr-4 text-sm text-[#1F1C1D] placeholder-[#55504E]/70 transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />

              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C5A059]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex w-full items-center gap-2 sm:gap-3 lg:w-auto">
              <button
                type="button"
                id="catalogue-filter-btn"
                onClick={() => setMobileFilterOpen(true)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#6B1626] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] lg:hidden sm:flex-none"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>

                <span>
                  Filters
                  {activeFilterCount > 0 && ` (${activeFilterCount})`}
                </span>
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
                <span className="hidden whitespace-nowrap text-xs font-medium text-[#55504E] sm:inline">
                  Sort:
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="min-h-11 w-full min-w-0 rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2.5 text-xs font-semibold text-[#4A0E19] focus:outline-none focus:ring-1 focus:ring-[#C5A059] sm:w-auto"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:gap-8">
            <aside className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block xl:w-72">
              <FilterPanel />
            </aside>

            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#55504E]">
                <span>
                  Showing{' '}
                  <strong className="text-[#4A0E19]">
                    {filteredSarees.length}
                  </strong>{' '}
                  wholesale designs
                </span>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="shrink-0 font-medium text-[#6B1626] hover:underline focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {loading ? (
                <LoadingSpinner message="Loading authentic wholesale catalogues from loom repository..." />
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={fetchProducts}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#6B1626] px-4 py-2 text-xs font-semibold text-[#FAF7F2] hover:bg-[#4A0E19]"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredSarees.length === 0 ? (
                <EmptyState onReset={handleResetFilters} />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                  {filteredSarees.map((saree) => (
                    <ProductCard key={saree.id} saree={saree} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />

          <div
            className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,360px)] flex-col bg-[#FAF7F2] shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5DAC8] px-4 py-4 sm:px-5">
              <h2
                id="mobile-filter-title"
                className="font-serif text-xl font-bold text-[#4A0E19]"
              >
                Filters
              </h2>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md text-[#4A0E19] transition-colors hover:bg-[#F4EFE6] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                aria-label="Close filters"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <FilterPanel />
            </div>

            <div className="shrink-0 border-t border-[#E5DAC8] bg-[#FAF7F2] px-4 py-4 sm:px-5">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="min-h-11 w-full rounded-lg bg-[#6B1626] px-5 py-3 text-sm font-semibold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
              >
                View {filteredSarees.length} Results
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}