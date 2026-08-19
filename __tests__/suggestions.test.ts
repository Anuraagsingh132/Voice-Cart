import { describe, it, expect } from 'vitest';
import { generateSmartSuggestions, getCurrentSeason } from '@/lib/suggestions';
import { ListItem } from '@/types';

describe('generateSmartSuggestions (GroceryStoreDataset)', () => {
  it('returns valid season string', () => {
    const season = getCurrentSeason();
    expect(['spring', 'summer', 'monsoon', 'winter', 'fall']).toContain(season);
  });

  it('generates substitute recommendations when matching items are on list', () => {
    const items: ListItem[] = [
      {
        id: '1',
        name: 'Arla Standard Milk',
        quantity: 1,
        unit: 'carton (1L)',
        category: 'Dairy & Eggs',
        checked: false,
        addedAt: Date.now(),
      },
    ];

    const suggestions = generateSmartSuggestions(items);
    const hasSubstitute = suggestions.some((s) => s.type === 'substitute');
    expect(hasSubstitute).toBe(true);

    const plantBased = suggestions.find(
      (s) => s.item.toLowerCase().includes('oat') || s.item.toLowerCase().includes('soy') || s.item.toLowerCase().includes('lactose')
    );
    expect(plantBased).toBeDefined();
  });

  it('generates seasonal suggestions for the current season', () => {
    const suggestions = generateSmartSuggestions([]);
    const seasonal = suggestions.filter((s) => s.type === 'seasonal');
    expect(seasonal.length).toBeGreaterThan(0);
  });

  it('does not suggest items already present on the list', () => {
    const items: ListItem[] = [
      {
        id: '1',
        name: 'Watermelon',
        quantity: 1,
        unit: 'pieces',
        category: 'Fruits & Vegetables',
        checked: false,
        addedAt: Date.now(),
      },
    ];

    const suggestions = generateSmartSuggestions(items);
    const suggestedNames = suggestions.map((s) => s.item.toLowerCase());
    expect(suggestedNames).not.toContain('watermelon');
  });
});
