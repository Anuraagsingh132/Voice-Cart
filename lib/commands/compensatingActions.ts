import { EventLogEntry, EventType } from '@/types/schema';
import { ListItem } from '@/types';

/**
 * Generates compensating event payloads to undo previous user commands.
 */
export class CompensatingActions {
  public static createCompensatingEvent(
    targetEvent: EventLogEntry,
    currentVersion: number,
    currentItems: ListItem[]
  ): { type: EventType; payload: Record<string, any> } | null {
    switch (targetEvent.type) {
      case 'ITEM_ADDED': {
        return {
          type: 'COMMAND_COMPENSATED_UNDO',
          payload: {
            action: 'REVERT_ADD',
            name: targetEvent.payload.name,
            item_id: targetEvent.payload.item_id,
            target_event_id: targetEvent.event_id,
            explanation: `Undid addition of ${targetEvent.payload.name}`,
          },
        };
      }

      case 'ITEM_REMOVED': {
        return {
          type: 'COMMAND_COMPENSATED_UNDO',
          payload: {
            action: 'REVERT_REMOVE',
            restored_item: targetEvent.payload.removed_item,
            name: targetEvent.payload.name,
            target_event_id: targetEvent.event_id,
            explanation: `Restored removed item ${targetEvent.payload.name}`,
          },
        };
      }

      case 'ITEM_MODIFIED': {
        return {
          type: 'COMMAND_COMPENSATED_UNDO',
          payload: {
            action: 'REVERT_MODIFY',
            name: targetEvent.payload.name,
            previous_quantity: targetEvent.payload.previous_quantity,
            target_event_id: targetEvent.event_id,
            explanation: `Reverted quantity of ${targetEvent.payload.name} to ${targetEvent.payload.previous_quantity}`,
          },
        };
      }

      case 'LIST_CLEARED': {
        return {
          type: 'COMMAND_COMPENSATED_UNDO',
          payload: {
            action: 'REVERT_CLEAR',
            previous_items: targetEvent.payload.cleared_items,
            target_event_id: targetEvent.event_id,
            explanation: `Restored entire cleared list (${targetEvent.payload.cleared_items?.length || 0} items)`,
          },
        };
      }

      default:
        return null;
    }
  }
}
