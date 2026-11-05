import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ParsedCommand } from '../types';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface SafetyConfirmModalProps {
  command: ParsedCommand | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafetyConfirmModal: React.FC<SafetyConfirmModalProps> = ({
  command,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const isPayment = command?.sensitiveActionType === 'payment';
  const isCall = command?.sensitiveActionType === 'phone_call';

  return (
    <HolographicModalWrapper
      isOpen={isOpen && Boolean(command)}
      onClose={onCancel}
      maxWidth="max-w-md"
      className="holo-panel rounded-2xl p-6 border-2 border-amber-500/60 shadow-2xl"
      accentColor="amber"
    >
        {/* Holographic Security Scanner Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 animate-pulse" />

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
              JARVIS PROTOCOL 4.0 // SAFETY GUARD
            </span>
            <h3 className="text-lg font-bold text-stone-100 font-sans">
              {isPayment ? 'Financial Security Notice' : isCall ? 'Voice Call Authorization' : 'Security Confirmation'}
            </h3>
          </div>
        </div>

        {/* Warning Body */}
        <div className="bg-stone-950/80 rounded-xl p-4 border border-stone-800 text-sm text-stone-300 space-y-3 mb-5">
          {isPayment && (
            <>
              <div className="flex items-start gap-2.5 text-amber-300">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <p className="font-semibold text-xs leading-relaxed">
                  JARVIS will NEVER automatically execute fund transfers, bypass biometric authentication, or ask for your UPI PIN.
                </p>
              </div>
              <p className="text-xs text-stone-400">
                You are about to launch <span className="text-amber-400 font-bold">{command.targetApp?.name}</span>.
                Please inspect recipient details and manually input your UPI PIN on the official banking screen only.
              </p>
            </>
          )}

          {isCall && (
            <>
              <p className="text-xs text-stone-300">
                JARVIS is preparing to open the phone dialer for:{' '}
                <span className="text-amber-400 font-bold font-mono">{command.query}</span>.
              </p>
              <p className="text-xs text-stone-400">
                Calls will never be initiated silently in the background. The native Android phone screen will open for your manual tap.
              </p>
            </>
          )}

          {!isPayment && !isCall && (
            <p className="text-xs text-stone-300">
              Please confirm execution of this sensitive Android action.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>ABORT</span>
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs font-mono transition-all gold-glow cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRM & OPEN</span>
          </button>
        </div>
    </HolographicModalWrapper>
  );
};
