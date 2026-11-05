import React, { useState } from 'react';
import {
  Search,
  Grid,
  Youtube,
  Settings,
  Camera,
  Calculator,
  FolderArchive,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';

interface ControlDockProps {
  onOpenSearch: () => void;
  onOpenApps: () => void;
  onOpenYouTube: () => void;
  onOpenCamera: () => void;
  onOpenCalculator: () => void;
  onOpenSettings: () => void;
  onOpenZipModal: () => void;
  onOpenQuickCommands: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  onOpenSearch,
  onOpenApps,
  onOpenYouTube,
  onOpenCamera,
  onOpenCalculator,
  onOpenSettings,
  onOpenZipModal,
  onOpenQuickCommands,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-[96vw] w-full sm:w-auto flex flex-col items-center select-none pointer-events-auto">
      {/* Collapse/Expand Toggle Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1.5 px-3.5 py-1 rounded-full bg-stone-950/85 holo-border text-amber-400/90 hover:text-amber-300 hover:border-amber-400 text-[11px] font-mono tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-xl cursor-pointer transition-all duration-200"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>SHOW STARK HUD CONTROLS</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>CINEMA MODE</span>
          </>
        )}
      </button>

      {/* Main Glassmorphic Dock Container */}
      {!isCollapsed && (
        <div className="holo-panel rounded-2xl px-2 py-2 sm:px-4 sm:py-2.5 flex items-center justify-center gap-1 sm:gap-2.5 backdrop-blur-2xl border border-amber-500/35 shadow-[0_8px_32px_rgba(0,0,0,0.85)] transition-all duration-300 overflow-x-auto max-w-full">
          {/* Quick Voice Commands */}
          <button
            onClick={onOpenQuickCommands}
            title="Voice Commands Engine"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors group cursor-pointer shrink-0"
          >
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide">COMMANDS</span>
          </button>

          {/* Web Search */}
          <button
            onClick={onOpenSearch}
            title="Instant Web Search"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-amber-300 hover:text-amber-200 bg-amber-500/15 border border-amber-500/30 hover:border-amber-400 transition-colors group cursor-pointer shrink-0 gold-glow"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide font-bold">SEARCH</span>
          </button>

          {/* In-App Optical Camera */}
          <button
            onClick={onOpenCamera}
            title="Optical Camera Sensor HUD"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors group cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide">CAMERA</span>
          </button>

          {/* In-App Quantum Calculator */}
          <button
            onClick={onOpenCalculator}
            title="Quantum Computation Calculator"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors group cursor-pointer shrink-0"
          >
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide">CALC</span>
          </button>

          {/* YouTube Control */}
          <button
            onClick={onOpenYouTube}
            title="YouTube Video Controller"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors group cursor-pointer shrink-0"
          >
            <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide">YOUTUBE</span>
          </button>

          {/* Apps Manager */}
          <button
            onClick={onOpenApps}
            title="All Apps Launcher"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors group cursor-pointer shrink-0"
          >
            <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide">APPS</span>
          </button>

          {/* Get ZIP / GitHub */}
          <button
            onClick={onOpenZipModal}
            title="Download ZIP & GitHub Instructions"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors group cursor-pointer shrink-0"
          >
            <FolderArchive className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide">ZIP</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Assistant Voice & AI Settings"
            className="flex flex-col items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors group cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono tracking-wide">CONFIG</span>
          </button>
        </div>
      )}
    </div>
  );
};
