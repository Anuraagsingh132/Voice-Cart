import { describe, it, expect } from 'vitest';
import { searchProducts } from '@/lib/search';

describe('searchProducts (Catalog Search & Filtering - GroceryStoreDataset)', () => {
  it('finds products matching simple keywords', () => {
    const { results } = searchProducts('apple');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.name.toLowerCase().includes('apple'))).toBe(true);
  });

  it('filters products under a price ceiling (e.g. under $5)', () => {
    const { results } = searchProducts('juice', { priceMax: 5 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((p) => {
      const price = p.discountedPrice ?? p.price;
      expect(price).toBeLessThanOrEqual(5);
    });
  });

  it('filters products by brand in GroceryStoreDataset', () => {
    const { results } = searchProducts('', { brand: 'Arla' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((p) => {
      expect(p.brand.toLowerCase()).toContain('arla');
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

  it('supports the documented organic, toothpaste, brand, and size queries', () => {
    const organic = searchProducts('organic apples');
    expect(organic.results.map((product) => product.name)).toContain('Organic Fuji Apples');

    const toothpaste = searchProducts('toothpaste', { priceMax: 5 });
    expect(toothpaste.results.some((product) => product.brand === 'Colgate')).toBe(true);

    const milk = searchProducts('milk', { brand: 'Amul', size: '1L' });
    expect(milk.results.map((product) => product.name)).toContain('Amul Taaza Milk');
  });
});
