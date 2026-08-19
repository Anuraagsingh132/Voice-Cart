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
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">System Diagnostics & Event Log</h2>
              <p className="text-xs text-neutral-500 font-medium">Modular Monolith Telemetry & Event Sourcing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
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
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              title="Refresh Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Telemetry Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Performance & Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/60">
                <p className="text-[11px] font-semibold text-neutral-500">Fast Path Rate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-xl font-black ${isTargetAchieved ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {fastPathPct}%
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">target &ge;80%</span>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/60">
                <p className="text-[11px] font-semibold text-neutral-500">Parser Latency</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-emerald-600">
                    {metrics?.avg_parser_latency_ms || 0.4}ms
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">&lt;2ms</span>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/60">
                <p className="text-[11px] font-semibold text-neutral-500">Commands Total</p>
                <p className="text-xl font-black text-neutral-900 mt-1">
                  {metrics?.total_commands || 0}
                </p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/60">
                <p className="text-[11px] font-semibold text-neutral-500">LLM Fallbacks</p>
                <p className="text-xl font-black text-neutral-700 mt-1">
                  {metrics?.llm_fallback_count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Groq Model Cascades & Failover Hierarchy */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Groq Model Cascades & Failover Hierarchy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* STT Cascade */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-neutral-900">🎙️ Speech-To-Text Cascade</p>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="mt-2.5 space-y-1 text-[11px] font-mono text-neutral-600">
                  <p>1. <span className="font-bold text-neutral-900">whisper-large-v3-turbo</span> (Primary Fast)</p>
                  <p>2. <span className="font-bold text-neutral-800">whisper-large-v3</span> (Multilingual Precision)</p>
                  <p>3. <span className="text-neutral-500">WebSpeech API</span> (Parallel Client Fallback)</p>
                </div>
              </div>

              {/* LLM Cascade */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-neutral-900">🧠 LLM Ambiguity Cascade</p>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="mt-2.5 space-y-1 text-[11px] font-mono text-neutral-600">
                  <p>1. <span className="font-bold text-neutral-900">llama-3.3-70b-versatile</span> (Top Intelligence)</p>
                  <p>2. <span className="font-bold text-neutral-800">llama-3.1-8b-instant</span> (High TPM Fallback)</p>
                  <p>3. <span className="text-neutral-500">Deterministic Engine</span> (Offline Fast Path)</p>
                </div>
              </div>
            </div>
          </div>


          {/* Immutable Event Audit Log with Undo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Immutable Event Stream ({events.length})
              </h3>
              <button
                onClick={() => {
                  onTriggerUndo();
                  handleRefresh();
                }}
                disabled={events.length === 0}
                className="flex items-center gap-1.5 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded-xl transition disabled:opacity-40"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Compensating Undo</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <p className="text-xs text-neutral-400">No domain events recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div
                    key={evt.event_id}
                    className="p-3 bg-neutral-50/80 hover:bg-neutral-100/60 rounded-xl border border-neutral-200/60 flex items-center justify-between text-xs transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] bg-neutral-200/70 text-neutral-800 px-1.5 py-0.5 rounded-md">
                          {evt.type}
                        </span>
                        <span className="font-bold text-neutral-900 truncate">
                          {evt.payload.name ? `${evt.payload.quantity ? `${evt.payload.quantity} ` : ''}${evt.payload.name}` : evt.payload.explanation || 'Action'}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        v{evt.aggregate_version} • {new Date(evt.timestamp).toLocaleTimeString()} • {evt.metadata.route}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 flex-shrink-0">
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
