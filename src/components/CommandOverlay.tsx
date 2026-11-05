import { Terminal, X, Play, Clock, Sparkles } from 'lucide-react';
import { LogMessage } from '../types';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface CommandOverlayProps {
  isOpen: boolean;
  logs: LogMessage[];
  onClose: () => void;
  onExecuteSample: (cmd: string) => void;
  onClearLogs: () => void;
}

const SAMPLE_COMMANDS = [
  { text: 'East wing power fluctuation', category: 'Authentic Audio', lang: 'English' },
  { text: 'YouTube kholo', category: 'App Launch', lang: 'Hinglish' },
  { text: 'PhonePe kholo', category: 'Finance', lang: 'Hinglish' },
  { text: 'WhatsApp open karo', category: 'Messaging', lang: 'Hinglish' },
  { text: 'Camera open karo', category: 'Media HUD', lang: 'Hinglish' },
  { text: 'Calculator open karo', category: 'Tools', lang: 'Hinglish' },
  { text: 'YouTube par Arijit Singh ke gaane search karo', category: 'YouTube Search', lang: 'Hinglish' },
  { text: 'Google par quantum computers search karo', category: 'Web Search', lang: 'Hinglish' },
  { text: 'Meri installed apps dikhao', category: 'Device Registry', lang: 'Hindi' },
  { text: 'Hindi mein jawab do', category: 'Language Switch', lang: 'Hindi' },
  { text: 'What time is it?', category: 'System Info', lang: 'English' },
  { text: 'System status report', category: 'Diagnostics', lang: 'English' },
  { text: 'Stop listening', category: 'Standby', lang: 'English' },
];

export const CommandOverlay: React.FC<CommandOverlayProps> = ({
  isOpen,
  logs,
  onClose,
  onExecuteSample,
  onClearLogs,
}) => {
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
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
              NATURAL LANGUAGE COMMAND ENGINE // DIAGNOSTICS
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Quick Command Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-stone-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>TAP TO SIMULATE VOICE COMMANDS</span>
              </span>
              <span className="text-[10px] font-mono text-stone-500">NO AI API KEY REQUIRED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_COMMANDS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onExecuteSample(sample.text)}
                  className="p-2.5 rounded-xl bg-stone-950/80 hover:bg-amber-500/15 border border-stone-800 hover:border-amber-500/40 text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-stone-200 text-xs group-hover:text-amber-300 font-sans">
                      "{sample.text}"
                    </div>
                    <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                      {sample.category} • {sample.lang}
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Activity / Session Logs */}
          <div className="space-y-2 pt-3 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <span className="font-mono text-stone-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>SESSION AUDIT LOG</span>
              </span>
              {logs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-[10px] font-mono text-stone-500 hover:text-red-400 cursor-pointer"
                >
                  CLEAR LOG
                </button>
              )}
            </div>

            <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 max-h-48 overflow-y-auto space-y-2 font-mono text-[11px]">
              {logs.length === 0 ? (
                <div className="text-stone-600 text-center py-4">
                  No commands executed in current session.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 border-b border-stone-900 pb-1.5 last:border-none">
                    <span className="text-stone-500 text-[10px] shrink-0 mt-0.5">
                      {log.timestamp}
                    </span>
                    <span
                      className={`px-1 rounded text-[9px] uppercase font-bold shrink-0 ${
                        log.sender === 'user'
                          ? 'bg-amber-500/20 text-amber-300'
                          : log.sender === 'jarvis'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {log.sender}
                    </span>
                    <span className="text-stone-300 font-sans text-xs">
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </HolographicModalWrapper>
  );
};
