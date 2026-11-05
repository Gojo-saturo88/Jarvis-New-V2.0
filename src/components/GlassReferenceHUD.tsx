import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  LayoutGrid,
  Search,
  Send,
  Home,
  MessageSquare,
  Mail,
  PhoneCall,
  Activity,
  Settings,
  Flame,
  Volume2,
  RefreshCw,
  Lock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Plus,
  Loader2,
  Globe2,
  Cpu,
  ShieldAlert,
  ChevronDown,
  FileText,
  Radio,
  Sliders,
  Smartphone,
} from 'lucide-react';
import { AssistantState, ThemeMode, EmailItem } from '../types';

interface GlassReferenceHUDProps {
  state: AssistantState;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onTriggerVoice: () => void;
  onPlayReferenceVoice: () => void;
  onOpenEmails: () => void;
  onOpenPhone: () => void;
  onOpenApps: () => void;
  onOpenSearch: () => void;
  onOpenDeepAnalysis: () => void;
  onOpenSettings: () => void;
  onOpenDiagnostics: () => void;
  onExecuteCommand: (query: string) => void;
  unreadEmailCount: number;
  latestEmail?: EmailItem;
  transcript?: string;
  response?: string;
  inputText: string;
  setInputText: (text: string) => void;
  onSubmitInput: () => void;
  isAuthenticAudioPlaying: boolean;
  onToggleHudMode?: () => void;
  hudMode?: 'reference' | 'mobile';
}

