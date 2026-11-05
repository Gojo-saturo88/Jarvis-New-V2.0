import React, { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle2, Smartphone, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { AppItem } from '../types';
import { HolographicModalWrapper } from './HolographicModalWrapper';
import { playSound } from '../services/soundEffects';

interface AppLaunchModalProps {
  app: AppItem | null;
  isOpen: boolean;
  onClose: () => void;
  isNativeCompanion: boolean;
}

export const AppLaunchModal: React.FC<AppLaunchModalProps> = ({
  app,
  isOpen,
  onClose,
  isNativeCompanion,
}) => {
  const [countdown, setCountdown] = useState(2);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!isOpen || !app) {
      setCountdown(2);
      setHasTriggered(false);
      return;
    }

    playSound('activate');
    setCountdown(2);
    setHasTriggered(false);

    // Auto-launch trigger
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeLaunch(app);
          return 0;
        }
        return prev - 1;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [isOpen, app]);

  const executeLaunch = (targetApp: AppItem) => {
    setHasTriggered(true);
    playSound('success');

    // 1. If inside Android Native Bridge
    if (window.JarvisAndroidBridge?.launchApp) {
      window.JarvisAndroidBridge.launchApp(targetApp.packageName);
      return;
    }

    // 2. Deep-link on mobile devices
    if (targetApp.deepLink && !targetApp.deepLink.startsWith('intent:')) {
      try {
        window.location.href = targetApp.deepLink;
      } catch (e) {
        console.warn('Deep link redirection failed:', e);
      }
    }

    // 3. Web fallback URL
    if (targetApp.webFallbackUrl && !targetApp.webFallbackUrl.startsWith('#inapp_')) {
      try {
        window.open(targetApp.webFallbackUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Popup blocked, fallback available:', e);
      }
    }
  };

  if (!app) return null;

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      className="holo-panel rounded-3xl p-6 border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.35)] bg-stone-950/95"
      accentColor="amber"
    >
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Smartphone size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 font-mono tracking-wider">
              JARVIS APP LAUNCH PROTOCOL
            </h3>
            <p className="text-[10px] text-amber-400 font-mono">
              {isNativeCompanion ? 'Native Android Companion Bridge' : 'Direct Deep-Link & Web Intent'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Target App Card */}
      <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-stone-900/80 border border-amber-500/30 mb-5 relative overflow-hidden">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 p-[3px] shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-stone-950 flex items-center justify-center">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {app.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-stone-950 flex items-center justify-center text-[10px] text-stone-950 font-bold">
            ✓
          </span>
        </div>

        <h2 className="text-xl font-bold text-white mb-0.5">{app.name}</h2>
        {app.hindiName && (
          <p className="text-xs text-amber-400/90 font-mono mb-2 font-semibold">
            {app.hindiName}
          </p>
        )}
        <p className="text-[11px] font-mono text-stone-400 px-3 py-1 rounded-full bg-stone-950 border border-stone-800 mb-3 truncate max-w-xs">
          {app.packageName}
        </p>

        {/* Countdown status */}
        <div className="text-xs font-mono text-amber-300 flex items-center gap-2">
          {countdown > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Opening on your device in {countdown}s...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Launch Intent Transmitted!</span>
            </>
          )}
        </div>
      </div>

      {/* Direct Interactive Action Button */}
      <div className="space-y-2.5">
        <button
          onClick={() => executeLaunch(app)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm font-mono shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <span>OPEN {app.name.toUpperCase()} NOW</span>
          <ArrowRight size={16} />
        </button>

        {app.webFallbackUrl && !app.webFallbackUrl.startsWith('#') && (
          <a
            href={app.webFallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onClose()}
            className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors block text-center"
          >
            <ExternalLink size={13} />
            <span>Open in Browser Window ({app.name})</span>
          </a>
        )}
      </div>
    </HolographicModalWrapper>
  );
};
