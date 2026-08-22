import { CanonicalCommand } from '@/types/schema';

export interface ValidationResult {
  isValid: boolean;
  tier: 1 | 2 | 3;
  error?: string;
}

const VALID_ACTIONS = new Set(['ADD', 'REMOVE', 'MODIFY', 'SEARCH', 'CLEAR', 'HELP', 'UNDO', 'UNKNOWN']);
const VALID_UNITS = new Set(['pieces', 'bottles', 'packs', 'cartons', 'cans', 'boxes', 'bunches', 'bags', 'kg', 'grams', 'liters', 'dozen']);
const INVALID_UNIT_NAMES = new Set([
  'kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms',
  'gram', 'grams', 'g',
  'liter', 'liters', 'litre', 'litres', 'l',
  'bottle', 'bottles', 'pack', 'packs', 'packet', 'packets',
  'box', 'boxes', 'can', 'cans', 'bag', 'bags', 'bunch', 'bunches',
  'dozen', 'piece', 'pieces', 'pcs',
  'of', 'for', 'to', 'from', 'the', 'a', 'an', 'some', 'any', 'item', 'unknown item'
]);

const NON_GROCERY_QUESTION_PATTERNS = [
  /^(?:what|who|where|when|why|how)\s+(?:is|are|was|were|did|do|does|can|could|will|would)/i,
  /^(?:tell\s+me|show\s+me\s+how|explain|sing|play)\b/i,
];

export class CommandValidator {
  public validate(command: CanonicalCommand): ValidationResult {
    // Tier 1: JSON Schema Validation
    const tier1 = this.validateSchema(command);
    if (!tier1.isValid) return tier1;

    // Tier 2: Domain Ontology Guardrails
    const tier2 = this.validateDomain(command);
    if (!tier2.isValid) return tier2;

    // Tier 3: Business Rules
    const tier3 = this.validateBusinessRules(command);
    if (!tier3.isValid) return tier3;

    return { isValid: true, tier: 3 };
  }

  private validateSchema(command: CanonicalCommand): ValidationResult {
    if (!command || typeof command !== 'object') {
      return { isValid: false, tier: 1, error: 'Command payload is not an object' };
    }
    if (!command.command_id || typeof command.command_id !== 'string') {
      return { isValid: false, tier: 1, error: 'Missing or invalid command_id' };
    }
    if (!command.action || !VALID_ACTIONS.has(command.action)) {
      return { isValid: false, tier: 1, error: `Invalid action type: ${command.action}` };
    }
    if (!Array.isArray(command.entities)) {
      return { isValid: false, tier: 1, error: 'Entities field must be an array' };
    }
    if (command.schema_version !== '1.0') {
      return { isValid: false, tier: 1, error: `Unsupported schema version: ${command.schema_version}` };
    }
    return { isValid: true, tier: 1 };
  }

  private validateDomain(command: CanonicalCommand): ValidationResult {
    // Reject non-grocery questions that got misrouted as ADD
    if (command.action === 'ADD' && command.raw_transcript) {
      for (const pattern of NON_GROCERY_QUESTION_PATTERNS) {
        if (pattern.test(command.raw_transcript.trim())) {
          return {
            isValid: false,
            tier: 2,
            error: `"${command.raw_transcript}" is a general question and not a grocery shopping command.`,
          };
        }
      }
    }

    if (['ADD', 'MODIFY', 'SEARCH'].includes(command.action)) {
      if (command.entities.length === 0 && !command.target_item) {
        return {
          isValid: false,
          tier: 2,
          error: 'Please specify which grocery item you want (e.g. "1 kg of rice", "milk").',
        };
      }

      for (const entity of command.entities) {
        const cleanName = (entity.name || '').trim().toLowerCase();
        
        if (!cleanName || cleanName.length < 2 || INVALID_UNIT_NAMES.has(cleanName)) {
          return {
            isValid: false,
            tier: 2,
            error: 'Incomplete command: Please specify what grocery item you would like to add (e.g. "1 kg of apples").',
          };
        }
        if (cleanName.endsWith(' of') || cleanName.startsWith('of ')) {
          return {
            isValid: false,
            tier: 2,
            error: 'Incomplete item name: Please specify the product name.',
          };
        }
        if (entity.name.length > 80) {
          return { isValid: false, tier: 2, error: 'Entity name exceeds maximum character length' };
        }
      }
    }
    return { isValid: true, tier: 2 };
  }

  private validateBusinessRules(command: CanonicalCommand): ValidationResult {
    if (command.action === 'ADD' || command.action === 'MODIFY') {
      for (const entity of command.entities) {
        if (typeof entity.quantity !== 'number' || !Number.isFinite(entity.quantity)) {
          return { isValid: false, tier: 3, error: `Invalid numeric quantity for ${entity.name}` };
        }
        if (entity.quantity < 1) {
          return { isValid: false, tier: 3, error: `Quantity for ${entity.name} must be at least 1` };
        }
        if (entity.quantity > 99) {
          return { isValid: false, tier: 3, error: `Quantity for ${entity.name} cannot exceed 99` };
        }
      }
    }
    return { isValid: true, tier: 3 };

  }
}

export const commandValidator = new CommandValidator();