export const GlassReferenceHUD: React.FC<GlassReferenceHUDProps> = ({
  state,
  theme,
  onThemeChange,
  onTriggerVoice,
  onPlayReferenceVoice,
  onOpenEmails,
  onOpenPhone,
  onOpenApps,
  onOpenSearch,
  onOpenDeepAnalysis,
  onOpenSettings,
  onOpenDiagnostics,
  onExecuteCommand,
  unreadEmailCount,
  latestEmail,
  transcript,
  response,
  inputText,
  setInputText,
  onSubmitInput,
  isAuthenticAudioPlaying,
  onToggleHudMode,
  hudMode = 'reference',
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'voice' | 'emails' | 'calls' | 'analytics' | 'settings'>('home');
  const [showInputDock, setShowInputDock] = useState(false);

  // Status text for the floating top-right "Working..." capsule pill from reference UI
  const getStatusPill = () => {
    switch (state) {
      case 'listening':
        return { label: 'Listening...', color: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/40' };
      case 'thinking':
        return { label: 'Analyzing Web...', color: 'text-amber-300 border-amber-400/40 bg-amber-950/40' };
      case 'speaking':
        return { label: 'JARVIS Speaking...', color: 'text-cyan-300 border-cyan-400/40 bg-cyan-950/40' };
      case 'executing':
        return { label: 'Executing...', color: 'text-purple-300 border-purple-400/40 bg-purple-950/40' };
      default:
        return { label: 'Working...', color: 'text-blue-300 border-blue-400/30 bg-blue-950/30' };
    }
  };

  const statusPill = getStatusPill();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-5 z-20 overflow-hidden font-sans select-none">
      {/* 1. TOP BROWSER-STYLE GLASS HEADER BAR (Directly matching reference image images__2__c2c6db3e.jpeg) */}
      <div className="pointer-events-auto flex items-center justify-between gap-3 w-full backdrop-blur-2xl bg-slate-900/45 border border-white/20 rounded-2xl px-4 py-2.5 shadow-2xl">
        {/* Window control dots + Navigation buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-300/40 cursor-pointer shadow-sm hover:opacity-80 transition-opacity" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-300/40 cursor-pointer shadow-sm hover:opacity-80 transition-opacity" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-300/40 cursor-pointer shadow-sm hover:opacity-80 transition-opacity" />
          </div>

          {/* Navigation controls */}
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <button
              onClick={() => onExecuteCommand('system diagnostic')}
              title="Back / Diagnostics"
              className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onExecuteCommand('status report')}
              title="Forward / Status"
              className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => window.location.reload()}
              title="Refresh Neural Core"
              className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Frosted address pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
            <Lock size={12} className="text-cyan-400" />
            <span className="font-mono tracking-wide">stark-industries://jarvis-core-4.0.os</span>
          </div>
        </div>

        {/* Center / Right controls: Reference Avatar + Working... Capsule, Theme Switcher, HUD Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reference Image Jarvis avatar badge & Working... pill */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              J
            </div>
            <span className="text-xs font-semibold text-white hidden sm:inline">Jarvis</span>
          </div>

          {/* Working... Status Capsule (Directly from reference image) */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md shadow-md text-xs font-medium ${statusPill.color}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono text-[11px]">{statusPill.label}</span>
          </div>

          {/* Theme Mode Switcher */}
          <div className="hidden xl:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => onThemeChange('stark-gold')}
              title="Stark Gold (Reference Orb from User Image)"
              className={`px-2.5 py-1 text-[11px] rounded-lg font-mono transition-all cursor-pointer ${
                theme === 'stark-gold'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300'
                  : 'text-amber-400/80 hover:text-amber-200'
              }`}
            >
              GOLD ORB
            </button>
            <button
              onClick={() => onThemeChange('cobalt-glass')}
              title="Cobalt Glass (Reference UI Theme)"
              className={`px-2.5 py-1 text-[11px] rounded-lg font-mono transition-all cursor-pointer ${
                theme === 'cobalt-glass'
                  ? 'bg-blue-600/80 text-white shadow-lg border border-blue-400/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              COBALT UI
            </button>
          </div>

          {/* HUD Switcher Button (Reference UI vs Mobile HUD) */}
          {onToggleHudMode && (
            <button
              onClick={onToggleHudMode}
              title="Toggle between Reference Glass UI and Clean Mobile HUD"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono hover:bg-cyan-500/25 transition-all cursor-pointer"
            >
              <Smartphone size={13} />
              <span className="hidden md:inline font-bold">HUD MODE</span>
            </button>
          )}

          {/* Authentic Reference Voice Playback Button */}
          <button
            onClick={onPlayReferenceVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              isAuthenticAudioPlaying
                ? 'bg-amber-500 border-amber-300 text-stone-950 font-bold animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            }`}
            title="Play authentic recorded reference voice clip"
          >
            <Volume2 size={13} className={isAuthenticAudioPlaying ? 'text-stone-950 animate-bounce' : 'text-amber-400'} />
            <span className="font-bold hidden lg:inline">AUTHENTIC VOICE</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Neural & System Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE WITH LAYERED TRANSLUCENT GLASS CARDS */}
      <div className="flex-1 flex items-stretch gap-4 sm:gap-6 my-3 overflow-hidden pointer-events-none relative">
        {/* LEFT VERTICAL GLASS DOCK (Icons matching images__2__c2c6db3e.jpeg) */}
        <aside className="pointer-events-auto hidden md:flex flex-col items-center justify-between w-14 sm:w-16 py-4 px-2 backdrop-blur-2xl bg-slate-900/40 border border-white/15 rounded-3xl shadow-2xl z-10">
          {/* Top user avatar */}
          <div className="flex flex-col items-center gap-4">
            <div
              onClick={() => onExecuteCommand('JARVIS online')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-[2px] cursor-pointer shadow-lg hover:scale-105 transition-transform"
              title="JARVIS Neural Core"
            >
              <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center">
                <span className="text-xs font-black text-cyan-300 font-mono">JS</span>
              </div>
            </div>

            {/* Navigation icon buttons */}
            <nav className="flex flex-col items-center gap-2.5">
              <button
                onClick={() => setActiveTab('home')}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.25)] border border-white/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Home Dashboard"
              >
                <Home size={19} />
              </button>

              <button
                onClick={() => {
                  setActiveTab('voice');
                  onTriggerVoice();
                }}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                  state === 'listening'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400 animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Voice Assistant (Mic)"
              >
                <MessageSquare size={19} />
              </button>

              <button
                onClick={() => {
                  setActiveTab('emails');
                  onOpenEmails();
                }}
                className="relative p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Stark Communications & Emails"
              >
                <Mail size={19} />
                {unreadEmailCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {unreadEmailCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('calls');
                  onOpenPhone();
                }}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Communications Dialer"
              >
                <PhoneCall size={19} />
              </button>

              <button
                onClick={onOpenApps}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Apps & Tools Drawer"
              >
                <LayoutGrid size={19} />
              </button>

              <button
                onClick={onOpenDeepAnalysis}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Google Gemini Deep Internet Analysis"
              >
                <Sparkles size={19} className="text-cyan-400" />
              </button>
            </nav>
          </div>

          {/* Bottom Settings Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="System Configuration"
            >
              <Settings size={19} />
            </button>
          </div>
        </aside>

        {/* CENTER WORKSPACE: 100% open and unobstructed so the 3D Holographic Globe is fully visible without any cards in front of it */}
        <div className="flex-1 relative pointer-events-none" />

          {/* FOREGROUND OVERLAPPING ANALYTICS WINDOW (Prominent in images__2__c2c6db3e.jpeg) */}
          <div className="pointer-events-auto hidden lg:flex flex-col w-84 backdrop-blur-2xl bg-slate-900/50 border border-white/20 rounded-3xl p-5 shadow-2xl absolute right-8 top-12 z-20">
            {/* Header with dots and dropdown icon */}
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                <span>SYNAPSE WAVE</span>
                <ChevronDown size={12} />
              </div>
            </div>

            {/* SVG Spline Wave Graph with glowing peak dot (1:1 match to reference image!) */}
            <div className="relative w-full h-36 bg-white/5 rounded-2xl p-2 border border-white/10 flex items-center justify-center overflow-hidden mb-3">
              <svg viewBox="0 0 240 100" className="w-full h-full">
                <defs>
                  <linearGradient id="waveGradRef" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="neonGlowRef" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Smooth area fill under the curve */}
                <path
                  d="M 0,80 Q 30,75 50,55 T 100,50 T 140,25 T 180,65 T 240,40 L 240,100 L 0,100 Z"
                  fill="url(#waveGradRef)"
                />

                {/* Spline curve stroke */}
                <path
                  d="M 0,80 Q 30,75 50,55 T 100,50 T 140,25 T 180,65 T 240,40"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.8"
                  filter="url(#neonGlowRef)"
                />

                {/* Peak indicator dot & vertical dashed drop line */}
                <line x1="140" y1="25" x2="140" y2="92" stroke="#38bdf8" strokeDasharray="3,3" strokeWidth="1.2" opacity="0.65" />
                <circle cx="140" cy="25" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2.5" filter="url(#neonGlowRef)" />
              </svg>

              <div className="absolute top-2 right-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-400/30">
                98.4% SYNAPSE
              </div>
            </div>

            {/* Telemetry data rows */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Cpu size={14} className="text-cyan-400" />
                  AI Engine
                </span>
                <span className="font-mono text-cyan-300 font-bold">Gemini 3.8 Flash</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Globe2 size={14} className="text-blue-400" />
                  Search Grounding
                </span>
                <span className="font-mono text-blue-300">Live Web Index</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Activity size={14} className="text-emerald-400" />
                  Voice Synthesis
                </span>
                <span className="font-mono text-emerald-300">Metallic Vocoder</span>
              </div>
            </div>

            <button
              onClick={onOpenDeepAnalysis}
              className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600/70 to-indigo-600/70 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold tracking-wide border border-cyan-400/40 shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              DEEP INTERNET ANALYSIS
            </button>
          </div>

          {/* SIGNATURE GLOWING TRANSLUCENT POINTER ARROW (Directly from reference image images__2__c2c6db3e.jpeg) */}
          <div className="pointer-events-none hidden lg:block absolute right-76 bottom-20 z-30 transition-transform animate-pulse duration-1000">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_15px_rgba(56,189,248,0.9)] opacity-90"
            >
              <path
                d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z"
                fill="rgba(255, 255, 255, 0.85)"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

      {/* Non-obstructing Floating Speech Subtitle (position at bottom, never blocks the 3D Orb) */}
      {(transcript || (response && state !== 'idle')) && (
        <div className="pointer-events-auto max-w-lg w-full mx-auto px-4 py-2.5 rounded-2xl backdrop-blur-2xl bg-slate-950/80 border border-cyan-400/30 text-center shadow-2xl mb-2 z-20">
          {transcript && (
            <p className="text-[11px] font-mono text-cyan-300 truncate mb-0.5">
              &ldquo;{transcript}&rdquo;
            </p>
          )}
          {response && (
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium line-clamp-3">
              {response}
            </p>
          )}
        </div>
      )}

      {/* 3. BOTTOM FLOATING ACTION CAPSULE DOCK (Directly matching the pill dock from images__2__c2c6db3e.jpeg) */}
      <div className="pointer-events-auto flex flex-col items-center gap-2.5 max-w-xl mx-auto w-full z-20">
        {/* Optional text input box expansion */}
        {showInputDock && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitInput();
            }}
            className="w-full flex items-center gap-2 p-2 rounded-2xl backdrop-blur-2xl bg-slate-900/85 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask JARVIS anything or type command (e.g. analyze quantum computing, call Pepper)..."
              className="flex-1 bg-transparent border-0 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        )}

        {/* Frosted Glass Pill Dock (Icons: ✨ Sparkles, ✏️ Edit, ⊞ Grid, 🔍 Search, ✈️ Send/Mic) */}
        <div className="flex items-center gap-2.5 sm:gap-4 px-6 py-3 rounded-full backdrop-blur-2xl bg-slate-900/55 border border-white/20 shadow-2xl">
          <button
            onClick={onOpenDeepAnalysis}
            className="p-2 text-slate-300 hover:text-cyan-300 hover:scale-110 transition-all cursor-pointer"
            title="Google Gemini Deep Internet Analysis"
          >
            <Sparkles size={20} className="text-cyan-400" />
          </button>

          <button
            onClick={() => setShowInputDock(!showInputDock)}
            className={`p-2 transition-all cursor-pointer ${
              showInputDock ? 'text-cyan-300 scale-110' : 'text-slate-300 hover:text-white hover:scale-110'
            }`}
            title="Type Command / Question Prompt"
          >
            <Edit3 size={20} />
          </button>

          <button
            onClick={onOpenApps}
            className="p-2 text-slate-300 hover:text-white hover:scale-110 transition-all cursor-pointer"
            title="Android & Web Apps Launcher"
          >
            <LayoutGrid size={20} />
          </button>

          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-300 hover:text-white hover:scale-110 transition-all cursor-pointer"
            title="Search Web"
          >
            <Search size={20} />
          </button>

          {/* Primary Floating Action Trigger (Send / Mic) */}
          <button
            onClick={onTriggerVoice}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-2xl transition-all cursor-pointer ${
              state === 'listening'
                ? 'bg-rose-600 scale-115 ring-4 ring-rose-400/50 animate-pulse'
                : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 hover:scale-108 ring-2 ring-white/30'
            }`}
            title="Trigger Voice Recognition (Microphone)"
          >
            <Send size={18} className="-rotate-45 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
