import React, { useState } from 'react';
import { Youtube, Search, ExternalLink, Play, X, Mic } from 'lucide-react';
import { androidBridge } from '../services/androidBridge';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface YouTubeModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onVoiceSearch: () => void;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onVoiceSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [videoUrl, setVideoUrl] = useState('');
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    androidBridge.searchYouTube(searchQuery);
  };

  const handleLaunchApp = () => {
    const ytApp = androidBridge.findAppByQuery('youtube');
    if (ytApp) {
      androidBridge.launchApp(ytApp);
    } else {
      window.open('https://www.youtube.com', '_blank');
    }
  };

  const handlePlayVideoLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    // Extract YouTube Video ID if present
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      setActiveEmbedId(match[2]);
    } else {
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[88vh]"
      className="holo-panel rounded-2xl flex flex-col border border-red-500/40 shadow-2xl"
      accentColor="red"
    >
        {/* Header */}
        <div className="p-4 border-b border-red-500/20 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
              YOUTUBE CONTROLLER // STREAM INTERFACE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Quick Action: Launch App directly */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/20 border border-red-500/30">
            <div>
              <h4 className="font-bold text-stone-100 text-sm">Launch Official YouTube App</h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Launches native Android YouTube player using hardware intent.
              </p>
            </div>
            <button
              onClick={handleLaunchApp}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-red-900/40"
            >
              <ExternalLink className="w-4 h-4" />
              <span>LAUNCH APP</span>
            </button>
          </div>

          {/* Voice Search YouTube */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-stone-300">SEARCH YOUTUBE VIA VOICE OR TEXT</label>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Arijit Singh live concert, Tech teardown, etc."
                  className="w-full bg-stone-900 text-stone-100 pl-9 pr-10 py-2.5 rounded-xl border border-stone-700 focus:border-red-400 focus:outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={onVoiceSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-300 cursor-pointer"
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-red-600 hover:text-white text-stone-200 border border-stone-700 text-xs font-mono transition-colors cursor-pointer"
              >
                SEARCH
              </button>
            </form>
          </div>

          {/* Open direct video link & Embedded Player */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-xs font-mono text-stone-300">PLAY DIRECT VIDEO LINK</label>
            <form onSubmit={handlePlayVideoLink} className="flex gap-2">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube video link (e.g. https://youtu.be/...)"
                className="flex-1 bg-stone-900 text-stone-100 px-3 py-2 rounded-xl border border-stone-700 focus:border-red-400 focus:outline-none text-xs font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>LOAD</span>
              </button>
            </form>
          </div>

          {/* Embedded Player if ID loaded */}
          {activeEmbedId && (
            <div className="rounded-xl overflow-hidden border border-red-500/40 aspect-video shadow-2xl bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${activeEmbedId}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Recommended Quick Commands */}
          <div className="pt-2 border-t border-stone-800">
            <span className="text-[10px] font-mono text-stone-400 block mb-2">
              TRY SPEAKING THESE VOICE COMMANDS:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'YouTube kholo',
                'YouTube par Arijit Singh ke gaane search karo',
                'Search quantum physics documentaries on YouTube',
                'Play relax music on YouTube',
              ].map((cmd, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-amber-300/90 font-mono text-[11px]"
                >
                  "{cmd}"
                </span>
              ))}
            </div>
          </div>
        </div>
    </HolographicModalWrapper>
  );
};
