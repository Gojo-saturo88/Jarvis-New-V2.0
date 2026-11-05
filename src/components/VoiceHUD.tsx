import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, RefreshCw, Globe, Power } from 'lucide-react';
import { AssistantState, SupportedLanguage } from '../types';

interface VoiceHUDProps {
  state: AssistantState;
  isListening: boolean;
  isContinuous: boolean;
  autoSpeak: boolean;
  language: SupportedLanguage;
  transcript: string;
  response: string;
  onToggleListen: () => void;
  onToggleContinuous: () => void;
  onToggleAutoSpeak: () => void;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onStop: () => void;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({
  state,
  isListening,
  isContinuous,
  autoSpeak,
  language,
  transcript,
  response,
  onToggleListen,
  onToggleContinuous,
  onToggleAutoSpeak,
  onChangeLanguage,
  onStop,
}) => {
  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return { text: 'LISTENING...', color: 'text-amber-400', border: 'border-amber-400' };
      case 'thinking':
        return { text: 'PROCESSING COMMAND...', color: 'text-amber-300', border: 'border-amber-300' };
      case 'speaking':
        return { text: 'SPEAKING...', color: 'text-orange-400', border: 'border-orange-400' };
      case 'executing':
        return { text: 'EXECUTING INTENT...', color: 'text-cyan-400', border: 'border-cyan-400' };
      case 'idle':
      default:
        return { text: 'JARVIS 4.0 ONLINE', color: 'text-amber-500/80', border: 'border-amber-500/30' };
    }
  };

  const status = getStatusText();

  return (
    <div className="flex flex-col items-center pointer-events-auto">
      {/* Real-time Subtitles / Speech Bubble */}
      {(transcript || response) && (
        <div className="mb-4 max-w-lg w-full px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="holo-panel p-3.5 rounded-lg border border-amber-500/30 shadow-xl backdrop-blur-md">
            {transcript && (
              <div className="text-xs text-amber-300/80 mb-1 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span>USER:</span>
                <span className="text-stone-200 font-sans text-sm italic font-medium">"{transcript}"</span>
              </div>
            )}
            {response && (
              <div className="text-xs text-orange-400/90 mt-1 flex items-start gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block mt-1 shrink-0" />
                <div>
                  <span className="font-bold tracking-wider">JARVIS: </span>
                  <span className="text-amber-100 font-sans text-sm font-semibold">{response}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Futuristic Center Mic Trigger */}
      <div className="relative flex items-center justify-center">
        {/* Animated Hologram Sound Wave Ring */}
        {isListening && (
          <>
            <div className="absolute w-24 h-24 rounded-full border border-amber-400/40 animate-ping pointer-events-none" />
            <div className="absolute w-32 h-32 rounded-full border border-amber-500/20 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          onClick={onToggleListen}
          title={isListening ? 'Stop Listening' : 'Tap to Speak'}
          className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isListening
              ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-stone-950 gold-glow-intense scale-105'
              : 'bg-stone-950/90 holo-border text-amber-400 hover:text-amber-300 hover:border-amber-400 hover:scale-105 gold-glow'
          }`}
        >
          {isListening ? (
            <Mic className="w-8 h-8 sm:w-9 sm:h-9 animate-pulse" />
          ) : (
            <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
          )}
        </button>
      </div>

      {/* Status Bar */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded text-xs font-mono tracking-widest uppercase border bg-black/60 backdrop-blur-sm ${status.color} ${status.border}`}
        >
          {status.text}
        </span>

        {isListening && (
          <button
            onClick={onStop}
            title="Interrupt / Stop"
            className="p-1.5 rounded bg-stone-900/90 text-stone-400 hover:text-red-400 border border-stone-800 hover:border-red-500/50 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Auxiliary Voice Controls */}
      <div className="mt-3 flex items-center gap-2 flex-wrap justify-center text-xs">
        {/* Language selector toggle */}
        <div className="flex items-center bg-stone-950/80 rounded border border-amber-500/30 p-0.5">
          <button
            onClick={() => onChangeLanguage('auto')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
              language === 'auto' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            AUTO / HINGLISH
          </button>
          <button
            onClick={() => onChangeLanguage('hi-IN')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
              language === 'hi-IN' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            हिन्दी (HI)
          </button>
          <button
            onClick={() => onChangeLanguage('en-IN')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
              language === 'en-IN' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            EN-IN
          </button>
        </div>

        {/* Continuous conversation mode */}
        <button
          onClick={onToggleContinuous}
          title="Toggle Continuous Conversation Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
            isContinuous
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
              : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${isContinuous ? 'animate-spin' : ''}`} />
          <span>{isContinuous ? 'CONTINUOUS ON' : 'PULL TO TALK'}</span>
        </button>

        {/* Voice response toggle */}
        <button
          onClick={onToggleAutoSpeak}
          title="Toggle Assistant Voice Output"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
            autoSpeak
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-stone-950/80 border-stone-800 text-stone-500'
          }`}
        >
          {autoSpeak ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          <span>{autoSpeak ? 'VOICE ON' : 'MUTED'}</span>
        </button>
      </div>
    </div>
  );
};
