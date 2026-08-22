/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  return dp[m][n];
}

/**
 * Normalize string for comparison (removes punctuation, plurals, lowercase)
 */
export function normalizeText(text: string): string {
  let clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();

  // Strip trailing plural 's' safely
  if (clean.endsWith('s') && !clean.endsWith('ss') && !clean.endsWith('is') && !clean.endsWith('us')) {
    if (clean.endsWith('ies') && clean.length > 4) {
      clean = clean.slice(0, -3) + 'y'; // berries -> berry
    } else if (clean.endsWith('oes') && clean.length > 4) {
      clean = clean.slice(0, -2); // tomatoes -> tomato, potatoes -> potato
    } else if (clean.endsWith('boxes') || clean.endsWith('bunches') || clean.endsWith('dishes') || clean.endsWith('classes') || clean.endsWith('glasses')) {
      clean = clean.slice(0, -2); // boxes -> box, bunches -> bunch
    } else {
      clean = clean.slice(0, -1); // apples -> apple, eggs -> egg, bananas -> banana
    }
  }

  return clean;
}



/**
 * Finds the closest matching item from an array of candidates.
 * Returns the best match and its score (0 to 1, where 1 is exact match).
 */
export function findBestMatch<T>(
  query: string,
  candidates: T[],
  getItemName: (item: T) => string,
  threshold: number = 0.55
): { item: T; score: number } | null {
  if (!query || candidates.length === 0) return null;

  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  let bestMatch: { item: T; score: number } | null = null;

  for (const candidate of candidates) {
    const candidateName = getItemName(candidate);
    const normalizedCandidate = normalizeText(candidateName);

    // Exact match
    if (normalizedQuery === normalizedCandidate) {
      return { item: candidate, score: 1.0 };
    }

    // Substring containment match
    if (normalizedCandidate.includes(normalizedQuery) || normalizedQuery.includes(normalizedCandidate)) {
      const lengthRatio = Math.min(normalizedQuery.length, normalizedCandidate.length) / Math.max(normalizedQuery.length, normalizedCandidate.length);
      const score = 0.85 * lengthRatio;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { item: candidate, score };
      }
      continue;
    }

    // Levenshtein similarity score
    const maxLen = Math.max(normalizedQuery.length, normalizedCandidate.length);
    if (maxLen === 0) continue;
    const distance = levenshteinDistance(normalizedQuery, normalizedCandidate);
    const score = 1 - distance / maxLen;

    if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { item: candidate, score };
    }
  }

  return bestMatch;
}
