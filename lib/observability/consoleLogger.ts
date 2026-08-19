/**
 * Voice Cart Observability & Structured Console Logger
 * Provides color-coded, detailed debug logging in browser & backend console
 * plus a 1-click log export mechanism to share conversation history.
 */

export interface LogEntry {
  timestamp: string;
  stage: 'VOICE_INPUT' | 'STT_TRANSCRIPTION' | 'INTENT_PARSING' | 'VALIDATION' | 'EVENT_EXECUTION' | 'OUTPUT_RESPONSE' | 'ERROR';
  summary: string;
  details: Record<string, any>;
}

class ConsoleLogger {
  private logHistory: LogEntry[] = [];
  private maxHistory = 100;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private addEntry(stage: LogEntry['stage'], summary: string, details: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      stage,
      summary,
      details,
    };
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory.shift();
    }
  }

  // 1. Log Raw User Speech Input
  public logVoiceInput(rawTranscript: string, language: string, source: string) {
    this.addEntry('VOICE_INPUT', `Heard: "${rawTranscript}"`, { rawTranscript, language, source });
    
    if (this.isClient()) {
      console.groupCollapsed(
        `%c🎙️ [VOICE INPUT] %c"${rawTranscript}" %c(${language}, ${source})`,
        'background: #10b981; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'font-weight: bold; color: #047857;',
        'color: #6b7280; font-size: 11px;'
      );
      console.log('• Raw Transcript:', rawTranscript);
      console.log('• Locale / Language:', language);
      console.log('• Audio Source:', source);
      console.log('• Timestamp:', new Date().toLocaleTimeString());
      console.groupEnd();
    } else {
      console.log(`[VOICE INPUT] "${rawTranscript}" [${language}] via ${source}`);
    }
  }

  // 2. Log Speech-To-Text Transcription & Fallback Details
  public logSTT(result: { transcript: string; model_used: string; confidence: number; duration_ms: number }) {
    this.addEntry('STT_TRANSCRIPTION', `STT via ${result.model_used}`, result);

    if (this.isClient()) {
      console.groupCollapsed(
        `%c🎧 [STT GATEWAY] %c${result.model_used} %c(${Math.round(result.duration_ms)}ms, conf: ${result.confidence})`,
        'background: #6366f1; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'font-weight: bold; color: #4338ca;',
        'color: #6b7280; font-size: 11px;'
      );
      console.log('• Model Used:', result.model_used);
      console.log('• Final Transcript:', result.transcript);
      console.log('• Confidence:', result.confidence);
      console.log('• Latency:', `${result.duration_ms.toFixed(2)}ms`);
      console.groupEnd();
    }
  }

  // 3. Log Intent Interpretation & Multi-Model / Fast-Path Details
  public logIntent(info: {
    route: string;
    action: string;
    model_used?: string;
    entities: any[];
    confidence: any;
    parser_latency_ms: number;
  }) {
    this.addEntry('INTENT_PARSING', `Action: ${info.action} via ${info.route}`, info);

    const isFastPath = info.route === 'deterministic_fast_path';
    const badgeColor = isFastPath ? '#059669' : '#d97706';

    if (this.isClient()) {
      console.groupCollapsed(
        `%c🧠 [INTENT PARSER] %c${info.action} %cvia ${info.model_used || info.route} (${info.parser_latency_ms.toFixed(2)}ms)`,
        `background: ${badgeColor}; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;`,
        'font-weight: bold; color: #1f2937;',
        'color: #6b7280; font-size: 11px;'
      );
      console.log('• Route:', info.route);
      console.log('• Model / Engine:', info.model_used || (isFastPath ? 'Deterministic Rule Engine (<2ms)' : 'LLM Gateway'));
      console.log('• Action:', info.action);
      console.log('• Extracted Entities:', info.entities);
      console.log('• Confidence:', info.confidence);
      console.log('• Parser Latency:', `${info.parser_latency_ms.toFixed(2)}ms`);
      console.groupEnd();
    } else {
      console.log(`[INTENT PARSER] Action: ${info.action} | Route: ${info.route} | Entities: ${info.entities.length} | Latency: ${info.parser_latency_ms.toFixed(2)}ms`);
    }
  }

  // 4. Log Execution, Domain Events & State Mutated
  public logExecution(result: {
    success: boolean;
    action: string;
    message: string;
    aggregate_version: number;
    events: any[];
    total_latency_ms?: number;
  }) {
    this.addEntry('EVENT_EXECUTION', `Executed: ${result.message}`, result);

    if (this.isClient()) {
      console.groupCollapsed(
        `%c📦 [EVENT SOURCING & STATE] %c${result.success ? 'SUCCESS' : 'FAILED'} %c(v${result.aggregate_version})`,
        result.success ? 'background: #10b981; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;' : 'background: #ef4444; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'font-weight: bold; color: #111827;',
        'color: #6b7280; font-size: 11px;'
      );
      console.log('• Execution Message:', result.message);
      console.log('• Aggregate Version:', result.aggregate_version);
      console.log('• Committed Events:', result.events);
      if (result.total_latency_ms) {
        console.log('• Total End-to-End Latency:', `${result.total_latency_ms.toFixed(2)}ms`);
      }
      console.groupEnd();
    } else {
      console.log(`[EXECUTION] ${result.success ? 'OK' : 'ERR'}: ${result.message} (v${result.aggregate_version})`);
    }
  }

  // 5. Log Error with Details
  public logError(stage: LogEntry['stage'], message: string, error: any) {
    this.addEntry('ERROR', `${stage} Error: ${message}`, { error: String(error?.stack || error?.message || error) });
    console.error(`❌ [${stage} ERROR]`, message, error);
  }

  // 6. Get Formatted Session History Dump for Sharing
  public getFormattedHistory(): string {
    if (this.logHistory.length === 0) {
      return 'No logs recorded in this session yet.';
    }

    const header = `=== VOICE CART CONVERSATION & DEBUG LOG ===\nExported: ${new Date().toISOString()}\nTotal Entries: ${this.logHistory.length}\n===========================================\n\n`;

    const body = this.logHistory
      .map((entry, idx) => {
        return `[${idx + 1}] [${entry.timestamp.split('T')[1].replace('Z', '')}] [${entry.stage}]
Summary: ${entry.summary}
Details: ${JSON.stringify(entry.details, null, 2)}
-------------------------------------------`;
      })
      .join('\n\n');

    return header + body;
  }

  // 7. Expose on window object for easy in-browser console extraction
  public attachWindowDebug() {
    if (this.isClient()) {
      (window as any).getVoiceCartLogs = () => {
        const text = this.getFormattedHistory();
        console.log(text);
        return text;
      };
      (window as any).copyVoiceCartLogs = () => {
        const text = this.getFormattedHistory();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          console.log('📋 Voice Cart conversation logs copied to clipboard!');
        }
        return text;
      };
    }
  }
}

export const consoleLogger = new ConsoleLogger();

if (typeof window !== 'undefined') {
  consoleLogger.attachWindowDebug();
}
