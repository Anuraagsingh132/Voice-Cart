import { describe, it, expect } from 'vitest';
import { searchProducts } from '@/lib/search';

describe('searchProducts (Catalog Search & Filtering)', () => {
  it('finds products matching simple keywords', () => {
    const { results } = searchProducts('apple');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.name.includes('Apple'))).toBe(true);
  });

  it('filters products under a price ceiling (e.g. under $5)', () => {
    const { results } = searchProducts('toothpaste', { priceMax: 5 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((p) => {
      const price = p.discountedPrice ?? p.price;
      expect(price).toBeLessThanOrEqual(5);
    });
  });

  it('filters products by brand', () => {
    const { results } = searchProducts('', { brand: 'Amul' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((p) => {
      expect(p.brand.toLowerCase()).toContain('amul');
    });
  });

  it('filters by category', () => {
    const { results } = searchProducts('', { category: 'Dairy & Eggs' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((p) => {
      expect(p.category).toBe('Dairy & Eggs');
    });
  });

  it('returns zero results for non-existent products without crashing', () => {
    const { results, totalMatches } = searchProducts('quantum computer');
    expect(results).toEqual([]);
    expect(totalMatches).toBe(0);
  });
});
