import { describe, it, expect } from 'vitest';
import { categorizeItem } from '@/lib/categorize';

describe('categorizeItem', () => {
  it('correctly categorizes fresh fruits and vegetables', () => {
    expect(categorizeItem('Organic Fuji Apples')).toBe('Fruits & Vegetables');
    expect(categorizeItem('bananas')).toBe('Fruits & Vegetables');
    expect(categorizeItem('Fresh Baby Spinach')).toBe('Fruits & Vegetables');
    expect(categorizeItem('tomatoes')).toBe('Fruits & Vegetables');
  });

  it('correctly categorizes dairy and eggs', () => {
    expect(categorizeItem('Whole Milk')).toBe('Dairy & Eggs');
    expect(categorizeItem('Amul Butter')).toBe('Dairy & Eggs');
    expect(categorizeItem('Brown Eggs')).toBe('Dairy & Eggs');
    expect(categorizeItem('Greek Yogurt')).toBe('Dairy & Eggs');
    expect(categorizeItem('Almond Milk')).toBe('Dairy & Eggs');
  });

  it('correctly categorizes bakery and snacks', () => {
    expect(categorizeItem('Whole Wheat Sourdough Bread')).toBe('Bakery & Snacks');
    expect(categorizeItem('Lays Potato Chips')).toBe('Bakery & Snacks');
    expect(categorizeItem('Rolled Oats')).toBe('Bakery & Snacks');
    expect(categorizeItem('Dark Chocolate')).toBe('Bakery & Snacks');
  });

  it('correctly categorizes beverages', () => {
    expect(categorizeItem('Spring Water')).toBe('Beverages');
    expect(categorizeItem('Orange Juice')).toBe('Beverages');
    expect(categorizeItem('Espresso Coffee Beans')).toBe('Beverages');
    expect(categorizeItem('Green Tea')).toBe('Beverages');
  });

  it('correctly categorizes personal care products', () => {
    expect(categorizeItem('Colgate Total Toothpaste')).toBe('Personal Care');
    expect(categorizeItem('Dettol Hand Wash')).toBe('Personal Care');
    expect(categorizeItem('Dove Body Wash')).toBe('Personal Care');
    expect(categorizeItem('Sunscreen SPF 50')).toBe('Personal Care');
  });

  it('correctly handles multilingual terms (e.g. Hindi)', () => {
    expect(categorizeItem('doodh')).toBe('Dairy & Eggs');
    expect(categorizeItem('palak')).toBe('Fruits & Vegetables');
    expect(categorizeItem('chawal')).toBe('Pantry & Staples');
  });

  it('defaults gracefully for unknown items', () => {
    expect(categorizeItem('xyz mysterious item')).toBe('Pantry & Staples');
    expect(categorizeItem('')).toBe('Pantry & Staples');
  });
});
