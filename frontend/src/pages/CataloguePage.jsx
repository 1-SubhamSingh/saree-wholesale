import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SEO from '../components/common/SEO';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getProducts, getProductFilters } from '../services/api';

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

const PAGE_SIZE = 12;

function FilterPanelContent({
  categoryOptions,
  selectedCategory,
  onSelectCategory,
  fabricOptions,
  selectedFabric,
  onSelectFabric,
  colorOptions,
  selectedColor,
  onSelectColor,
  priceRange,
  onSelectPriceRange,
  onResetFilters,
}) {
  return (
    <div className="space-y-5 rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 sm:space-y-6 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-[#E5DAC8] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#4A0E19]">
          Filter Catalogues
        </h3>

        <button
          type="button"
          onClick={onResetFilters}
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
          onChange={(e) => onSelectCategory(e.target.value)}
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
          onChange={(e) => onSelectFabric(e.target.value)}
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
          onChange={(e) => onSelectColor(e.target.value)}
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
                onChange={(e) => onSelectPriceRange(e.target.value)}
                className="h-4 w-4 accent-[#6B1626]"
              />

              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to extract and sanitize all catalogue URL query parameters
  const getFiltersFromUrl = useCallback((params) => {
    const category = params.get('category')?.trim() || 'All Categories';
    const fabric = params.get('fabric')?.trim() || 'All Fabrics';
    const color = params.get('color')?.trim() || 'All Colors';
    const priceRange = params.get('priceRange')?.trim() || 'all';
    const sortBy = params.get('sortBy')?.trim() || 'featured';
    const search = params.get('search')?.trim() || '';
    const rawPage = parseInt(params.get('page') || '1', 10);
    const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
    return { category, fabric, color, priceRange, sortBy, search, page };
  }, []);

  const initialFilters = getFiltersFromUrl(searchParams);

  // Pagination state initialized from URL
  const [currentPage, setCurrentPage] = useState(initialFilters.page);
  const [paginationMeta, setPaginationMeta] = useState({
    page: initialFilters.page - 1,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  // Filter & Search states initialized from URL
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [selectedFabric, setSelectedFabric] = useState(initialFilters.fabric);
  const [selectedColor, setSelectedColor] = useState(initialFilters.color);
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORIES);
  const [fabricOptions, setFabricOptions] = useState(DEFAULT_FABRICS);
  const [colorOptions, setColorOptions] = useState(DEFAULT_COLORS);

  const resultsTopRef = useRef(null);
  const requestSeqRef = useRef(0);
  const previousQueryKeyRef = useRef(null);

  // Synchronize state when URL searchParams change (handles back/forward navigation and shared links)
  useEffect(() => {
    const current = getFiltersFromUrl(searchParams);

    setSelectedCategory((prev) => (prev !== current.category ? current.category : prev));
    setSelectedFabric((prev) => (prev !== current.fabric ? current.fabric : prev));
    setSelectedColor((prev) => (prev !== current.color ? current.color : prev));
    setPriceRange((prev) => (prev !== current.priceRange ? current.priceRange : prev));
    setSortBy((prev) => (prev !== current.sortBy ? current.sortBy : prev));
    setSearchTerm((prev) => (prev !== current.search ? current.search : prev));
    setDebouncedSearch((prev) => (prev !== current.search ? current.search : prev));
    setCurrentPage((prev) => (prev !== current.page ? current.page : prev));

    if (current.category && current.category !== 'All Categories') {
      setCategoryOptions((prev) => (prev.includes(current.category) ? prev : [...prev, current.category]));
    }
    if (current.fabric && current.fabric !== 'All Fabrics') {
      setFabricOptions((prev) => (prev.includes(current.fabric) ? prev : [...prev, current.fabric]));
    }
    if (current.color && current.color !== 'All Colors') {
      setColorOptions((prev) => (prev.includes(current.color) ? prev : [...prev, current.color]));
    }
  }, [searchParams, getFiltersFromUrl]);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryKey = JSON.stringify([
    debouncedSearch.trim(),
    selectedCategory,
    selectedFabric,
    selectedColor,
    priceRange,
    sortBy,
  ]);

  const synchronizePageInUrl = useCallback((page) => {
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      if (page <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(page));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const fetchProducts = useCallback(async (pageToFetch = 1) => {
    const requestId = ++requestSeqRef.current;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: Math.max(0, pageToFetch - 1),
        size: PAGE_SIZE,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      if (selectedFabric && selectedFabric !== 'All Fabrics') {
        params.fabric = selectedFabric;
      }
      if (selectedColor && selectedColor !== 'All Colors') {
        params.color = selectedColor;
      }
      if (priceRange && priceRange !== 'all') {
        params.priceRange = priceRange;
      }
      if (sortBy && sortBy !== 'featured') {
        params.sortBy = sortBy;
      }

      const response = await getProducts(params);

      if (requestId !== requestSeqRef.current) {
        return;
      }

      const data = response.data || {};

      if (data && Array.isArray(data.content)) {
        const activeOnly = data.content.filter((p) => p.active !== false);
        setProducts(activeOnly);
        setPaginationMeta({
          page: data.page ?? (pageToFetch - 1),
          size: data.size ?? PAGE_SIZE,
          totalElements: data.totalElements ?? activeOnly.length,
          totalPages: data.totalPages ?? (activeOnly.length > 0 ? 1 : 0),
          first: data.first ?? (pageToFetch === 1),
          last: data.last ?? true,
        });

        if (data.totalPages > 0 && pageToFetch > data.totalPages) {
          setCurrentPage(data.totalPages);
          synchronizePageInUrl(data.totalPages);
        }
      } else if (Array.isArray(data)) {
        const activeOnly = data.filter((p) => p.active !== false);
        const total = activeOnly.length;
        const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
        const startIndex = (pageToFetch - 1) * PAGE_SIZE;
        const paged = activeOnly.slice(startIndex, startIndex + PAGE_SIZE);

        setProducts(paged);
        setPaginationMeta({
          page: pageToFetch - 1,
          size: PAGE_SIZE,
          totalElements: total,
          totalPages,
          first: pageToFetch === 1,
          last: pageToFetch >= totalPages,
        });
        if (pageToFetch > totalPages) {
          setCurrentPage(totalPages);
          synchronizePageInUrl(totalPages);
        }
      } else {
        setProducts([]);
        setPaginationMeta({
          page: 0,
          size: PAGE_SIZE,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        });
      }
    } catch (err) {
      if (requestId !== requestSeqRef.current) {
        return;
      }
      console.error('Failed to load products:', err);
      setError(
        err.response?.data?.message ||
          'Failed to connect to the saree wholesale catalogue. Please make sure the backend is active.'
      );
    } finally {
      if (requestId === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [
    debouncedSearch,
    selectedCategory,
    selectedFabric,
    selectedColor,
    priceRange,
    sortBy,
    synchronizePageInUrl,
  ]);

  useEffect(() => {
    // The first key is already derived from the current URL. Record it without
    // resetting its page so shared links can open directly on later pages.
    if (previousQueryKeyRef.current === null) {
      previousQueryKeyRef.current = queryKey;
      fetchProducts(currentPage);
      return;
    }

    if (previousQueryKeyRef.current !== queryKey) {
      previousQueryKeyRef.current = queryKey;
      requestSeqRef.current += 1;

      // A URL navigation (including browser back/forward) owns both the filters
      // and page. Wait for the URL synchronization effect to apply that page
      // instead of resetting it as though the user changed a local filter.
      const urlFilters = getFiltersFromUrl(searchParams);
      const urlQueryKey = JSON.stringify([
        urlFilters.search.trim(),
        urlFilters.category,
        urlFilters.fabric,
        urlFilters.color,
        urlFilters.priceRange,
        urlFilters.sortBy,
      ]);
      if (urlQueryKey === queryKey && currentPage !== urlFilters.page) {
        return;
      }

      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    fetchProducts(currentPage);
  }, [queryKey, currentPage, fetchProducts, getFiltersFromUrl, searchParams]);

  useEffect(() => {
    getProductFilters()
      .then((response) => {
        const data = response.data || {};
        setCategoryOptions(Array.from(new Set([...DEFAULT_CATEGORIES, ...(data.categories || [])])));
        setFabricOptions(Array.from(new Set([...DEFAULT_FABRICS, ...(data.fabrics || [])])));
        setColorOptions(Array.from(new Set([...DEFAULT_COLORS, ...(data.colors || [])])));
      })
      .catch((err) => {
        console.warn('Could not load product filter options:', err);
      });
  }, []);

  // Keyboard navigation & modal overflow
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



  // Helper to push or replace updated parameters in the URL
  const updateCatalogueUrl = useCallback(
    (updates, replace = false) => {
      setSearchParams((prevParams) => {
        const next = new URLSearchParams(prevParams);

        if ('category' in updates) {
          if (!updates.category || updates.category === 'All Categories') {
            next.delete('category');
          } else {
            next.set('category', updates.category);
          }
        }

        if ('fabric' in updates) {
          if (!updates.fabric || updates.fabric === 'All Fabrics') {
            next.delete('fabric');
          } else {
            next.set('fabric', updates.fabric);
          }
        }

        if ('color' in updates) {
          if (!updates.color || updates.color === 'All Colors') {
            next.delete('color');
          } else {
            next.set('color', updates.color);
          }
        }

        if ('priceRange' in updates) {
          if (!updates.priceRange || updates.priceRange === 'all') {
            next.delete('priceRange');
          } else {
            next.set('priceRange', updates.priceRange);
          }
        }

        if ('sortBy' in updates) {
          if (!updates.sortBy || updates.sortBy === 'featured') {
            next.delete('sortBy');
          } else {
            next.set('sortBy', updates.sortBy);
          }
        }

        if ('search' in updates) {
          const trimmed = (updates.search || '').trim();
          if (!trimmed) {
            next.delete('search');
          } else {
            next.set('search', trimmed);
          }
        }

        if ('page' in updates) {
          const p = updates.page;
          if (!p || p <= 1) {
            next.delete('page');
          } else {
            next.set('page', String(p));
          }
        }

        return next;
      }, { replace });
    },
    [setSearchParams]
  );

  // Sync debounced search to URL (uses replace so typing characters doesn't spam browser history)
  useEffect(() => {
    const urlSearch = searchParams.get('search')?.trim() || '';
    if (debouncedSearch !== urlSearch) {
      updateCatalogueUrl({ search: debouncedSearch, page: 1 }, true);
    }
  }, [debouncedSearch, searchParams, updateCatalogueUrl]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    updateCatalogueUrl({ category: cat, page: 1 });
  };

  const handleSelectFabric = (fab) => {
    setSelectedFabric(fab);
    setCurrentPage(1);
    updateCatalogueUrl({ fabric: fab, page: 1 });
  };

  const handleSelectColor = (col) => {
    setSelectedColor(col);
    setCurrentPage(1);
    updateCatalogueUrl({ color: col, page: 1 });
  };

  const handleSelectPriceRange = (pr) => {
    setPriceRange(pr);
    setCurrentPage(1);
    updateCatalogueUrl({ priceRange: pr, page: 1 });
  };

  const handleSortChange = (sb) => {
    setSortBy(sb);
    setCurrentPage(1);
    updateCatalogueUrl({ sortBy: sb, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('All Categories');
    setSelectedFabric('All Fabrics');
    setSelectedColor('All Colors');
    setPriceRange('all');
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationMeta.totalPages || newPage === currentPage || loading) {
      return;
    }
    setCurrentPage(newPage);
    updateCatalogueUrl({ page: newPage });

    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeFilterCount = [
    selectedCategory !== 'All Categories',
    selectedFabric !== 'All Fabrics',
    selectedColor !== 'All Colors',
    priceRange !== 'all',
  ].filter(Boolean).length;

  // Compute pagination range numbers
  const pageNumbers = useMemo(() => {
    const total = paginationMeta.totalPages;
    if (total <= 1) return [];

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(total - 1, currentPage + 1);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) {
      pages.push('...');
    }

    pages.push(total);
    return pages;
  }, [paginationMeta.totalPages, currentPage]);

  const startIndex = paginationMeta.totalElements === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, paginationMeta.totalElements);

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
                  onChange={(e) => handleSortChange(e.target.value)}
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

          <div
            ref={resultsTopRef}
            className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:gap-8"
          >
            <aside className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block xl:w-72">
              <FilterPanelContent
                categoryOptions={categoryOptions}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                fabricOptions={fabricOptions}
                selectedFabric={selectedFabric}
                onSelectFabric={handleSelectFabric}
                colorOptions={colorOptions}
                selectedColor={selectedColor}
                onSelectColor={handleSelectColor}
                priceRange={priceRange}
                onSelectPriceRange={handleSelectPriceRange}
                onResetFilters={handleResetFilters}
              />
            </aside>

            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#55504E]">
                <span>
                  {paginationMeta.totalElements > 0 ? (
                    <>
                      Showing <strong className="text-[#4A0E19]">{startIndex}–{endIndex}</strong> of{' '}
                      <strong className="text-[#4A0E19]">{paginationMeta.totalElements}</strong> wholesale designs
                      {paginationMeta.totalPages > 1 && (
                        <span className="ml-1 text-[#8B8580]">
                          (Page {currentPage} of {paginationMeta.totalPages})
                        </span>
                      )}
                    </>
                  ) : (
                    'No designs matching your criteria'
                  )}
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
                    onClick={() => fetchProducts(currentPage)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#6B1626] px-4 py-2 text-xs font-semibold text-[#FAF7F2] hover:bg-[#4A0E19]"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : products.length === 0 ? (
                <EmptyState onReset={handleResetFilters} />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                    {products.map((saree) => (
                      <ProductCard key={saree.id} saree={saree} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {paginationMeta.totalPages > 1 && (
                    <nav
                      aria-label="Catalogue pagination"
                      className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 sm:flex-row sm:px-6"
                    >
                      <div className="text-xs text-[#55504E]">
                        Page <strong className="text-[#4A0E19]">{currentPage}</strong> of{' '}
                        <strong className="text-[#4A0E19]">{paginationMeta.totalPages}</strong>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Previous Button */}
                        <button
                          type="button"
                          id="pagination-prev-btn"
                          disabled={paginationMeta.first || currentPage <= 1 || loading}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-3.5 py-2 text-xs font-semibold text-[#4A0E19] transition-all hover:bg-[#E5DAC8] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                          aria-label="Go to previous page"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          <span>Previous</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="hidden items-center gap-1 sm:flex">
                          {pageNumbers.map((p, idx) => {
                            if (p === '...') {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="px-2 text-xs text-[#8B8580]"
                                >
                                  …
                                </span>
                              );
                            }

                            const isActive = p === currentPage;
                            return (
                              <button
                                key={`page-${p}`}
                                type="button"
                                disabled={loading}
                                onClick={() => handlePageChange(p)}
                                aria-label={`Go to page ${p}`}
                                aria-current={isActive ? 'page' : undefined}
                                className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                                  isActive
                                    ? 'bg-[#6B1626] text-[#FAF7F2] shadow-sm'
                                    : 'border border-[#E5DAC8] bg-[#FAF7F2] text-[#4A0E19] hover:bg-[#E5DAC8]'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          type="button"
                          id="pagination-next-btn"
                          disabled={paginationMeta.last || currentPage >= paginationMeta.totalPages || loading}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-3.5 py-2 text-xs font-semibold text-[#4A0E19] transition-all hover:bg-[#E5DAC8] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                          aria-label="Go to next page"
                        >
                          <span>Next</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </nav>
                  )}
                </>
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
              <FilterPanelContent
                categoryOptions={categoryOptions}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                fabricOptions={fabricOptions}
                selectedFabric={selectedFabric}
                onSelectFabric={handleSelectFabric}
                colorOptions={colorOptions}
                selectedColor={selectedColor}
                onSelectColor={handleSelectColor}
                priceRange={priceRange}
                onSelectPriceRange={handleSelectPriceRange}
                onResetFilters={handleResetFilters}
              />
            </div>

            <div className="shrink-0 border-t border-[#E5DAC8] bg-[#FAF7F2] px-4 py-4 sm:px-5">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="min-h-11 w-full rounded-lg bg-[#6B1626] px-5 py-3 text-sm font-semibold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
              >
                View {paginationMeta.totalElements} Results
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
