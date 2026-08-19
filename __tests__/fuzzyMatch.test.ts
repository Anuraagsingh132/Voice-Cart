import { describe, it, expect } from 'vitest';
import { levenshteinDistance, normalizeText, findBestMatch } from '@/lib/fuzzyMatch';

describe('fuzzyMatch utilities', () => {
  it('calculates correct Levenshtein distance', () => {
    expect(levenshteinDistance('milk', 'milk')).toBe(0);
    expect(levenshteinDistance('milk', 'malk')).toBe(1);
    expect(levenshteinDistance('apples', 'apple')).toBe(1);
  });

  it('normalizes strings by stripping plurals and punctuation', () => {
    expect(normalizeText('Apples!')).toBe('apple');
    expect(normalizeText('Eggs')).toBe('egg');
    expect(normalizeText('Bottles of Water')).toBe('bottles of water');
  });

  it('finds exact matching items from a list', () => {
    const list = [
      { id: '1', name: 'Farm Fresh Whole Milk' },
      { id: '2', name: 'Organic Fuji Apples' },
      { id: '3', name: 'Whole Wheat Sourdough Bread' },
    ];

    const match = findBestMatch('Farm Fresh Whole Milk', list, (i) => i.name);
    expect(match).not.toBeNull();
    expect(match?.item.id).toBe('1');
    expect(match?.score).toBe(1.0);
  });

  it('finds partial/substring matching items', () => {
    const list = [
      { id: '1', name: 'Farm Fresh Whole Milk' },
      { id: '2', name: 'Organic Fuji Apples' },
      { id: '3', name: 'Whole Wheat Sourdough Bread' },
    ];

    const match = findBestMatch('apple', list, (i) => i.name);
    expect(match).not.toBeNull();
    expect(match?.item.name).toBe('Organic Fuji Apples');
  });

  it('finds items with slight spelling mistakes via Levenshtein', () => {
    const list = [
      { id: '1', name: 'Toothpaste' },
      { id: '2', name: 'Bananas' },
    ];

    const match = findBestMatch('banans', list, (i) => i.name, 0.6);
    expect(match).not.toBeNull();
    expect(match?.item.name).toBe('Bananas');
  });

  it('returns null when query has no reasonable match', () => {
    const list = [{ id: '1', name: 'Milk' }, { id: '2', name: 'Bread' }];
    const match = findBestMatch('computer monitor', list, (i) => i.name, 0.7);
    expect(match).toBeNull();
  });
});
