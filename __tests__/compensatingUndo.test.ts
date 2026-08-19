import { describe, it, expect, beforeEach } from 'vitest';
import { commandExecutor } from '@/lib/commands/commandExecutor';
import { eventStore } from '@/lib/events/eventStore';
import { intentInterpreter } from '@/lib/intent/intentInterpreter';

describe('Compensating Undo Operations', () => {
  beforeEach(() => {
    eventStore.clear();
  });

  it('successfully undoes an item addition using a compensating event', async () => {
    // 1. Add Milk
    const { command: addCmd } = await intentInterpreter.interpret({
      transcript: 'add 2 milk',
      request_id: 'r1',
      trace_id: 't1',
    });
    const { projection: p1 } = commandExecutor.execute(addCmd);
    expect(p1.items.length).toBe(1);
    expect(p1.items[0].name).toBe('Milk');

    // 2. Trigger Undo
    const { command: undoCmd } = await intentInterpreter.interpret({
      transcript: 'undo',
      request_id: 'r2',
      trace_id: 't2',
    });
    const { result, projection: p2 } = commandExecutor.execute(undoCmd);
    expect(result.success).toBe(true);
    expect(p2.items.length).toBe(0); // Milk compensated and removed!
  });

  it('successfully undoes list clear using a compensating event', async () => {
    // 1. Add items
    const { command: addCmd1 } = await intentInterpreter.interpret({ transcript: 'add milk', request_id: 'r1', trace_id: 't1' });
    commandExecutor.execute(addCmd1);

    const { command: addCmd2 } = await intentInterpreter.interpret({ transcript: 'add bread', request_id: 'r2', trace_id: 't2' });
    commandExecutor.execute(addCmd2);

    // 2. Clear List
    const { command: clearCmd } = await intentInterpreter.interpret({ transcript: 'clear list', request_id: 'r3', trace_id: 't3' });
    const { projection: pCleared } = commandExecutor.execute(clearCmd);
    expect(pCleared.items.length).toBe(0);

    // 3. Undo Clear
    const { command: undoCmd } = await intentInterpreter.interpret({ transcript: 'undo', request_id: 'r4', trace_id: 't4' });
    const { projection: pRestored } = commandExecutor.execute(undoCmd);
    expect(pRestored.items.length).toBe(2);
  });
});
