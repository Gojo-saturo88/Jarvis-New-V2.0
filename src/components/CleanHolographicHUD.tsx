import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Search,
  Send,
  MessageSquare,
  Mail,
  Phone,
  Settings,
  Volume2,
  Hand,
  ChevronUp,
  ChevronDown,
  X,
  Compass,
  CreditCard,
  Camera,
  Calculator,
  Youtube,
  Music,
  MapPin,
  CheckCircle2,
  Globe2,
  Activity,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssistantState, ThemeMode, EmailItem, AppItem } from '../types';
import { gestureEngine, GestureEvent } from '../services/gestureEngine';
import { playSound } from '../services/soundEffects';

interface CleanHolographicHUDProps {
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
  transcript: string;
  response: string;
  inputText: string;
  setInputText: (text: string) => void;
  onSubmitInput: () => void;
  isAuthenticAudioPlaying: boolean;
  onToggleHudMode?: () => void;
}

export const CleanHolographicHUD: React.FC<CleanHolographicHUDProps> = ({
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
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isGestureModeActive, setIsGestureModeActive] = useState(false);
  const [lastDetectedGesture, setLastDetectedGesture] = useState<string | null>(null);
  const [showHelperPill, setShowHelperPill] = useState(true);

  // Subscribe to gesture engine for optical hand events
  useEffect(() => {
    const unsub = gestureEngine.subscribe((event: GestureEvent) => {
      if (event.source === 'optical') {
        let label = '';
        if (event.type === 'optical_wave') {
          label = '👋 HAND WAVE DETECTED';
          playSound('activate');
          onTriggerVoice();
        } else if (event.type === 'optical_swipe_left') {
          label = '👈 HAND SWIPE LEFT';
          playSound('tick');
        } else if (event.type === 'optical_swipe_right') {
          label = '👉 HAND SWIPE RIGHT';
          playSound('tick');
        } else if (event.type === 'optical_push_zoom_in') {
          label = '🔍 ZOOM IN GESTURE';
          playSound('tick');
        }

        if (label) {
          setLastDetectedGesture(label);
          setTimeout(() => setLastDetectedGesture(null), 1800);
        }
      }
    });

    return unsub;
  }, [onTriggerVoice]);

  // Handle optical gesture mode toggle
  const toggleGestureMode = async () => {
    playSound('pulse');
    if (isGestureModeActive) {
      gestureEngine.stopOpticalTracking();
      setIsGestureModeActive(false);
      setLastDetectedGesture(null);
    } else {
      const started = await gestureEngine.startOpticalTracking();
      if (started) {
        setIsGestureModeActive(true);
        setLastDetectedGesture('✋ OPTICAL HAND SENSOR ONLINE');
        setTimeout(() => setLastDetectedGesture(null), 2500);
      }
    }
  };

  // Cycle through the available themes
  const cycleTheme = () => {
    playSound('tick');
    const themes: ThemeMode[] = ['stark-gold', 'arc-reactor', 'cobalt-glass', 'obsidian'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    onThemeChange(themes[nextIdx]);
  };

  const getThemeBadge = () => {
    switch (theme) {
      case 'stark-gold':
        return { label: 'GOLD ORB', color: 'border-amber-400 text-amber-300 bg-amber-500/20' };
      case 'arc-reactor':
        return { label: 'ARC CYAN', color: 'border-cyan-400 text-cyan-300 bg-cyan-500/20' };
      case 'obsidian':
        return { label: 'STEALTH', color: 'border-slate-400 text-slate-300 bg-slate-700/30' };
      case 'cobalt-glass':
      default:
        return { label: 'COBALT', color: 'border-blue-400 text-blue-300 bg-blue-500/20' };
    }
  };

  const themeBadge = getThemeBadge();

  // Quick App Shortcuts for Drawer
  const QUICK_APPS = [
    { name: 'WhatsApp', cmd: 'WhatsApp kholo', icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { name: 'YouTube', cmd: 'YouTube kholo', icon: Youtube, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { name: 'Camera', cmd: 'Camera kholo', icon: Camera, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { name: 'Calculator', cmd: 'Calculator kholo', icon: Calculator, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { name: 'Maps', cmd: 'Google Maps kholo', icon: MapPin, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { name: 'Spotify', cmd: 'Spotify kholo', icon: Music, color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
    { name: 'Search', cmd: 'Google search', icon: Compass, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { name: 'Phone', cmd: 'Phone dialer kholo', icon: Phone, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-20 overflow-hidden font-sans select-none">
      {/* 1. TOP MINIMAL SCI-FI STATUS BAR (Ultra Clean & Mobile-Fit) */}
      <header className="pointer-events-auto flex items-center justify-between w-full backdrop-blur-xl bg-slate-950/45 border border-white/10 rounded-2xl px-3.5 py-2 shadow-2xl">
        {/* Left: Stark Beacon & Status */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full ${
                theme === 'stark-gold' ? 'bg-amber-400' : 'bg-cyan-400'
              } shadow-[0_0_12px_currentColor]`}
            />
            {state === 'listening' && (
              <span className="absolute w-5 h-5 rounded-full border border-emerald-400 animate-ping opacity-75" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-white font-mono">JARVIS 4.0</span>
              <span className="text-[9px] font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30">
                {state.toUpperCase()}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono hidden sm:block">
              Stark Quantum Holographic Assistant
            </p>
          </div>
        </div>

        {/* Right: Theme pill + Gesture Toggle + Authentic Audio + Settings */}
        <div className="flex items-center gap-1.5">
          {/* Reference Glass OS Toggle */}
          {onToggleHudMode && (
            <button
              onClick={onToggleHudMode}
              title="Switch to Reference Glass OS (User Reference UI)"
              className="px-2 py-1 text-[11px] font-mono font-bold rounded-xl border border-cyan-400/40 text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Compass size={12} />
              <span className="hidden xs:inline">GLASS UI</span>
            </button>
          )}

          {/* Theme Pill Button */}
          <button
            onClick={cycleTheme}
            title="Tap to switch theme mode"
            className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${themeBadge.color}`}
          >
            <Layers size={12} />
            <span>{themeBadge.label}</span>
          </button>

          {/* Gesture Control Toggle Button */}
          <button
            onClick={toggleGestureMode}
            title={isGestureModeActive ? 'Gesture control active - tap to disable' : 'Enable camera hand gesture control'}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
              isGestureModeActive
                ? 'bg-emerald-500 border-emerald-300 text-stone-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.7)] animate-pulse'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Hand size={13} className={isGestureModeActive ? 'text-stone-950' : 'text-slate-400'} />
            <span className="hidden sm:inline font-bold">GESTURE</span>
          </button>

          {/* Authentic Reference Voice Playback */}
          <button
            onClick={onPlayReferenceVoice}
            title="Play authentic recorded reference voice MP3"
            className={`px-2 py-1 text-[11px] font-mono rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
              isAuthenticAudioPlaying
                ? 'bg-amber-500 border-amber-300 text-stone-950 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Volume2 size={13} className={isAuthenticAudioPlaying ? 'text-stone-950 animate-bounce' : 'text-amber-400'} />
            <span className="hidden md:inline font-bold">VOICE MP3</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* 2. GESTURE FEEDBACK & INTERACTION HELPER (Subtle & Non-Intrusive) */}
      <div className="flex flex-col items-center gap-2 pointer-events-none mt-2">
        {/* Optical Sensor HUD Banner when active */}
        {isGestureModeActive && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 backdrop-blur-md shadow-lg animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>OPTICAL SENSOR ACTIVE: WAVE HAND TO SPEAK • SWIPE TO SPIN ORB</span>
          </div>
        )}

        {/* Real-time Gesture notification badge */}
        <AnimatePresence>
          {lastDetectedGesture && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.92 }}
              className="pointer-events-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 font-bold text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.7)]"
            >
              {lastDetectedGesture}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper Pill: Teaches user gestures, auto-dismissible */}
        {showHelperPill && !lastDetectedGesture && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/40 border border-white/10 text-[10px] font-mono text-slate-400 backdrop-blur-md">
            <span>✦ Drag to rotate • Pinch to zoom • Tap orb to speak</span>
            <button
              onClick={() => setShowHelperPill(false)}
              className="hover:text-white transition-colors"
              title="Dismiss"
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>

      {/* 3. DYNAMIC SPEECH & RESPONSE FLOATING GLASS SUBTITLE (Appears when speaking) */}
      <div className="flex flex-col items-center justify-center my-auto px-4 pointer-events-none">
        {(transcript || (response && state !== 'idle')) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full backdrop-blur-2xl bg-slate-950/70 border border-white/15 rounded-2xl p-3.5 shadow-2xl text-center space-y-1.5 pointer-events-auto"
          >
            {transcript && (
              <p className="text-xs font-mono text-cyan-300 truncate">
                &ldquo;{transcript}&rdquo;
              </p>
            )}
            {response && (
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                {response}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* 4. BOTTOM FLOATING CONTROLS (Clean, Floating & Ergonomic) */}
      <footer className="pointer-events-auto flex flex-col items-center gap-3 w-full">
        {/* Quick Text Input Pill (Expandable) */}
        <AnimatePresence>
          {isInputOpen && (
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitInput();
                setIsInputOpen(false);
              }}
              className="w-full max-w-md flex items-center gap-2 p-1.5 rounded-2xl backdrop-blur-2xl bg-slate-950/80 border border-white/20 shadow-2xl"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type command (e.g. 'YouTube kholo', 'Analyze AI')..."
                className="flex-1 px-3 py-1.5 bg-transparent text-xs text-white placeholder-slate-400 outline-none font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold hover:scale-105 transition-transform"
              >
                <Send size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsInputOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Floating Capsule Bar */}
        <div className="flex items-center gap-3 backdrop-blur-2xl bg-slate-950/50 border border-white/10 rounded-full px-4 py-2 shadow-2xl">
          {/* Quick Input Toggle */}
          <button
            onClick={() => setIsInputOpen((prev) => !prev)}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              isInputOpen ? 'bg-amber-500 text-stone-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Type a command"
          >
            <Search size={18} />
          </button>

          {/* Central Hero Arc-Reactor Voice Microphone Button */}
          <button
            onClick={onTriggerVoice}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              state === 'listening'
                ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-stone-950 shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-110'
                : theme === 'stark-gold'
                ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105'
                : 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-105'
            }`}
            title={state === 'listening' ? 'Listening... Tap to stop' : 'Tap to speak to JARVIS'}
          >
            {/* Spinning Arc Reactor Reticle Ring */}
            <span className="absolute inset-[-4px] rounded-full border border-dashed border-white/40 animate-[spin_8s_linear_infinite] pointer-events-none" />
            {state === 'listening' ? (
              <MicOff size={24} className="animate-pulse" />
            ) : (
              <Mic size={24} />
            )}
          </button>

          {/* Quick Actions Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            className={`p-2.5 rounded-full transition-all cursor-pointer relative ${
              isDrawerOpen ? 'bg-amber-500 text-stone-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Open Stark Quick Actions & Intelligence Drawer"
          >
            <ChevronUp size={18} className={isDrawerOpen ? 'rotate-180 transition-transform' : ''} />
            {unreadEmailCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 border border-slate-900 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadEmailCount}
              </span>
            )}
          </button>
        </div>
      </footer>

      {/* 5. SLIDE-UP INTELLIGENCE & APP DRAWER (Clean Bottom Sheet) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="pointer-events-auto fixed inset-x-0 bottom-0 max-h-[75vh] backdrop-blur-3xl bg-slate-950/92 border-t border-white/15 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] p-4 sm:p-6 z-40 flex flex-col font-sans overflow-hidden"
          >
            {/* Drawer Header with Drag Handle */}
            <div className="flex flex-col items-center pb-3 border-b border-white/10">
              <div className="w-10 h-1 rounded-full bg-white/20 mb-3 cursor-pointer" onClick={() => setIsDrawerOpen(false)} />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <h3 className="text-xs font-bold text-white font-mono tracking-widest">
                    STARK INTELLIGENCE & APPLICATION MATRIX
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="overflow-y-auto py-4 space-y-4 text-xs">
              {/* Quick Launch App Icons Grid */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider mb-2.5 block">
                  INSTANT APP LAUNCHERS
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {QUICK_APPS.map((app) => {
                    const IconComp = app.icon;
                    return (
                      <button
                        key={app.name}
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onExecuteCommand(app.cmd);
                        }}
                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/40 transition-all cursor-pointer group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 border ${app.color} group-hover:scale-105 transition-transform`}>
                          <IconComp size={18} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">
                          {app.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stark Communication & Intelligence Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Email Transmissions Card */}
                <div
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenEmails();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">Quantum Email Relay</span>
                        {unreadEmailCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                            {unreadEmailCount} NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {latestEmail ? `${latestEmail.sender}: ${latestEmail.subject}` : 'No unread messages'}
                      </p>
                    </div>
                  </div>
                  <ChevronUp size={16} className="text-slate-400 rotate-90" />
                </div>

                {/* Deep Internet Analysis Card */}
                <div
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenDeepAnalysis();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                      <Globe2 size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-white">Global Internet Analysis</span>
                      <p className="text-[11px] text-slate-400">Scan & synthesize multi-node web intelligence</p>
                    </div>
                  </div>
                  <ChevronUp size={16} className="text-slate-400 rotate-90" />
                </div>
              </div>

              {/* View All Installed Apps & Android APK Guide */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenApps();
                  }}
                  className="text-xs text-amber-400 hover:underline font-mono cursor-pointer"
                >
                  &rarr; VIEW ALL INSTALLED APPS (50+)
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenDiagnostics();
                  }}
                  className="text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
                >
                  DIAGNOSTICS & STATUS REPORT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
