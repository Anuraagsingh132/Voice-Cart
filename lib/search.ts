import { Product, SearchFilters } from '@/types';
import productsData from '@/data/products.json';

const products: Product[] = productsData as Product[];

/**
 * Searches the catalog based on a text query, brand, category, price range, and size.
 */
export function searchProducts(
  query: string,
  filters: SearchFilters = {},
  limit = 100
): { results: Product[]; totalMatches: number } {
  const cleanQuery = (query || '').toLowerCase().trim();
  const brandFilter = filters.brand?.toLowerCase().trim();
  const categoryFilter = filters.category?.toLowerCase().trim();
  const priceMax = filters.priceMax !== null && filters.priceMax !== undefined ? Number(filters.priceMax) : null;
  const priceMin = filters.priceMin !== null && filters.priceMin !== undefined ? Number(filters.priceMin) : null;

  const matched = products.filter((p) => {
    // 1. Text Query Matching (searches name, brand, category, tags)
    let matchesQuery = true;
    if (cleanQuery) {
      const pName = p.name.toLowerCase();
      const pBrand = p.brand.toLowerCase();
      const pCategory = p.category.toLowerCase();
      const pTags = (p.tags || []).join(' ').toLowerCase();

      // Split query into tokens to support multi-word queries like "organic apple"
      const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
      matchesQuery = queryTokens.every(
        (token) =>
          pName.includes(token) ||
          pBrand.includes(token) ||
          pCategory.includes(token) ||
          pTags.includes(token)
      );
    }

    if (!matchesQuery) return false;

    // 2. Brand Filter
    if (brandFilter) {
      if (!p.brand.toLowerCase().includes(brandFilter)) {
        return false;
      }
    }

    // 3. Category Filter
    if (categoryFilter) {
      if (!p.category.toLowerCase().includes(categoryFilter)) {
        return false;
      }
    }

    // 4. Package-size filter (e.g., "1L milk" or "500g bread")
    if (filters.size) {
      const sizeFilter = filters.size.toLowerCase().replace(/\s+/g, '');
      const productSize = (p.unit || '').toLowerCase().replace(/\s+/g, '');
      if (!productSize.includes(sizeFilter)) return false;
    }

    // 5. Price Max Filter (e.g., "under $5")
    const actualPrice = p.discountedPrice ?? p.price;
    if (priceMax !== null && !isNaN(priceMax)) {
      if (actualPrice > priceMax) {
        return false;
      }
    }

    // 6. Price Min Filter
    if (priceMin !== null && !isNaN(priceMin)) {
      if (actualPrice < priceMin) {
        return false;
      }
    }

    return true;
  });

  // Sort matched products: cheaper first or highest rating
  matched.sort((a, b) => {
    const priceA = a.discountedPrice ?? a.price;
    const priceB = b.discountedPrice ?? b.price;
    return priceA - priceB;
  });

  return {
    results: limit > 0 ? matched.slice(0, limit) : matched,
    totalMatches: matched.length,
  };
}


/**
 * Get all available categories from catalog
 */
export function getCatalogCategories(): string[] {
  const categories = new Set<string>();
  products.forEach((p) => categories.add(p.category));
  return Array.from(categories);
}
