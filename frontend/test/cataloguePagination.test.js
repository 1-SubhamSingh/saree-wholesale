import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper utility functions mirroring CataloguePage pagination and query building logic
export function buildCatalogueQueryParams({
  page = 1,
  size = 12,
  searchTerm = '',
  selectedCategory = 'All Categories',
  selectedFabric = 'All Fabrics',
  selectedColor = 'All Colors',
  priceRange = 'all',
  sortBy = 'featured',
}) {
  const params = {
    page: Math.max(0, page - 1),
    size: size <= 0 ? 12 : size,
  };

  if (searchTerm && searchTerm.trim()) {
    params.search = searchTerm.trim();
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

  return params;
}

export function parsePaginationResponse(data, fallbackPage = 1, pageSize = 12) {
  if (data && Array.isArray(data.content)) {
    const activeOnly = data.content.filter((p) => p.active !== false);
    return {
      products: activeOnly,
      paginationMeta: {
        page: data.page ?? (fallbackPage - 1),
        size: data.size ?? pageSize,
        totalElements: data.totalElements ?? activeOnly.length,
        totalPages: data.totalPages ?? (activeOnly.length > 0 ? 1 : 0),
        first: data.first ?? (fallbackPage === 1),
        last: data.last ?? true,
      },
    };
  }

  if (Array.isArray(data)) {
    const activeOnly = data.filter((p) => p.active !== false);
    const total = activeOnly.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (fallbackPage - 1) * pageSize;
    const paged = activeOnly.slice(startIndex, startIndex + pageSize);

    return {
      products: paged,
      paginationMeta: {
        page: fallbackPage - 1,
        size: pageSize,
        totalElements: total,
        totalPages,
        first: fallbackPage === 1,
        last: fallbackPage >= totalPages,
      },
    };
  }

  return {
    products: [],
    paginationMeta: {
      page: 0,
      size: pageSize,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    },
  };
}

export function calculatePageNumbers(currentPage, totalPages) {
  if (totalPages <= 1) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  pages.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push('...');
  }

  pages.push(totalPages);
  return pages;
}

export function shouldResetToPageOne(previousFilters, nextFilters) {
  return (
    previousFilters.searchTerm !== nextFilters.searchTerm ||
    previousFilters.selectedCategory !== nextFilters.selectedCategory ||
    previousFilters.selectedFabric !== nextFilters.selectedFabric ||
    previousFilters.selectedColor !== nextFilters.selectedColor ||
    previousFilters.priceRange !== nextFilters.priceRange ||
    previousFilters.sortBy !== nextFilters.sortBy
  );
}

