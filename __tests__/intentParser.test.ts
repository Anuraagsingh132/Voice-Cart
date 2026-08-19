import { describe, it, expect } from 'vitest';
import { parseIntentClientFallback, isShoppingRelated, normalizeItemName } from '@/lib/intentParser';

describe('parseIntentClientFallback & Residual Speech Filter', () => {
  it('normalizes item names and strips stray unit words or transliteration fragments', () => {
    expect(normalizeItemName('kilo ab ginger')).toBe('Ginger');
    expect(normalizeItemName('kg bread')).toBe('Bread');
    expect(normalizeItemName('ek aalu')).toBe('Aalu');
    expect(normalizeItemName('some apples')).toBe('Apples');

    const res = parseIntentClientFallback('Add kilo ab ginger');
    expect(res.intent).toBe('ADD');
    expect(res.item).toBe('Ginger');
  });

  it('identifies shopping-related queries and filters casual background chatter', () => {
    expect(isShoppingRelated('Add milk')).toBe(true);
    expect(isShoppingRelated('5 eggs and two breads')).toBe(true);
    expect(isShoppingRelated('Find juice under $5')).toBe(true);
    expect(isShoppingRelated('Delete apples')).toBe(true);

    // Non-shopping residual talk
    expect(isShoppingRelated('what time is it')).toBe(false);
    expect(isShoppingRelated('yeah I was talking to John yesterday')).toBe(false);
    expect(isShoppingRelated('turn on the television')).toBe(false);
    expect(isShoppingRelated('thank you so much')).toBe(false);
    expect(isShoppingRelated('hello how are you')).toBe(false);
  });

  it('silently filters residual talk to UNKNOWN intent', () => {
    const res1 = parseIntentClientFallback('what time is it');
    expect(res1.intent).toBe('UNKNOWN');
    expect(res1.confidence).toBe(0);

    const res2 = parseIntentClientFallback('yeah sure okay');
    expect(res2.intent).toBe('UNKNOWN');
    expect(res2.confidence).toBe(0);
  });

  it('parses basic ADD intent with default quantity', () => {
    const res = parseIntentClientFallback('Add milk');
    expect(res.intent).toBe('ADD');
    expect(res.item).toBe('Milk');
    expect(res.quantity).toBe(1);
    expect(res.unit).toBe('pieces');
  });

  it('parses compound multi-item commands (e.g. 5 eggs and two breads)', () => {
    const res = parseIntentClientFallback('5 eggs and two breads');
    expect(res.intent).toBe('ADD');
    expect(res.items).toBeDefined();
    expect(res.items?.length).toBe(2);

    expect(res.items?.[0].item).toBe('Eggs');
    expect(res.items?.[0].quantity).toBe(5);

    expect(res.items?.[1].item).toBe('Bread');
    expect(res.items?.[1].quantity).toBe(2);
  });

  it('parses compound commands with phonetic misspellings (e.g. breadth)', () => {
    const res = parseIntentClientFallback('Add 5 eggs and two breadth');
    expect(res.intent).toBe('ADD');
    expect(res.items).toBeDefined();
    expect(res.items?.length).toBe(2);
    expect(res.items?.[0].item).toBe('Eggs');
    expect(res.items?.[0].quantity).toBe(5);
    expect(res.items?.[1].item).toBe('Bread');
    expect(res.items?.[1].quantity).toBe(2);
  });

  it('parses varied phrasing for ADD intent', () => {
    const res1 = parseIntentClientFallback('I want to buy bananas');
    expect(res1.intent).toBe('ADD');
    expect(res1.item).toBe('Bananas');

    const res2 = parseIntentClientFallback('I need apples');
    expect(res2.intent).toBe('ADD');
    expect(res2.item).toBe('Apples');

    const res3 = parseIntentClientFallback('Put brown eggs on my shopping list');
    expect(res3.intent).toBe('ADD');
    expect(res3.item).toBe('Brown Eggs');
  });

  it('parses quantity and units accurately in ADD commands', () => {
    const res = parseIntentClientFallback('Add 2 bottles of water');
    expect(res.intent).toBe('ADD');
    expect(res.item).toBe('Water');
    expect(res.quantity).toBe(2);
    expect(res.unit).toBe('bottles');

    const res2 = parseIntentClientFallback('Buy 5 oranges');
    expect(res2.intent).toBe('ADD');
    expect(res2.item).toBe('Oranges');
    expect(res2.quantity).toBe(5);

    const res3 = parseIntentClientFallback('Add two packs of chips');
    expect(res3.intent).toBe('ADD');
    expect(res3.item).toBe('Chips');
    expect(res3.quantity).toBe(2);
    expect(res3.unit).toBe('packs');
  });

  it('parses REMOVE intent', () => {
    const res1 = parseIntentClientFallback('Remove milk from my list');
    expect(res1.intent).toBe('REMOVE');
    expect(res1.item).toBe('Milk');

    const res2 = parseIntentClientFallback('delete apples');
    expect(res2.intent).toBe('REMOVE');
    expect(res2.item).toBe('Apples');
  });

  it('parses MODIFY intent', () => {
    const res = parseIntentClientFallback('Change apples to 3');
    expect(res.intent).toBe('MODIFY');
    expect(res.item).toBe('Apples');
    expect(res.quantity).toBe(3);

    const res2 = parseIntentClientFallback('Make bananas 5');
    expect(res2.intent).toBe('MODIFY');
    expect(res2.item).toBe('Bananas');
    expect(res2.quantity).toBe(5);
  });

  it('parses SEARCH intent with price range constraints', () => {
    const res1 = parseIntentClientFallback('Find juice under $5');
    expect(res1.intent).toBe('SEARCH');
    expect(res1.item).toBe('Juice');
    expect(res1.filters?.priceMax).toBe(5);

    const res2 = parseIntentClientFallback('Find me organic apples');
    expect(res2.intent).toBe('SEARCH');
    expect(res2.item).toContain('Apples');
  });

  it('parses CLEAR and HELP intents', () => {
    const resClear = parseIntentClientFallback('Clear my list');
    expect(resClear.intent).toBe('CLEAR');

    const resHelp = parseIntentClientFallback('Help me');
    expect(resHelp.intent).toBe('HELP');
  });

  it('parses documented multilingual commands in the offline fallback', () => {
    expect(parseIntentClientFallback('doodh jod do')).toMatchObject({ intent: 'ADD', item: 'Milk' });
    expect(parseIntentClientFallback('agrega leche')).toMatchObject({ intent: 'ADD', item: 'Milk' });
    expect(parseIntentClientFallback('chercher des pommes')).toMatchObject({ intent: 'SEARCH', item: 'Apples' });
    expect(parseIntentClientFallback('milch hinzufügen')).toMatchObject({ intent: 'ADD', item: 'Milk' });
  });

  it('parses bounded price ranges and package sizes', () => {
    const result = parseIntentClientFallback('Find milk between $2 and $4 1L');
    expect(result).toMatchObject({ intent: 'SEARCH', item: 'Milk', filters: { priceMin: 2, priceMax: 4, size: '1l' } });
  });

  it('corrects homophone misrecognitions like leak, adventure, and telugu in ADD commands', () => {
    const res1 = parseIntentClientFallback('Add 2 leak');
    expect(res1.intent).toBe('ADD');
    expect(res1.item).toBe('Leek');
    expect(res1.quantity).toBe(2);

    const res2 = parseIntentClientFallback('Add 2 adventure');
    expect(res2.intent).toBe('ADD');
    expect(res2.item).toBe('Ginger');
    expect(res2.quantity).toBe(2);

    const res3 = parseIntentClientFallback('Add 1 telugu');
    expect(res3.intent).toBe('ADD');
    expect(res3.item).toBe('Cooking Oil');
  });
});

