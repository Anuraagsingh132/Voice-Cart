import { describe, it, expect } from 'vitest';
import { parseIntentClientFallback } from '@/lib/intentParser';

describe('parseIntentClientFallback (NLP Fallback Parser)', () => {
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
    const res1 = parseIntentClientFallback('Find toothpaste under $5');
    expect(res1.intent).toBe('SEARCH');
    expect(res1.item).toBe('Toothpaste');
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
});