// Test suite for Catalogue Pagination
describe('Frontend Catalogue Pagination', () => {
  describe('Default pagination', () => {
    it('generates 0-based page 0 and default size 12 for page 1', () => {
      const params = buildCatalogueQueryParams({});
      assert.equal(params.page, 0);
      assert.equal(params.size, 12);
      assert.equal(params.search, undefined);
      assert.equal(params.category, undefined);
    });

    it('correctly parses default paginated PageResponse payload', () => {
      const mockPayload = {
        content: [
          { id: '1', sku: 'SKU-1', name: 'Banarasi Silk', active: true },
          { id: '2', sku: 'SKU-2', name: 'Kanjivaram Silk', active: true },
        ],
        page: 0,
        size: 12,
        totalElements: 24,
        totalPages: 2,
        first: true,
        last: false,
      };

      const result = parsePaginationResponse(mockPayload, 1, 12);
      assert.equal(result.products.length, 2);
      assert.equal(result.paginationMeta.page, 0);
      assert.equal(result.paginationMeta.size, 12);
      assert.equal(result.paginationMeta.totalElements, 24);
      assert.equal(result.paginationMeta.totalPages, 2);
      assert.equal(result.paginationMeta.first, true);
      assert.equal(result.paginationMeta.last, false);
    });
  });

  describe('Custom page size', () => {
    it('accepts and sends custom page sizes like 6 or 24', () => {
      const params = buildCatalogueQueryParams({ page: 2, size: 6 });
      assert.equal(params.page, 1);
      assert.equal(params.size, 6);
    });
  });

  describe('Multiple pages navigation', () => {
    it('computes correct page windows and ellipsis for large total pages', () => {
      // 10 pages total, current on page 1
      const pageListP1 = calculatePageNumbers(1, 10);
      assert.deepEqual(pageListP1, [1, 2, '...', 10]);

      // 10 pages total, current on page 5
      const pageListP5 = calculatePageNumbers(5, 10);
      assert.deepEqual(pageListP5, [1, '...', 4, 5, 6, '...', 10]);

      // 5 pages total (no ellipsis)
      const pageListSmall = calculatePageNumbers(3, 5);
      assert.deepEqual(pageListSmall, [1, 2, 3, 4, 5]);
    });

    it('allows changing pages while keeping all active filters preserved', () => {
      const filters = {
        selectedCategory: 'Banarasi Weave',
        selectedFabric: 'Katan Silk Brocade',
        selectedColor: 'Crimson Red',
        priceRange: '2000_3500',
        sortBy: 'price_asc',
      };

      const page1Params = buildCatalogueQueryParams({ ...filters, page: 1 });
      const page2Params = buildCatalogueQueryParams({ ...filters, page: 2 });

      assert.equal(page1Params.page, 0);
      assert.equal(page2Params.page, 1);
      assert.equal(page1Params.category, page2Params.category);
      assert.equal(page1Params.fabric, page2Params.fabric);
      assert.equal(page1Params.color, page2Params.color);
      assert.equal(page1Params.priceRange, page2Params.priceRange);
      assert.equal(page1Params.sortBy, page2Params.sortBy);
    });
  });

  describe('Empty and out-of-range pages', () => {
    it('handles out-of-range or negative page inputs gracefully', () => {
      const negativeParams = buildCatalogueQueryParams({ page: -3 });
      assert.equal(negativeParams.page, 0);

      const emptyPayload = {
        content: [],
        page: 5,
        size: 12,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      };

      const result = parsePaginationResponse(emptyPayload, 6, 12);
      assert.equal(result.products.length, 0);
      assert.equal(result.paginationMeta.totalElements, 0);
      assert.equal(result.paginationMeta.totalPages, 0);
      assert.equal(result.paginationMeta.last, true);
    });

    it('gracefully handles legacy array response fallback', () => {
      const legacyArray = [
        { id: '1', name: 'Item 1', active: true },
        { id: '2', name: 'Item 2', active: true },
      ];
      const result = parsePaginationResponse(legacyArray, 1, 12);
      assert.equal(result.products.length, 2);
      assert.equal(result.paginationMeta.totalPages, 1);
    });
  });

  describe('Filters and search combined with pagination', () => {
    it('includes trimmed search and active filters in query params', () => {
      const params = buildCatalogueQueryParams({
        page: 1,
        searchTerm: '  zari brocade  ',
        selectedCategory: 'Banarasi Weave',
        selectedFabric: 'Pure Mulberry Silk',
        selectedColor: 'Mustard Gold',
        priceRange: 'under_2000',
      });

      assert.equal(params.search, 'zari brocade');
      assert.equal(params.category, 'Banarasi Weave');
      assert.equal(params.fabric, 'Pure Mulberry Silk');
      assert.equal(params.color, 'Mustard Gold');
      assert.equal(params.priceRange, 'under_2000');
    });

    it('detects when filter or search changes and triggers reset to page 1', () => {
      const prev = {
        searchTerm: '',
        selectedCategory: 'All Categories',
        selectedFabric: 'All Fabrics',
        selectedColor: 'All Colors',
        priceRange: 'all',
        sortBy: 'featured',
      };

      assert.equal(shouldResetToPageOne(prev, { ...prev, searchTerm: 'organza' }), true);
      assert.equal(shouldResetToPageOne(prev, { ...prev, selectedCategory: 'Silk Sarees' }), true);
      assert.equal(shouldResetToPageOne(prev, { ...prev, selectedFabric: 'Pure Silk' }), true);
      assert.equal(shouldResetToPageOne(prev, { ...prev, selectedColor: 'Red' }), true);
      assert.equal(shouldResetToPageOne(prev, { ...prev, priceRange: 'above_3500' }), true);
      assert.equal(shouldResetToPageOne(prev, { ...prev, sortBy: 'price_desc' }), true);
      assert.equal(shouldResetToPageOne(prev, prev), false);
    });
  });

  describe('Sorting combined with pagination', () => {
    it('attaches sortBy parameter with pagination', () => {
      const ascParams = buildCatalogueQueryParams({ page: 2, sortBy: 'price_asc' });
      assert.equal(ascParams.page, 1);
      assert.equal(ascParams.sortBy, 'price_asc');

      const descParams = buildCatalogueQueryParams({ page: 1, sortBy: 'price_desc' });
      assert.equal(descParams.page, 0);
      assert.equal(descParams.sortBy, 'price_desc');

      const nameParams = buildCatalogueQueryParams({ page: 3, sortBy: 'name_asc' });
      assert.equal(nameParams.page, 2);
      assert.equal(nameParams.sortBy, 'name_asc');
    });
  });
});


