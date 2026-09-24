import { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SEO from '../components/common/SEO';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ALL_SAREES, FILTER_OPTIONS } from '../data/mockData';

export default function CataloguePage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFabric, setSelectedFabric] = useState('All Fabrics');
  const [selectedColor, setSelectedColor] = useState('All Colors');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Simulate fast mock loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Filter and Sort Logic
  const filteredSarees = useMemo(() => {
    let result = [...ALL_SAREES];

    // Search filter
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.sku.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.fabric.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // Fabric filter
    if (selectedFabric !== 'All Fabrics') {
      result = result.filter((s) => s.fabric === selectedFabric);
    }

    // Color filter
    if (selectedColor !== 'All Colors') {
      result = result.filter((s) => s.color === selectedColor);
    }

    // Price range filter
    if (priceRange === 'under_2000') {
      result = result.filter((s) => s.price < 2000);
    } else if (priceRange === '2000_3500') {
      result = result.filter((s) => s.price >= 2000 && s.price <= 3500);
    } else if (priceRange === 'above_3500') {
      result = result.filter((s) => s.price > 3500);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchTerm, selectedCategory, selectedFabric, selectedColor, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedFabric('All Fabrics');
    setSelectedColor('All Colors');
    setPriceRange('all');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title="Wholesale Saree Catalogue"
        description="Browse our complete catalogue of wholesale Kanjivaram silk, Banarasi brocades, Chanderi cotton, and designer organza sarees."
      />
      <Navbar />

      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="mb-8 space-y-3">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#4A0E19]">
              Wholesale Saree Catalogue
            </h1>
            <p className="text-sm sm:text-base text-[#55504E]">
              Explore 500+ premium weaves for boutique owners, resellers, and retail chains.
            </p>
          </div>

          {/* Search & Mobile Filter Toggle Bar */}
          <div className="bg-[#F4EFE6] border border-[#E5DAC8] rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search by saree name or SKU (e.g. SKU-KJN)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5DAC8] text-sm text-[#1F1C1D] placeholder-[#55504E]/70 focus:outline-none focus:ring-2 focus:ring-[#C5A059] transition-all"
              />
              <svg
                className="w-5 h-5 text-[#C5A059] absolute left-3 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Mobile Filter Button & Sort Dropdown */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden px-4 py-2.5 rounded-lg bg-[#6B1626] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#55504E] font-medium hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E5DAC8] text-xs font-semibold text-[#4A0E19] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                >
                  {FILTER_OPTIONS.sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Layout: Sidebar Filters + Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Filters (Desktop & Mobile Drawer) */}
            <aside
              className={`lg:col-span-3 bg-[#F4EFE6] border border-[#E5DAC8] rounded-xl p-6 space-y-6 ${
                mobileFilterOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DAC8]">
                <h3 className="font-serif text-lg font-bold text-[#4A0E19]">
                  Filter Catalogues
                </h3>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#6B1626] hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#E5DAC8] text-xs text-[#1F1C1D]"
                >
                  {FILTER_OPTIONS.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabric Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block">
                  Fabric Type
                </label>
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#E5DAC8] text-xs text-[#1F1C1D]"
                >
                  {FILTER_OPTIONS.fabrics.map((fab) => (
                    <option key={fab} value={fab}>
                      {fab}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block">
                  Primary Shade
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#E5DAC8] text-xs text-[#1F1C1D]"
                >
                  {FILTER_OPTIONS.colors.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Tier Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block">
                  Wholesale Price Range
                </label>
                <div className="space-y-1.5 text-xs text-[#1F1C1D]">
                  {[
                    { label: 'All Rates', value: 'all' },
                    { label: 'Under ₹2,000 / pc', value: 'under_2000' },
                    { label: '₹2,000 – ₹3,500 / pc', value: '2000_3500' },
                    { label: 'Above ₹3,500 / pc', value: 'above_3500' },
                  ].map((range) => (
                    <label key={range.value} className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range.value}
                        checked={priceRange === range.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="accent-[#6B1626]"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid Content */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Results count bar */}
              <div className="flex items-center justify-between text-xs text-[#55504E]">
                <span>
                  Showing <strong className="text-[#4A0E19]">{filteredSarees.length}</strong> wholesale designs
                </span>
                {(searchTerm || selectedCategory !== 'All Categories' || selectedFabric !== 'All Fabrics' || selectedColor !== 'All Colors' || priceRange !== 'all') && (
                  <span className="text-[#6B1626] font-medium">Filtered Results</span>
                )}
              </div>

              {/* Grid or States */}
              {loading ? (
                <LoadingSpinner message="Filtering wholesale catalogues..." />
              ) : filteredSarees.length === 0 ? (
                <EmptyState onReset={handleResetFilters} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSarees.map((saree) => (
                    <ProductCard key={saree.id} saree={saree} />
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
