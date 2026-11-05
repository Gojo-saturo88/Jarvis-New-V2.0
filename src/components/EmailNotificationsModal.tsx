import React, { useState } from 'react';
import { Mail, Check, Trash2, Volume2, ShieldAlert, User, Send, X } from 'lucide-react';
import { EmailItem } from '../types';
import { emailService } from '../services/emailService';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface EmailNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadEmailAloud: (email: EmailItem) => void;
}

export const EmailNotificationsModal: React.FC<EmailNotificationsModalProps> = ({
  isOpen,
  onClose,
  onReadEmailAloud,
}) => {
  const [emails, setEmails] = useState<EmailItem[]>(() => emailService.getEmails());
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);

  const handleSelectEmail = (email: EmailItem) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      const updated = emailService.markAsRead(email.id);
      setEmails(updated);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setReplySent(true);
    setTimeout(() => {
      setReplyText('');
      setReplySent(false);
    }, 2000);
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      maxHeight="h-[85vh]"
      className="flex flex-col rounded-3xl bg-slate-900/85 border border-white/20 shadow-2xl font-sans"
      accentColor="cyan"
    >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">STARK COMMUNICATIONS RELAY</h2>
              <p className="text-xs text-slate-400 font-mono">Encrypted Quantum Email & Intelligence Feeds</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const list = emails.map((e) => ({ ...e, isRead: true }));
                emailService.saveEmails(list);
                setEmails(list);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Check size={14} className="text-emerald-400" />
              Mark All Read
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content body split into list & detail view */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Email list */}
          <div className="w-full md:w-80 border-r border-white/10 overflow-y-auto p-3 space-y-2">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                  selectedEmail?.id === email.id
                    ? 'bg-cyan-500/15 border-cyan-400/40 shadow-lg'
                    : email.isRead
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'
                    : 'bg-blue-600/15 border-blue-400/30 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-200 truncate">{email.sender}</span>
                  <span className="text-[10px] font-mono text-slate-400">{email.timestamp}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate mb-1">{email.subject}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{email.preview}</div>

                <div className="flex items-center gap-2 mt-2">
                  {email.priority === 'urgent' && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/40 text-rose-300">
                      URGENT
                    </span>
                  )}
                  {email.priority === 'high' && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300">
                      HIGH
                    </span>
                  )}
                  {!email.isRead && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Email detailed preview */}
          <div className="flex-1 flex flex-col justify-between p-5 overflow-y-auto bg-slate-950/40">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{selectedEmail.subject}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-cyan-300 font-semibold">{selectedEmail.sender}</span>
                      <span>&lt;{selectedEmail.senderEmail}&gt;</span>
                      <span>•</span>
                      <span>{selectedEmail.timestamp}</span>
                    </div>
                  </div>

                  {/* Read Aloud with Jarvis Voice */}
                  <button
                    onClick={() => onReadEmailAloud(selectedEmail)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold shadow-md transition-all hover:scale-105"
                  >
                    <Volume2 size={16} className="text-cyan-400" />
                    Read with JARVIS
                  </button>
                </div>

                {/* Email message body */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.preview}
                </div>

                {/* Reply section */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Quick Response Protocol</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${selectedEmail.sender}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={handleSendReply}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                    >
                      <Send size={14} />
                      Transmit
                    </button>
                  </div>
                  {replySent && (
                    <p className="text-xs text-emerald-400 font-mono">Transmission sent securely via Stark Relay.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Mail size={48} className="text-slate-600 mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">Select an email to view encrypted contents</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  You can say &quot;Check email&quot; or &quot;Read notifications&quot; at any time to have JARVIS speak unread summaries.
                </p>
              </div>
            )}
          </div>
        </div>
    </HolographicModalWrapper>
  );
};
