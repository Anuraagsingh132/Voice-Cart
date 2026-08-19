import { soundex } from '@/lib/phoneticMatcher';

/**
 * Locale-Aware Phonetic Matching Engine
 * Handles acoustic transliterations and pronunciation variations per locale.
 */

export function getLocalePhoneticKey(text: string, locale = 'en-US'): string {
  if (!text) return '';
  const clean = text.toLowerCase().trim();

  if (locale.startsWith('hi') || locale === 'en-IN') {
    return hindiPhoneticKey(clean);
  }

  if (locale.startsWith('es')) {
    return spanishPhoneticKey(clean);
  }

  if (locale.startsWith('fr')) {
    return frenchPhoneticKey(clean);
  }

  if (locale.startsWith('de')) {
    return germanPhoneticKey(clean);
  }

  return soundex(clean);
}

/**
 * Hindi / Indian English Transliteration Phonetic Key
 */
function hindiPhoneticKey(str: string): string {
  let s = str
    .replace(/aa|ah/g, 'a')
    .replace(/ee|ea/g, 'i')
    .replace(/oo|ou/g, 'u')
    .replace(/dh|dd/g, 'd')
    .replace(/th|tt/g, 't')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/bh/g, 'b')
    .replace(/ph/g, 'f')
    .replace(/sh|sch/g, 's')
    .replace(/z|jh/g, 'j')
    .replace(/v/g, 'w');

  return soundex(s);
}

/**
 * Spanish Phonetic Key
 */
function spanishPhoneticKey(str: string): string {
  let s = str
    .replace(/^h/, '')
    .replace(/ll|y/g, 'y')
    .replace(/v/g, 'b')
    .replace(/ce|ci|z/g, 's')
    .replace(/ge|gi|j/g, 'x')
    .replace(/que|qui/g, 'k');

  return soundex(s);
}

/**
 * French Phonetic Key
 */
function frenchPhoneticKey(str: string): string {
  let s = str
    .replace(/eau|au/g, 'o')
    .replace(/ou/g, 'u')
    .replace(/ph/g, 'f')
    .replace(/ch/g, 'sh')
    .replace(/[sdtxgz]$/, ''); // silent trailing consonant

  return soundex(s);
}

/**
 * German Phonetic Key
 */
function germanPhoneticKey(str: string): string {
  let s = str
    .replace(/ä|ae/g, 'e')
    .replace(/ö|oe/g, 'o')
    .replace(/ü|ue/g, 'u')
    .replace(/ß|ss/g, 's')
    .replace(/v/g, 'f')
    .replace(/w/g, 'v')
    .replace(/sch/g, 'sh');

  return soundex(s);
}
