import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, Delete, X, ExternalLink } from 'lucide-react';
import { CallSession } from '../types';
import { playSound } from '../services/soundEffects';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface PhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomingCallTarget?: { name: string; number: string };
  onCallInitiated?: (name: string, number: string) => void;
}

const STARK_CONTACTS = [
  { name: 'Pepper Potts', number: '+1-212-555-0199', role: 'CEO Stark Industries' },
  { name: 'Col. James Rhodes', number: '+1-202-555-0145', role: 'War Machine / USAF' },
  { name: 'Tony Stark', number: '+1-212-555-0100', role: 'Stark Lab Private' },
  { name: 'Happy Hogan', number: '+1-212-555-0177', role: 'Head of Security' },
  { name: 'Dr. Bruce Banner', number: '+1-617-555-0182', role: 'Gamma Subsystems' },
  { name: 'Emergency 911', number: '911', role: 'Emergency Dispatch' },
];

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  isOpen,
  onClose,
  incomingCallTarget,
  onCallInitiated,
}) => {
  const [dialNumber, setDialNumber] = useState('');
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // If passed an incoming call target (e.g. from voice command "Call Pepper")
  useEffect(() => {
    if (incomingCallTarget) {
      startCall(incomingCallTarget.name, incomingCallTarget.number);
    }
  }, [incomingCallTarget]);

  // Call duration timer
  useEffect(() => {
    let interval: number;
    if (activeCall && activeCall.status === 'active') {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  if (!isOpen) return null;

  const startCall = (name: string, number: string) => {
    playSound('activate');
    setActiveCall({
      recipientName: name,
      recipientNumber: number,
      status: 'connecting',
      durationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
    });
    setCallDuration(0);
    onCallInitiated?.(name, number);

    // Transition from connecting to active
    setTimeout(() => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'active' } : null));
    }, 1800);
  };

  const endCall = () => {
    playSound('tick');
    if (activeCall) {
      setActiveCall((prev) => (prev ? { ...prev, status: 'ended' } : null));
      setTimeout(() => {
        setActiveCall(null);
        setCallDuration(0);
      }, 1200);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (num: string) => {
    playSound('tick');
    setDialNumber((prev) => prev + num);
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      maxHeight="max-h-[92vh]"
      className="rounded-3xl bg-slate-900/90 border border-white/20 shadow-2xl font-sans"
      accentColor="cyan"
    >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Phone size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">STARK QUANTUM COMM-LINK</h2>
              <p className="text-[10px] text-slate-400 font-mono">Real Cellular & Secure Audio Channel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY: Either Active Call HUD or Dialer Interface */}
        {activeCall ? (
          <div className="p-6 flex flex-col items-center justify-between min-h-[380px] bg-gradient-to-b from-slate-900/90 to-slate-950">
            {/* Contact avatar and status */}
            <div className="flex flex-col items-center mt-4">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[3px] shadow-[0_0_25px_rgba(6,182,212,0.4)] mb-4">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <User size={40} className="text-cyan-300" />
                </div>
                {activeCall.status === 'active' && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-0.5">{activeCall.recipientName}</h3>
              <p className="text-xs font-mono text-cyan-400 mb-2">{activeCall.recipientNumber}</p>

              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                {activeCall.status === 'connecting'
                  ? 'Connecting Quantum Satellite Relay...'
                  : activeCall.status === 'ended'
                  ? 'Call Disconnected'
                  : formatDuration(callDuration)}
              </div>
            </div>

            {/* Audio Wave Visualizer during active call */}
            {activeCall.status === 'active' && (
              <div className="flex items-center gap-1.5 my-6 h-10">
                {[...Array(16)].map((_, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.max(8, Math.sin(i * 0.8 + callDuration * 3) * 32 + 10)}px`,
                      animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* In-Call controls */}
            <div className="w-full flex items-center justify-center gap-6 mt-4">
              <button
                onClick={() =>
                  setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null))
                }
                className={`p-4 rounded-full border transition-all ${
                  activeCall.isMuted
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
                }`}
                title={activeCall.isMuted ? 'Unmute' : 'Mute'}
              >
                {activeCall.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 transition-all"
                title="End Call"
              >
                <PhoneOff size={26} />
              </button>

              <button
                onClick={() =>
                  setActiveCall((prev) => (prev ? { ...prev, isSpeaker: !prev.isSpeaker } : null))
                }
                className={`p-4 rounded-full border transition-all ${
                  activeCall.isSpeaker
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
                }`}
                title="Speakerphone"
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Direct Mobile Cellular Call Trigger */}
            <a
              href={`tel:${activeCall.recipientNumber}`}
              className="mt-4 text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 opacity-80 hover:opacity-100"
            >
              Open in Native Android Phone App <ExternalLink size={12} />
            </a>
          </div>
        ) : (
          <div className="p-4 flex flex-col space-y-4">
            {/* Dialpad display */}
            <div className="relative w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <input
                type="text"
                readOnly
                value={dialNumber}
                placeholder="Enter frequency or number..."
                className="bg-transparent text-xl font-mono text-white tracking-widest focus:outline-none w-full"
              />
              {dialNumber && (
                <button
                  onClick={() => setDialNumber((prev) => prev.slice(0, -1))}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Delete size={18} />
                </button>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2 px-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className="h-12 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-mono text-lg font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Call action button & Direct Link */}
            <div className="flex items-center gap-2 pt-1 px-3">
              <button
                disabled={!dialNumber}
                onClick={() => startCall(`Relay ${dialNumber}`, dialNumber)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${
                  dialNumber
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Phone size={18} />
                INITIALIZE CALL
              </button>

              {dialNumber && (
                <a
                  href={`tel:${dialNumber}`}
                  className="p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all"
                  title="Launch Phone App on Android"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>

            {/* Quick Stark Contacts */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 px-1">
                Frequent Stark Contacts
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {STARK_CONTACTS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => startCall(c.name, c.number)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-400/30 text-left transition-all"
                  >
                    <div className="text-xs font-bold text-slate-200 truncate">{c.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">{c.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
    </HolographicModalWrapper>
  );
};
