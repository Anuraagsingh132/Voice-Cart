import { CanonicalCommand, CommandResult, EventLogEntry } from '@/types/schema';
import { commandValidator } from '@/lib/validation/commandValidator';
import { eventStore } from '@/lib/events/eventStore';
import { projectShoppingList, ShoppingListProjection } from '@/lib/events/projections';
import { idempotencyManager } from '@/lib/resilience/idempotency';
import { findBestMatch } from '@/lib/fuzzyMatch';
import { CompensatingActions } from './compensatingActions';

export class CommandExecutor {
  public execute(command: CanonicalCommand): {
    result: CommandResult;
    projection: ShoppingListProjection;
  } {
    const startTime = performance.now();

    // 1. Idempotency Check
    const cachedResult = idempotencyManager.get(command.command_id);
    if (cachedResult) {
      const currentEvents = eventStore.getEvents(command.aggregate_id);
      const projection = projectShoppingList(currentEvents, command.aggregate_id);
      return { result: cachedResult, projection };
    }

    // 2. 3-Tier Validation
    const validation = commandValidator.validate(command);
    if (!validation.isValid) {
      const currentEvents = eventStore.getEvents(command.aggregate_id);
      const projection = projectShoppingList(currentEvents, command.aggregate_id);
      const failResult: CommandResult = {
        success: false,
        command_id: command.command_id,
        aggregate_version: command.aggregate_version,
        action: command.action,
        message: validation.error || 'Command validation failed',
        route: command.route,
        confidence: command.confidence,
        applied_entities: [],
        event_ids: [],
        request_id: command.request_id,
        trace_id: command.trace_id,
        duration_ms: performance.now() - startTime,
      };
      return { result: failResult, projection };
    }

    // 3. Current Aggregate State & Events
    const existingEvents = eventStore.getEvents(command.aggregate_id);
    const currentProjection = projectShoppingList(existingEvents, command.aggregate_id);
    let nextVersion = currentProjection.version + 1;

    const newEvents: EventLogEntry[] = [];
    let message = '';
    let success = true;

    switch (command.action) {
      case 'ADD': {
        const addedNames: string[] = [];
        for (const entity of command.entities) {
          const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const event: EventLogEntry = {
            event_id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            command_id: command.command_id,
            aggregate_id: command.aggregate_id,
            aggregate_version: nextVersion++,
            type: 'ITEM_ADDED',
            payload: {
              item_id: itemId,
              canonical_id: entity.canonical_id,
              name: entity.name,
              quantity: entity.quantity,
              unit: entity.unit,
              category: entity.category,
              brand: entity.brand,
            },
            timestamp: Date.now(),
            metadata: {
              source: command.source,
              route: command.route,
              locale: command.locale,
              request_id: command.request_id,
              trace_id: command.trace_id,
            },
          };
          newEvents.push(event);
          addedNames.push(`${entity.quantity} ${entity.unit !== 'pieces' ? `${entity.unit} ` : ''}${entity.name}`);
        }
        message = `Added ${addedNames.join(' and ')}`;
        break;
      }

      case 'REMOVE': {
        const targetName = command.target_item || command.entities[0]?.name || command.normalized_text;
        
        // Use fuzzy matching against active list items
        const matchResult = findBestMatch(
          targetName || '',
          currentProjection.items,
          (i) => i.name,
          0.45
        );
        const matchingItem = matchResult?.item;

        if (!matchingItem) {
          success = false;
          message = `"${targetName}" was not found on your shopping list.`;
        } else {
          const event: EventLogEntry = {
            event_id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            command_id: command.command_id,
            aggregate_id: command.aggregate_id,
            aggregate_version: nextVersion++,
            type: 'ITEM_REMOVED',
            payload: {
              item_id: matchingItem.id,
              name: matchingItem.name,
              removed_item: matchingItem,
            },
            timestamp: Date.now(),
            metadata: {
              source: command.source,
              route: command.route,
              locale: command.locale,
              request_id: command.request_id,
              trace_id: command.trace_id,
            },
          };
          newEvents.push(event);
          message = `Removed ${matchingItem.name} from list.`;
        }
        break;
      }

      case 'MODIFY': {
        const targetName = command.target_item || command.entities[0]?.name || command.normalized_text;
        const matchResult = findBestMatch(
          targetName || '',
          currentProjection.items,
          (i) => i.name,
          0.45
        );
        const matchingItem = matchResult?.item;

        if (!matchingItem) {
          success = false;
          message = `"${targetName}" was not found on your shopping list to update.`;
        } else {
          const newQty = command.entities[0]?.quantity || 1;
          const newUnit = command.entities[0]?.unit || matchingItem.unit;

          const event: EventLogEntry = {
            event_id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            command_id: command.command_id,
            aggregate_id: command.aggregate_id,
            aggregate_version: nextVersion++,
            type: 'ITEM_MODIFIED',
            payload: {
              item_id: matchingItem.id,
              name: matchingItem.name,
              previous_quantity: matchingItem.quantity,
              previous_unit: matchingItem.unit,
              quantity: newQty,
              unit: newUnit,
            },
            timestamp: Date.now(),
            metadata: {
              source: command.source,
              route: command.route,
              locale: command.locale,
              request_id: command.request_id,
              trace_id: command.trace_id,
            },
          };
          newEvents.push(event);
          message = `Updated ${matchingItem.name} to ${newQty} ${newUnit}.`;
        }
        break;
      }

      case 'CLEAR': {

        const event: EventLogEntry = {
          event_id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          command_id: command.command_id,
          aggregate_id: command.aggregate_id,
          aggregate_version: nextVersion++,
          type: 'LIST_CLEARED',
          payload: {
            cleared_items: currentProjection.items,
          },
          timestamp: Date.now(),
          metadata: {
            source: command.source,
            route: command.route,
            locale: command.locale,
            request_id: command.request_id,
            trace_id: command.trace_id,
          },
        };
        newEvents.push(event);
        message = 'Cleared all items from shopping list.';
        break;
      }

      case 'UNDO': {
        const lastActionableEvent = [...existingEvents]
          .reverse()
          .find((e) => ['ITEM_ADDED', 'ITEM_REMOVED', 'ITEM_MODIFIED', 'LIST_CLEARED'].includes(e.type));

        if (!lastActionableEvent) {
          success = false;
          message = 'No recent command found to undo.';
        } else {
          const compensation = CompensatingActions.createCompensatingEvent(
            lastActionableEvent,
            nextVersion,
            currentProjection.items
          );

          if (compensation) {
            const event: EventLogEntry = {
              event_id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              command_id: command.command_id,
              aggregate_id: command.aggregate_id,
              aggregate_version: nextVersion++,
              type: compensation.type,
              payload: compensation.payload,
              compensation_event_id: lastActionableEvent.event_id,
              timestamp: Date.now(),
              metadata: {
                source: command.source,
                route: command.route,
                locale: command.locale,
                request_id: command.request_id,
                trace_id: command.trace_id,
              },
            };
            newEvents.push(event);
            message = compensation.payload.explanation || 'Undid previous action.';
          } else {
            success = false;
            message = 'Could not create compensating action for last event.';
          }
        }
        break;
      }

      case 'HELP': {
        message = 'Try saying: "Add 2 bottles of milk", "5 apples and bread", "Change apples to 3", "Find juice under $5", or "Undo"';
        break;
      }

      case 'SEARCH': {
        const queryItem = command.entities[0]?.name || command.normalized_text;
        message = `Searching products for "${queryItem}"...`;
        break;
      }

      default: {
        success = false;
        message = `I didn't quite catch that. Try saying "Add [item]" or "Find [product]".`;
        break;
      }
    }

    // 4. Commit Domain Events
    if (newEvents.length > 0) {
      eventStore.appendEvents(newEvents);
    }

    // 5. Materialize New Read Projection
    const updatedEvents = eventStore.getEvents(command.aggregate_id);
    const updatedProjection = projectShoppingList(updatedEvents, command.aggregate_id);

    const duration = performance.now() - startTime;
    const commandResult: CommandResult = {
      success,
      command_id: command.command_id,
      aggregate_version: updatedProjection.version,
      action: command.action,
      message,
      route: command.route,
      confidence: command.confidence,
      applied_entities: command.entities,
      event_ids: newEvents.map((e) => e.event_id),
      request_id: command.request_id,
      trace_id: command.trace_id,
      duration_ms: duration,
    };

    // 6. Save in Idempotency Manager
    idempotencyManager.set(command.command_id, commandResult);

    return { result: commandResult, projection: updatedProjection };
  }
}

export const commandExecutor = new CommandExecutor();
