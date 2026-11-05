import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  X,
  Key,
  Cpu,
  Volume2,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { aiService, AI_PROVIDERS } from '../services/aiService';
import { speechService } from '../services/speechService';
import { AISettings, VoiceSettings, SupportedLanguage } from '../types';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onChangeLanguage,
}) => {
  const [aiSettings, setAiSettings] = useState<AISettings>(() => aiService.getSettings());
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => speechService.getVoiceSettings());
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAiSettings(aiService.getSettings());
      setVoiceSettings(speechService.getVoiceSettings());
      setAvailableVoices(speechService.getAvailableVoices());
    }
  }, [isOpen]);

  const currentProviderConfig = AI_PROVIDERS.find((p) => p.id === aiSettings.provider);

  const handleSaveAISettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    aiService.saveSettings(newSettings);
  };

  const handleSaveVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    const updated = { ...voiceSettings, ...newSettings };
    setVoiceSettings(updated);
    speechService.updateVoiceSettings(updated);
  };

  const handleTestAIConnection = async () => {
    if (aiSettings.provider === 'none') {
      setTestStatus('Local command engine active (100% Free / Zero API keys needed).');
      return;
    }
    if (aiSettings.provider !== 'gemini' && !aiSettings.apiKey.trim()) {
      setTestStatus('Error: Please enter an API key for ' + aiSettings.provider);
      return;
    }

    setIsTesting(true);
    setTestStatus('Connecting to neural provider...');
    try {
      const response = await aiService.generateChatResponse('Status diagnostic check. Reply in 10 words.');
      setTestStatus(`Success! Response: "${response.text}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestStatus(`Connection note: ${msg}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleVoicePreview = () => {
    speechService.speak(
      language === 'hi-IN'
        ? 'जार्विस 4.0 प्रणाली सक्रिय है। आपके आदेश की प्रतीक्षा है।'
        : 'JARVIS 4.0 systems online and fully operational, Sir.'
    );
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[90vh]"
      className="holo-panel rounded-2xl flex flex-col border border-amber-500/40 shadow-2xl"
      accentColor="amber"
    >
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
              SYSTEM CONFIGURATION // SETTINGS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Voice & Speech Engine (100% Free) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-stone-800">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold font-mono text-stone-200 uppercase tracking-wide">
                Voice Personality & Audio Synthesis (Free On-Device TTS)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pitch Slider */}
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 space-y-1.5">
                <div className="flex justify-between font-mono text-stone-300">
                  <span>VOICE PITCH</span>
                  <span className="text-amber-400 font-bold">{voiceSettings.pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={voiceSettings.pitch}
                  onChange={(e) => handleSaveVoiceSettings({ pitch: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-stone-500 block">
                  Lower pitch yields deeper, more authoritative tone.
                </span>
              </div>

              {/* Rate Slider */}
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 space-y-1.5">
                <div className="flex justify-between font-mono text-stone-300">
                  <span>SPEECH RATE</span>
                  <span className="text-amber-400 font-bold">{voiceSettings.rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.35"
                  step="0.05"
                  value={voiceSettings.rate}
                  onChange={(e) => handleSaveVoiceSettings({ rate: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-stone-500 block">
                  Paced delivery for natural cadence.
                </span>
              </div>
            </div>

            {/* Synthesized Robotic Metallic Filter Effect (Web Audio API Vocoder) */}
            <div className="bg-stone-950/70 p-3.5 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold font-mono text-stone-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>CINEMATIC METALLIC ROBOTIC FILTER (WEB AUDIO API)</span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Injects real-time sub-harmonic helmet resonance and metallic ring modulation for the movie JARVIS tone.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveVoiceSettings({ roboticFilter: !voiceSettings.roboticFilter })}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                    voiceSettings.roboticFilter
                      ? 'bg-amber-500 text-stone-950 gold-glow'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {voiceSettings.roboticFilter ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {voiceSettings.roboticFilter && (
                <div className="space-y-1.5 pt-2 border-t border-stone-800">
                  <div className="flex justify-between font-mono text-[11px] text-stone-300">
                    <span>METALLIC RESONANCE INTENSITY</span>
                    <span className="text-amber-400 font-bold">
                      {Math.round((voiceSettings.roboticIntensity ?? 0.85) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={voiceSettings.roboticIntensity ?? 0.85}
                    onChange={(e) => handleSaveVoiceSettings({ roboticIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-stone-500">
                    <span>Subtle Intercom</span>
                    <span>Cinematic JARVIS (Recommended)</span>
                    <span>Heavy Vocoder</span>
                  </div>
                </div>
              )}
            </div>

            {/* Test Voice Button */}
            <div className="flex items-center justify-between">
              <span className="text-stone-400">
                Active language: <strong className="text-amber-400 uppercase">{language}</strong>
              </span>
              <button
                onClick={handleVoicePreview}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500/20 text-amber-300 border border-stone-700 hover:border-amber-400 font-mono transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>PREVIEW VOICE</span>
              </button>
            </div>
          </div>

          {/* Section 2: Optional AI Chatbot (User Provides API Key) */}
          <div className="space-y-4 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold font-mono text-stone-200 uppercase tracking-wide">
                  Optional AI Chatbot (User-Provided API Key)
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                LOCAL COMMANDS ALWAYS WORK 100% FREE
              </span>
            </div>

            {/* AI Warning / Safety Note */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2 text-stone-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                JARVIS performs all device actions, app launches, YouTube controls, and time/date commands <strong>locally without any AI API key</strong>.
                If you wish to ask open-ended questions, you can optionally provide your personal API key below. Keys are stored strictly on your device.
              </p>
            </div>

            {/* Provider Selector */}
            <div className="space-y-1.5">
              <label className="font-mono text-stone-300 font-bold">SELECT AI PROVIDER</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      const updated: AISettings = {
                        ...aiSettings,
                        provider: provider.id as AISettings['provider'],
                        isEnabled: provider.id !== 'none',
                        model: provider.defaultModel,
                      };
                      handleSaveAISettings(updated);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      aiSettings.provider === provider.id
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300 gold-glow'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-stone-100 flex items-center justify-between">
                      <span>{provider.name}</span>
                      {aiSettings.provider === provider.id && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                      {provider.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input if provider requires key */}
            {currentProviderConfig && 'requiresKey' in currentProviderConfig && currentProviderConfig.requiresKey && (
              <div className="space-y-3 bg-stone-950/70 p-4 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-stone-300 flex items-center gap-1.5 font-bold">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentProviderConfig.name} API KEY</span>
                  </label>
                  {currentProviderConfig.keyDocsUrl && (
                    <a
                      href={currentProviderConfig.keyDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>GET API KEY</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <input
                  type="password"
                  value={aiSettings.apiKey}
                  onChange={(e) =>
                    handleSaveAISettings({ ...aiSettings, apiKey: e.target.value })
                  }
                  placeholder={`Enter your ${currentProviderConfig.name} API key...`}
                  className="w-full bg-stone-900 text-stone-100 px-3 py-2 rounded-xl border border-stone-700 focus:border-amber-400 focus:outline-none font-mono text-xs"
                />

                {/* Model Selector */}
                <div className="space-y-1">
                  <label className="font-mono text-stone-400 text-[10px]">SELECT MODEL</label>
                  <select
                    value={aiSettings.model}
                    onChange={(e) =>
                      handleSaveAISettings({ ...aiSettings, model: e.target.value })
                    }
                    className="w-full bg-stone-900 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 text-xs font-mono"
                  >
                    {currentProviderConfig.models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Test Connection Button */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleTestAIConnection}
                    disabled={isTesting}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold font-mono text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? 'VERIFYING...' : 'TEST CONNECTION'}
                  </button>

                  {testStatus && (
                    <span
                      className={`text-[11px] font-mono truncate max-w-[260px] ${
                        testStatus.startsWith('Success')
                          ? 'text-emerald-400'
                          : testStatus.startsWith('Error')
                          ? 'text-red-400'
                          : 'text-amber-300'
                      }`}
                    >
                      {testStatus}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
    </HolographicModalWrapper>
  );
};
