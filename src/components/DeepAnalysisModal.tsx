import React, { useState } from 'react';
import { Sparkles, Globe2, ExternalLink, Volume2, Search, Loader2, X, CheckCircle2 } from 'lucide-react';
import { DeepAnalysisResult } from '../types';
import { deepAnalysisService } from '../services/deepAnalysisService';
import { playSound } from '../services/soundEffects';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface DeepAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakBriefing: (text: string) => void;
  initialQuery?: string;
}

export const DeepAnalysisModal: React.FC<DeepAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSpeakBriefing,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    playSound('listen_start');

    try {
      const res = await deepAnalysisService.analyzeTopic(q);
      setResult(res);
      playSound('activate');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed across connected web nodes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      maxHeight="h-[85vh]"
      className="flex flex-col rounded-3xl bg-slate-900/90 border border-white/20 shadow-2xl font-sans"
      accentColor="cyan"
    >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">JARVIS DEEP WEB INTELLIGENCE</h2>
              <p className="text-xs text-cyan-400 font-mono">Multi-Node Global Knowledge Crawl & Synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-950/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAnalysis();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter any topic to scan and synthesize (e.g., Quantum Computing, Mars Rover, Fusion Power)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider flex items-center gap-2 transition-all ${
                loading || !query.trim()
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30 hover:scale-105'
              }`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'ANALYZING...' : 'DEEP ANALYZE'}
            </button>
          </form>

          {/* Preset Topics */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs text-slate-400">
            <span className="font-mono text-[10px] text-cyan-400 shrink-0">QUICK TARGETS:</span>
            {['Arc Reactor Physics', 'James Webb Deep Space', 'Quantum Supremacy', 'Artificial General Intelligence'].map(
              (preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setQuery(preset);
                    handleRunAnalysis(preset);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-200 border border-white/5 transition-all shrink-0"
                >
                  {preset}
                </button>
              )
            )}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/40">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Globe2 size={28} className="absolute inset-0 m-auto text-cyan-300 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Scanning Global Internet Indexes...</h3>
              <p className="text-xs font-mono text-cyan-400">
                Crawling Wikipedia API, DuckDuckGo Knowledge graph, and live HTTPS nodes
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-400/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Executive Synthesis: {result.query}
                    </h3>
                  </div>
                  <button
                    onClick={() => onSpeakBriefing(result.summary)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-mono transition-all hover:scale-105"
                  >
                    <Volume2 size={14} className="text-cyan-400" />
                    Voice Briefing
                  </button>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
                <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-cyan-300">
                  <span>CONFIDENCE: {(result.confidence * 100).toFixed(1)}%</span>
                  <span>TIME: {result.timestamp}</span>
                </div>
              </div>

              {/* Analytical Deductions */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                  Key Deductions & Data Nodes
                </h4>
                <div className="space-y-2">
                  {result.keyInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <span className="font-mono text-cyan-400 shrink-0 font-bold">0{idx + 1}.</span>
                      <span className="leading-relaxed">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Web Sources & Citations */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                  Verified Web Sources ({result.sources.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.sources.map((src) => (
                    <a
                      key={src.id}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                          <span className="truncate">{src.title}</span>
                          <ExternalLink size={12} className="text-slate-400 shrink-0 ml-1" />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{src.snippet}</p>
                      </div>
                      <span className="mt-2 text-[10px] font-mono text-cyan-400">{src.source}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Globe2 size={48} className="text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Ready for Global Internet Deep Scan</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Ask any question or click a preset topic above. JARVIS crawls multiple live web sources and generates an authoritative synthesized dossier.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}
        </div>
    </HolographicModalWrapper>
  );
};
