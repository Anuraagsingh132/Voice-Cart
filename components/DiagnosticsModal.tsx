'use client';

import React, { useState, useEffect } from 'react';
import { X, Activity, Cpu, ShieldCheck, Undo2, Layers, AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import { eventStore } from '@/lib/events/eventStore';
import { telemetry } from '@/lib/observability/telemetry';
import { consoleLogger } from '@/lib/observability/consoleLogger';
import { EventLogEntry, TelemetryMetrics } from '@/types/schema';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerUndo: () => void;
}

export function DiagnosticsModal({ isOpen, onClose, onTriggerUndo }: DiagnosticsModalProps) {
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMetrics(telemetry.getSnapshot());
      setEvents(eventStore.getEvents().reverse());
      setCopied(false);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleRefresh = () => {
    setMetrics(telemetry.getSnapshot());
    setEvents(eventStore.getEvents().reverse());
  };

  const handleCopyLogs = async () => {
    const logs = consoleLogger.getFormattedHistory();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(logs);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!isOpen) return null;

  const fastPathPct = metrics ? Math.round(metrics.fast_path_ratio * 100) : 100;
  const isTargetAchieved = fastPathPct >= 80;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostics-modal-title"
    >
      <div className="glass-card shadow-glass-lg rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-vc-border overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-vc-border-subtle flex items-center justify-between bg-vc-bg-subtle/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl badge-emerald flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 id="diagnostics-modal-title" className="text-base font-bold text-vc-text">Mission Control</h2>

              <p className="text-xs text-vc-text-secondary font-medium">System Diagnostics & Event Log</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition btn-glass ${
                copied
                  ? 'text-vc-success border-vc-success/30'
                  : ''
              }`}
              title="Copy formatted conversation & debug logs to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Logs!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Debug Logs</span>
                </>
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl transition btn-glass"
              title="Refresh Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition btn-glass"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Modal Body */}
        <div className="p-6 overflow-y-auto styled-scroll space-y-6 bg-vc-bg/40">
          {/* Telemetry Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-vc-text-muted mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-vc-cyan" /> Performance & Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-2xl p-3.5 border border-vc-border-subtle">
                <p className="text-[11px] font-semibold text-vc-text-secondary">Fast Path Rate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-xl font-black ${isTargetAchieved ? 'text-vc-emerald' : 'text-vc-warning'}`}>
                    {fastPathPct}%
                  </span>
                  <span className="text-[10px] text-vc-text-muted font-medium">target &ge;80%</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-3.5 border border-vc-border-subtle">
                <p className="text-[11px] font-semibold text-vc-text-secondary">Parser Latency</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-vc-emerald">
                    {metrics?.avg_parser_latency_ms || 0.4}ms
                  </span>
                  <span className="text-[10px] text-vc-text-muted font-medium">&lt;2ms</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-3.5 border border-vc-border-subtle">
                <p className="text-[11px] font-semibold text-vc-text-secondary">Commands Total</p>
                <p className="text-xl font-black text-vc-text mt-1">
                  {metrics?.total_commands || 0}
                </p>
              </div>

              <div className="glass rounded-2xl p-3.5 border border-vc-border-subtle">
                <p className="text-[11px] font-semibold text-vc-text-secondary">LLM Fallbacks</p>
                <p className="text-xl font-black text-vc-text-secondary mt-1">
                  {metrics?.llm_fallback_count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Groq Model Cascades & Failover Hierarchy */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-vc-text-muted mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-vc-violet" /> Groq Model Cascades & Failover Hierarchy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* STT Cascade */}
              <div className="glass rounded-2xl p-4 border border-vc-border-subtle">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-vc-text">🎙️ Speech-To-Text Cascade</p>
                  <span className="text-[10px] font-bold badge-emerald px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="mt-2.5 space-y-1 text-[11px] font-mono text-vc-text-secondary">
                  <p>1. <span className="font-bold text-vc-text">whisper-large-v3-turbo</span> (Primary Fast)</p>
                  <p>2. <span className="font-bold text-vc-text-secondary">whisper-large-v3</span> (Multilingual)</p>
                  <p>3. <span className="text-vc-text-muted">WebSpeech API</span> (Parallel Fallback)</p>
                </div>
              </div>

              {/* LLM Cascade */}
              <div className="glass rounded-2xl p-4 border border-vc-border-subtle">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-vc-text">🧠 LLM Ambiguity Cascade</p>
                  <span className="text-[10px] font-bold badge-emerald px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="mt-2.5 space-y-1 text-[11px] font-mono text-vc-text-secondary">
                  <p>1. <span className="font-bold text-vc-text">llama-3.3-70b-versatile</span> (Top Intel)</p>
                  <p>2. <span className="font-bold text-vc-text-secondary">llama-3.1-8b-instant</span> (High TPM)</p>
                  <p>3. <span className="text-vc-text-muted">Deterministic Engine</span> (Offline Fast Path)</p>
                </div>
              </div>
            </div>
          </div>


          {/* Immutable Event Audit Log with Undo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-vc-text-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-vc-cyan" /> Immutable Event Stream ({events.length})
              </h3>
              <button
                onClick={() => {
                  onTriggerUndo();
                  handleRefresh();
                }}
                disabled={events.length === 0}
                className="flex items-center gap-1.5 text-xs font-bold btn-glass px-3 py-1.5 rounded-xl transition disabled:opacity-40 text-vc-error border-vc-error/30 hover:bg-vc-error/10"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Compensating Undo</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-8 glass rounded-2xl border border-vc-border-subtle">
                <p className="text-xs text-vc-text-muted">No domain events recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 styled-scroll">
                {events.map((evt) => (
                  <div
                    key={evt.event_id}
                    className="p-3 bg-vc-bg-subtle/50 hover:bg-vc-bg-subtle rounded-xl border border-vc-border-subtle flex items-center justify-between text-xs transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] badge-violet px-1.5 py-0.5 rounded-md">
                          {evt.type}
                        </span>
                        <span className="font-bold text-vc-text truncate">
                          {evt.payload.name ? `${evt.payload.quantity ? `${evt.payload.quantity} ` : ''}${evt.payload.name}` : evt.payload.explanation || 'Action'}
                        </span>
                      </div>
                      <p className="text-[10px] text-vc-text-muted font-mono mt-0.5">
                        v{evt.aggregate_version} • {new Date(evt.timestamp).toLocaleTimeString()} • {evt.metadata.route}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-vc-text-muted flex-shrink-0">
                      {evt.event_id.substring(0, 12)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
