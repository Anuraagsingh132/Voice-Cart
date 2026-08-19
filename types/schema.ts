/**
 * Canonical Command Schema (v1.0) & Event Sourcing Types
 * Architecture: Resilient, Observable, Deterministic-First Modular Monolith
 */

export type CanonicalAction =
  | 'ADD'
  | 'REMOVE'
  | 'MODIFY'
  | 'SEARCH'
  | 'CLEAR'
  | 'HELP'
  | 'UNDO'
  | 'UNKNOWN';

export type CommandSource =
  | 'voice_whisper'
  | 'voice_webspeech'
  | 'text_manual'
  | 'suggestion_optin'
  | 'system_undo';

export type ProcessingRoute = 'deterministic_fast_path' | 'llm_ambiguity_fallback' | 'offline_fallback';

export interface ConfidenceBreakdown {
  stt?: number;
  entity: number;
  intent: number;
  overall: number;
}

export interface CanonicalEntity {
  canonical_id: string;      // e.g. "grocery.vegetables.leek", "grocery.dairy.milk"
  name: string;              // Standardized display name e.g. "Leek"
  raw_name: string;          // Spoken/typed text before normalization
  quantity: number;
  unit: string;              // e.g. "pieces", "kg", "liters", "packs", "dozen"
  category: string;          // e.g. "Fruits & Vegetables", "Dairy & Eggs"
  brand?: string | null;
  confidence: number;        // Entity-level resolution confidence (0.0 to 1.0)
}

export interface SearchFilterCriteria {
  brand?: string | null;
  priceMax?: number | null;
  priceMin?: number | null;
  size?: string | null;
  category?: string | null;
}

/**
 * The unified immutable contract for all user commands downstream
 */
export interface CanonicalCommand {
  command_id: string;               // UUID v4 for idempotency
  aggregate_id: string;             // Shopping list identifier e.g. "list_default"
  aggregate_version: number;        // Optimistic concurrency control version
  locale: string;                   // BCP-47 locale e.g. "en-US", "en-IN", "hi-IN", "es-ES"
  source: CommandSource;
  action: CanonicalAction;
  entities: CanonicalEntity[];
  target_item?: string | null;      // For MODIFY or replacement
  filters?: SearchFilterCriteria;
  confidence: ConfidenceBreakdown;
  route: ProcessingRoute;
  request_id: string;
  trace_id: string;
  schema_version: '1.0';
  timestamp: number;
  raw_transcript: string;
  normalized_text: string;
}

/**
 * Event Sourcing: Immutable Domain Events
 */
export type EventType =
  | 'ITEM_ADDED'
  | 'ITEM_REMOVED'
  | 'ITEM_MODIFIED'
  | 'ITEM_CHECKED'
  | 'LIST_CLEARED'
  | 'COMMAND_COMPENSATED_UNDO';

export interface EventLogEntry {
  event_id: string;
  command_id: string;
  aggregate_id: string;
  aggregate_version: number;
  type: EventType;
  payload: Record<string, any>;
  compensation_event_id?: string | null;
  timestamp: number;
  metadata: {
    source: CommandSource;
    route: ProcessingRoute;
    locale: string;
    request_id: string;
    trace_id: string;
  };
}

export interface ShoppingListAggregate {
  id: string;
  version: number;
  items: Array<{
    id: string;
    name: string;
    canonical_id: string;
    quantity: number;
    unit: string;
    category: string;
    checked: boolean;
    brand?: string;
    addedAt: number;
    lastModifiedAt: number;
  }>;
  updatedAt: number;
}

export interface CommandResult {
  success: boolean;
  command_id: string;
  aggregate_version: number;
  action: CanonicalAction;
  message: string;
  route: ProcessingRoute;
  confidence: ConfidenceBreakdown;
  applied_entities: CanonicalEntity[];
  event_ids: string[];
  request_id: string;
  trace_id: string;
  duration_ms: number;
  telemetry_summary?: {
    parser_latency_ms: number;
    stt_latency_ms?: number;
    total_latency_ms: number;
  };
}

export interface TelemetryMetrics {
  total_commands: number;
  deterministic_fast_path_count: number;
  llm_fallback_count: number;
  fast_path_ratio: number;
  avg_parser_latency_ms: number;
  avg_e2e_latency_ms: number;
  circuit_breakers: Record<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failure_count: number; total_trips: number }>;
  recent_errors: Array<{ timestamp: number; message: string; trace_id: string }>;
}
