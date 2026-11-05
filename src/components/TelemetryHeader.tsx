import React from 'react';
import { Search, FolderArchive, Smartphone, Sparkles, Terminal, Volume2 } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface TelemetryHeaderProps {
  language: SupportedLanguage;
  isNativeCompanion: boolean;
  isAIEnabled: boolean;
  onOpenSearch: () => void;
  onOpenZipModal: () => void;
  onOpenAndroidCompanion: () => void;
  onOpenCommands: () => void;
  onPlayEastWingAudio: () => void;
}

export const TelemetryHeader: React.FC<TelemetryHeaderProps> = ({
  language,
  isNativeCompanion,
  isAIEnabled,
  onOpenSearch,
  onOpenZipModal,
  onOpenAndroidCompanion,
  onOpenCommands,
  onPlayEastWingAudio,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-20 pointer-events-none p-3 sm:p-5 flex items-start justify-between">
      {/* Top Left: Stark Industries Holographic Telemetry */}
      <div className="pointer-events-auto flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse" />
          <h1 className="font-mono font-bold tracking-widest text-amber-400 text-sm sm:text-base drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            JARVIS 4.0 // STARK IND.
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase hidden sm:inline-block">
            MARK 85 AI CORE
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400">
          <span>REACTOR: 100%</span>
          <span>•</span>
          <span className="text-amber-400 font-bold uppercase">{language}</span>
          <span>•</span>
          <span className={isAIEnabled ? 'text-cyan-400' : 'text-emerald-400'}>
            {isAIEnabled ? 'HYBRID AI' : 'FREE LOCAL'}
          </span>
        </div>
      </div>

      {/* Top Right: Search Button & Project ZIP Export Button */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* User's Authentic Jarvis Audio Clip Button */}
        <button
          onClick={onPlayEastWingAudio}
          title="Play Reference Audio: East Wing Power Fluctuations"
          className="px-3.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/35 border border-amber-400/50 text-[11px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-xl shadow-lg transition-all text-amber-300 hover:text-white cursor-pointer gold-glow"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">EAST WING AUDIO</span>
          <span className="sm:hidden">AUDIO</span>
        </button>

        {/* User-requested prominent Search Button */}
        <button
          onClick={onOpenSearch}
          title="Instant Web Search"
          className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 text-[11px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-xl shadow-lg transition-all text-amber-300 hover:text-amber-200 cursor-pointer gold-glow"
        >
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span>SEARCH</span>
        </button>

        {/* User-requested Project ZIP / GitHub Button */}
        <button
          onClick={onOpenZipModal}
          title="Download Complete Source Code ZIP or Push to GitHub"
          className="px-3 py-1.5 rounded-xl bg-stone-950/80 hover:bg-amber-500/15 border border-stone-800 hover:border-amber-400 text-[11px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-xl shadow-lg transition-all text-stone-300 hover:text-amber-300 cursor-pointer"
        >
          <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">GET ZIP / GITHUB</span>
          <span className="sm:hidden">ZIP</span>
        </button>

        {/* Android Companion APK Button */}
        <button
          onClick={onOpenAndroidCompanion}
          title="Android Companion APK & Source Code"
          className="px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-400 text-[11px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-xl shadow-lg transition-all text-stone-300 hover:text-amber-300 cursor-pointer"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isNativeCompanion ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span className="hidden sm:inline">
            {isNativeCompanion ? 'NATIVE OK' : 'ANDROID APK'}
          </span>
          <span className="sm:hidden">APK</span>
        </button>
      </div>
    </header>
  );
};
