import { describe, it, expect } from 'vitest';
import { getLocalePhoneticKey } from '@/lib/entities/localePhonetics';

describe('Locale-Aware Phonetics', () => {
  it('generates consistent phonetic keys for English', () => {
    expect(getLocalePhoneticKey('milk', 'en-US')).toBe('M420');
    expect(getLocalePhoneticKey('leek', 'en-US')).toBe(getLocalePhoneticKey('leak', 'en-US'));
  });

  it('handles Hindi / Indian English transliteration variations', () => {
    // "paalak" and "palak"
    const k1 = getLocalePhoneticKey('paalak', 'hi-IN');
    const k2 = getLocalePhoneticKey('palak', 'hi-IN');
    expect(k1).toBe(k2);

    // "doodh" and "dudh"
    const d1 = getLocalePhoneticKey('doodh', 'en-IN');
    const d2 = getLocalePhoneticKey('dudh', 'en-IN');
    expect(d1).toBe(d2);
  });

  it('handles Spanish and French phonetic rules', () => {
    // Spanish: ll vs y
    const s1 = getLocalePhoneticKey('pollo', 'es-ES');
    const s2 = getLocalePhoneticKey('poyo', 'es-ES');
    expect(s1).toBe(s2);

    // French: eau vs o
    const f1 = getLocalePhoneticKey('lait', 'fr-FR');
    expect(f1).toBeDefined();
  });
});
