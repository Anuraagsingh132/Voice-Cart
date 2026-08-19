import { describe, it, expect } from 'vitest';
import { resolveGroceryItem, correctTranscriptPhonetics, soundex } from '@/lib/phoneticMatcher';

describe('Phonetic Matcher & Homophone Resolver', () => {
  it('correctly calculates Soundex phonetic representations', () => {
    expect(soundex('milk')).toBe('M420');
    expect(soundex('leek')).toBe('L200');
    expect(soundex('leak')).toBe('L200'); // Homophone identical soundex!
    expect(soundex('ginger')).toBe('G526');
  });

  it('resolves common acoustic speech misrecognitions to canonical grocery items', () => {
    // "leak" -> "Leek"
    const leakMatch = resolveGroceryItem('leak');
    expect(leakMatch.matched).toBe(true);
    expect(leakMatch.resolvedName).toBe('Leek');

    // "adventure" -> "Ginger"
    const gingerMatch = resolveGroceryItem('adventure');
    expect(gingerMatch.matched).toBe(true);
    expect(gingerMatch.resolvedName).toBe('Ginger');

    // "telugu" -> "Cooking Oil"
    const oilMatch = resolveGroceryItem('telugu');
    expect(oilMatch.matched).toBe(true);
    expect(oilMatch.resolvedName).toBe('Cooking Oil');

    // "serial" -> "Oats / Cereal"
    const cerealMatch = resolveGroceryItem('serial');
    expect(cerealMatch.matched).toBe(true);
    expect(cerealMatch.resolvedName).toBe('Oats / Cereal');

    // "flower" -> "Wheat Flour (Atta)"
    const flourMatch = resolveGroceryItem('flower');
    expect(flourMatch.matched).toBe(true);
    expect(flourMatch.resolvedName).toBe('Wheat Flour (Atta)');
  });

  it('resolves multilingual grocery terms (Hindi, Spanish, French, German)', () => {
    expect(resolveGroceryItem('adrak').resolvedName).toBe('Ginger');
    expect(resolveGroceryItem('doodh').resolvedName).toBe('Milk');
    expect(resolveGroceryItem('aalu').resolvedName).toBe('Potato');
    expect(resolveGroceryItem('pyaz').resolvedName).toBe('Onion');
    expect(resolveGroceryItem('paneer').resolvedName).toBe('Paneer (Cottage Cheese)');
    expect(resolveGroceryItem('dahi').resolvedName).toBe('Curd / Yogurt');
    expect(resolveGroceryItem('manzana').resolvedName).toBe('Apple');
    expect(resolveGroceryItem('leche').resolvedName).toBe('Milk');
    expect(resolveGroceryItem('lait').resolvedName).toBe('Milk');
  });

  it('corrects phonetic mistakes inside full transcripts', () => {
    expect(correctTranscriptPhonetics('add 2 leak and milk')).toContain('Leek');
    expect(correctTranscriptPhonetics('buy tooth paste and soap')).toContain('toothpaste');
    expect(correctTranscriptPhonetics('get dish wash and bread')).toContain('dish soap');
  });
});
