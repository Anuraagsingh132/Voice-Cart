import { EventLogEntry, ShoppingListAggregate } from '@/types/schema';
import { ListItem } from '@/types';

export interface ShoppingListProjection {
  aggregate_id: string;
  version: number;
  items: ListItem[];
  total_items: number;
  completed_items: number;
  last_updated_at: number;
}

export interface CategoryTotalsProjection {
  [category: string]: number;
}

/**
 * Deterministically project the current Shopping List read model from an event stream.
 */
export function projectShoppingList(
  events: EventLogEntry[],
  aggregateId = 'list_default'
): ShoppingListProjection {
  const listEvents = events.filter((e) => e.aggregate_id === aggregateId);

  let version = 0;
  let items: ListItem[] = [];
  let lastUpdatedAt = Date.now();

  for (const event of listEvents) {
    version = event.aggregate_version;
    lastUpdatedAt = event.timestamp;

    switch (event.type) {
      case 'ITEM_ADDED': {
        const payload = event.payload;
        const existingIndex = items.findIndex(
          (i) => i.name.toLowerCase() === payload.name.toLowerCase()
        );

        if (existingIndex >= 0) {
          items[existingIndex] = {
            ...items[existingIndex],
            quantity: items[existingIndex].quantity + (payload.quantity || 1),
            checked: false,
          };
        } else {
          items.unshift({
            id: payload.item_id || `item-${event.timestamp}-${Math.random().toString(36).substring(2, 6)}`,
            name: payload.name,
            quantity: payload.quantity || 1,
            unit: payload.unit || 'pieces',
            category: payload.category || 'Pantry & Staples',
            brand: payload.brand,
            checked: false,
            addedAt: event.timestamp,
          });
        }
        break;
      }

      case 'ITEM_REMOVED': {
        const targetName = (event.payload.name || '').toLowerCase();
        items = items.filter((i) => i.name.toLowerCase() !== targetName && i.id !== event.payload.item_id);
        break;
      }

      case 'ITEM_MODIFIED': {
        const targetName = (event.payload.name || '').toLowerCase();
        items = items.map((i) => {
          if (i.name.toLowerCase() === targetName || i.id === event.payload.item_id) {
            return {
              ...i,
              quantity: event.payload.quantity ?? i.quantity,
              unit: event.payload.unit ?? i.unit,
            };
          }
          return i;
        });
        break;
      }

      case 'ITEM_CHECKED': {
        const itemId = event.payload.item_id;
        items = items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i));
        break;
      }

      case 'LIST_CLEARED': {
        items = [];
        break;
      }

      case 'COMMAND_COMPENSATED_UNDO': {
        // Compensating events carry their inverse mutation payload
        if (event.payload.action === 'REVERT_ADD') {
          items = items.filter((i) =>
            event.payload.item_id
              ? i.id !== event.payload.item_id
              : i.name.toLowerCase() !== (event.payload.name || '').toLowerCase()
          );
        } else if (event.payload.action === 'REVERT_REMOVE') {
          if (event.payload.restored_item) {
            items.unshift(event.payload.restored_item);
          }
        } else if (event.payload.action === 'REVERT_MODIFY') {
          items = items.map((i) => {
            const isMatch = event.payload.item_id
              ? i.id === event.payload.item_id
              : i.name.toLowerCase() === (event.payload.name || '').toLowerCase();
            return isMatch
              ? {
                  ...i,
                  quantity: event.payload.previous_quantity ?? i.quantity,
                  unit: event.payload.previous_unit ?? i.unit,
                }
              : i;
          });
        } else if (event.payload.action === 'REVERT_CLEAR') {
          if (Array.isArray(event.payload.previous_items)) {
            items = [...event.payload.previous_items];
          }
        }

        break;
      }
    }
  }

  const completed = items.filter((i) => i.checked).length;

  return {
    aggregate_id: aggregateId,
    version,
    items,
    total_items: items.length,
    completed_items: completed,
    last_updated_at: lastUpdatedAt,
  };
}

/**
 * Project category breakdown counts.
 */
export function projectCategoryTotals(items: ListItem[]): CategoryTotalsProjection {
  const totals: CategoryTotalsProjection = {};
  for (const item of items) {
    totals[item.category] = (totals[item.category] || 0) + item.quantity;
  }
  return totals;
}
