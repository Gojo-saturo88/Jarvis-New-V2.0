import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  History,
  Trash2,
  X,
  Mic,
  Sparkles,
  Globe,
  BookOpen,
  Film,
} from 'lucide-react';
import { searchService } from '../services/searchService';
import { SearchResultItem } from '../types';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface WebSearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onVoiceSearchRequest: () => void;
}

export const WebSearchModal: React.FC<WebSearchModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onVoiceSearchRequest,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHistory(searchService.getHistory());
      if (initialQuery) {
        setQuery(initialQuery);
        executeSearch(initialQuery, category);
      }
    }
  }, [isOpen, initialQuery]);

  const executeSearch = async (searchQuery: string, cat: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await searchService.search(searchQuery, cat);
      setResults(res);
      setHistory(searchService.getHistory());
    } catch (err) {
      console.warn('Search execution failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, category);
  };

  const handleSelectHistory = (item: string) => {
    setQuery(item);
    executeSearch(item, category);
  };

  const handleClearHistory = () => {
    searchService.clearHistory();
    setHistory([]);
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[88vh]"
      className="holo-panel rounded-2xl flex flex-col border border-amber-500/40 shadow-2xl"
      accentColor="amber"
    >
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
              JARVIS WEB INTELLIGENCE // SEARCH
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-stone-950/40 border-b border-stone-800">
          <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search web, science, topics, or ask a question..."
                className="w-full bg-stone-900/90 text-stone-100 pl-10 pr-10 py-2.5 rounded-xl border border-stone-700 focus:border-amber-400 focus:outline-none text-sm transition-all shadow-inner font-sans"
                autoFocus
              />
              <button
                type="button"
                onClick={onVoiceSearchRequest}
                title="Voice Search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 cursor-pointer p-1"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isLoading ? 'SCANNING...' : 'SEARCH'}
            </button>
          </form>

          {/* Categories */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Results', icon: Sparkles },
              { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
              { id: 'media', label: 'Media & Videos', icon: Film },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    if (query) executeSearch(query, cat.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                    category === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold'
                      : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-amber-300 tracking-widest uppercase">
                Querying Neural Knowledge Web...
              </span>
            </div>
          )}

          {/* Results List */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pb-1 border-b border-stone-800/80">
                <span>FOUND {results.length} VERIFIED INDEX SOURCES</span>
                <span className="text-amber-400/80">DIRECT PROTOCOL ACCESS</span>
              </div>

              {results.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/90 hover:border-amber-500/40 transition-all hover:bg-stone-900/60 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                          {res.source}
                        </span>
                        {res.category && (
                          <span className="text-[10px] font-mono text-stone-500">
                            • {res.category}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-stone-100 text-sm group-hover:text-amber-300 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-xs text-stone-300 mt-1.5 leading-relaxed line-clamp-3 font-sans">
                        {res.snippet}
                      </p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-stone-900 text-stone-400 hover:text-amber-300 hover:bg-stone-800 border border-stone-800 transition-colors shrink-0"
                      title="Open Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search History & Recent Searches */}
          {!isLoading && results.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>RECENT SEARCHES</span>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[11px] font-mono text-stone-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>CLEAR HISTORY</span>
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectHistory(item)}
                      className="px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-amber-500/15 border border-stone-800 hover:border-amber-500/40 text-xs text-stone-300 hover:text-amber-200 transition-all cursor-pointer font-sans"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-stone-500 font-mono">
                  No search history recorded. Type or speak a query to begin.
                </div>
              )}
            </div>
          )}
        </div>
    </HolographicModalWrapper>
  );
};
