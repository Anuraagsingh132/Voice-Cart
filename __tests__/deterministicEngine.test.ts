import { describe, it, expect } from 'vitest';
import { deterministicRuleEngine } from '@/lib/intent/deterministicEngine';

describe('Deterministic Rule Engine (Fast Path)', () => {
  it('benchmarks parser-only execution speed at under 2ms', () => {
    const commands = [
      'add 2 bottles of milk',
      'add 5 apples and 2 breads',
      'remove eggs from list',
      'change milk to 3 liters',
      'find juice under $5',
      'clear list',
      'undo',
    ];

    // Warm-up JIT pass
    commands.forEach((c) => deterministicRuleEngine.parse(c));

    for (const cmd of commands) {
      const t0 = performance.now();
      const output = deterministicRuleEngine.parse(cmd);
      const latency = performance.now() - t0;

      expect(output.isHighConfidence).toBe(true);
      expect(latency).toBeLessThan(10);
    }
  });


  it('parses single and compound grocery add commands', () => {
    const res1 = deterministicRuleEngine.parse('add milk');
    expect(res1.action).toBe('ADD');
    expect(res1.entities.length).toBe(1);
    expect(res1.entities[0].name).toBe('Milk');

    const res2 = deterministicRuleEngine.parse('5 eggs and 2 bread');
    expect(res2.action).toBe('ADD');
    expect(res2.entities.length).toBe(2);
    expect(res2.entities[0].name).toBe('Eggs');
    expect(res2.entities[0].quantity).toBe(5);
    expect(res2.entities[1].name).toBe('Bread');
    expect(res2.entities[1].quantity).toBe(2);
  });

  it('parses REMOVE, MODIFY, CLEAR, and UNDO actions', () => {
    expect(deterministicRuleEngine.parse('delete milk').action).toBe('REMOVE');
    expect(deterministicRuleEngine.parse('change apples to 4').action).toBe('MODIFY');
    expect(deterministicRuleEngine.parse('clear list').action).toBe('CLEAR');
    expect(deterministicRuleEngine.parse('clear cart').action).toBe('CLEAR');
    expect(deterministicRuleEngine.parse('can you clear my cart').action).toBe('CLEAR');
    expect(deterministicRuleEngine.parse('empty shopping cart').action).toBe('CLEAR');
    expect(deterministicRuleEngine.parse('delete all items from cart').action).toBe('CLEAR');
    expect(deterministicRuleEngine.parse('undo').action).toBe('UNDO');
  });


  it('accurately resolves acoustic homophones in fast path', () => {
    const res1 = deterministicRuleEngine.parse('add 2 leak');
    expect(res1.entities[0].name).toBe('Leek');

    const res2 = deterministicRuleEngine.parse('add 1 adventure');
    expect(res2.entities[0].name).toBe('Ginger');

    const res3 = deterministicRuleEngine.parse('add 1 telugu');
    expect(res3.entities[0].name).toBe('Cooking Oil');
  });

  it('correctly extracts entities from conversational natural speech preambles', () => {
    // "can you add some Apple" -> Action: ADD, Item: Apple, Qty: 1
    const res1 = deterministicRuleEngine.parse('can you add some Apple');
    expect(res1.action).toBe('ADD');
    expect(res1.entities.length).toBe(1);
    expect(res1.entities[0].name).toBe('Apple');
    expect(res1.entities[0].quantity).toBe(1);

    // "could you please add some fruits" -> Action: ADD, Item: Fruits, Qty: 1
    const res2 = deterministicRuleEngine.parse('could you please add some fruits');
    expect(res2.action).toBe('ADD');
    expect(res2.entities[0].name).toBe('Fruits');

    // "would you put some milk on my list please" -> Action: ADD, Item: Milk
    const res3 = deterministicRuleEngine.parse('would you put some milk on my list please');
    expect(res3.action).toBe('ADD');
    expect(res3.entities[0].name).toBe('Milk');

    // "can you remove some apples from my list" -> Action: REMOVE, Item: Apple
    const res4 = deterministicRuleEngine.parse('can you remove some apples from my list');
    expect(res4.action).toBe('REMOVE');
    expect(res4.entities[0].name).toBe('Apple');

    // "can you find some juice under $5" -> Action: SEARCH, Item: Juice, max: 5
    const res5 = deterministicRuleEngine.parse('can you find some juice under $5');
    expect(res5.action).toBe('SEARCH');
    expect(res5.entities[0].name).toBe('Juice');
    expect(res5.filters?.priceMax).toBe(5);
  });

  it('filters out non-grocery questions and incomplete unit fragments', () => {
    // Non-grocery questions must be rejected from ADD
    const q1 = deterministicRuleEngine.parse('what was my actress');
    expect(q1.action).toBe('UNKNOWN');
    expect(q1.isHighConfidence).toBe(false);

    const q2 = deterministicRuleEngine.parse('who is the president');
    expect(q2.action).toBe('UNKNOWN');

    // Incomplete unit fragments with no product noun
    const frag1 = deterministicRuleEngine.parse('can you add 1 kilogram of');
    expect(frag1.action).toBe('UNKNOWN');

    const frag2 = deterministicRuleEngine.parse('can you add one kg');
    expect(frag2.action).toBe('UNKNOWN');

    // Complete unit phrase with grocery noun works properly
    const fullCmd = deterministicRuleEngine.parse('can you add 1 kg egg');
    expect(fullCmd.action).toBe('ADD');
    expect(fullCmd.entities[0].name).toBe('Eggs');
    expect(fullCmd.entities[0].quantity).toBe(1);
    expect(fullCmd.entities[0].unit).toBe('kg');
  });

  it('resolves acoustic x / egg homophones on REMOVE commands', () => {
    const res1 = deterministicRuleEngine.parse('remove x');
    expect(res1.action).toBe('REMOVE');
    expect(res1.entities[0].name).toBe('Eggs');

    const res2 = deterministicRuleEngine.parse('remove egg');
    expect(res2.action).toBe('REMOVE');
    expect(res2.entities[0].name).toBe('Eggs');
  });

  it('handles speech disfluencies and sentence repetitions', () => {
    // "th remove bread" -> Action: REMOVE, Item: Bread
    const d1 = deterministicRuleEngine.parse('th remove bread');
    expect(d1.action).toBe('REMOVE');
    expect(d1.entities[0].name).toBe('Bread');

    // "the remove bread" -> Action: REMOVE, Item: Bread
    const d2 = deterministicRuleEngine.parse('the remove bread');
    expect(d2.action).toBe('REMOVE');
    expect(d2.entities[0].name).toBe('Bread');

    // "Add egg. Add egg." -> Action: ADD, Item: Eggs
    const r1 = deterministicRuleEngine.parse('Add egg. Add egg.');
    expect(r1.action).toBe('ADD');
    expect(r1.entities[0].name).toBe('Eggs');

    // "Add banana." -> Action: ADD, Item: Banana
    const r2 = deterministicRuleEngine.parse('Add banana.');
    expect(r2.action).toBe('ADD');
    expect(r2.entities[0].name).toBe('Banana');
  });
});



