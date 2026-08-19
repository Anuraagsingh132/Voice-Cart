import { describe, it, expect } from 'vitest';
import { entityResolver } from '@/lib/entities/entityResolver';

describe('Entity Resolution Pipeline', () => {
  it('resolves canonical entities with correct category and default units', () => {
    const res = entityResolver.resolve('milk', 'en-US', 2);
    expect(res.name).toBe('Milk');
    expect(res.canonical_id).toBe('grocery.dairy.milk');
    expect(res.category).toBe('Dairy & Eggs');
    expect(res.unit).toBe('liters');
    expect(res.quantity).toBe(2);
    expect(res.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('resolves homophones to proper grocery canonical items', () => {
    expect(entityResolver.resolve('leak').name).toBe('Leek');
    expect(entityResolver.resolve('adventure').name).toBe('Ginger');
    expect(entityResolver.resolve('telugu').name).toBe('Cooking Oil');
    expect(entityResolver.resolve('flower').name).toBe('Wheat Flour (Atta)');
  });

  it('uses native locale match first, and translation as fallback only', () => {
    const hindiRes = entityResolver.resolve('adrak', 'hi-IN');
    expect(hindiRes.name).toBe('Ginger');
    expect(hindiRes.canonical_id).toBe('grocery.vegetables.ginger');

    const spanishRes = entityResolver.resolve('manzana', 'es-ES');
    expect(spanishRes.name).toBe('Apple');
  });
});
