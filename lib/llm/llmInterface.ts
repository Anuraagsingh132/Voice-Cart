import { CanonicalAction, CanonicalEntity, SearchFilterCriteria } from '@/types/schema';

export interface LLMInterpretationResult {
  action: CanonicalAction;
  entities: CanonicalEntity[];
  target_item?: string | null;
  filters?: SearchFilterCriteria;
  confidence: number;
  explanation: string;
}

export interface LLMProvider {
  name: string;
  interpret(transcript: string, locale?: string): Promise<LLMInterpretationResult>;
}
