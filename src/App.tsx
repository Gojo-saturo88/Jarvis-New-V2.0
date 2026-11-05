/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HologramSphere } from './components/HologramSphere';
import { CleanHolographicHUD } from './components/CleanHolographicHUD';
import { GlassReferenceHUD } from './components/GlassReferenceHUD';
import { EmailNotificationsModal } from './components/EmailNotificationsModal';
import { PhoneCallModal } from './components/PhoneCallModal';
import { DeepAnalysisModal } from './components/DeepAnalysisModal';
import { WebSearchModal } from './components/WebSearchModal';
import { AppsManagerModal } from './components/AppsManagerModal';
import { YouTubeModal } from './components/YouTubeModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidCompanionModal } from './components/AndroidCompanionModal';
import { CommandOverlay } from './components/CommandOverlay';
import { SafetyConfirmModal } from './components/SafetyConfirmModal';
import { WebCameraModal } from './components/WebCameraModal';
import { WebCalculatorModal } from './components/WebCalculatorModal';
import { ProjectZipModal } from './components/ProjectZipModal';
import { AppLaunchModal } from './components/AppLaunchModal';

import { speechService } from './services/speechService';
import { commandEngine } from './services/commandEngine';
import { androidBridge } from './services/androidBridge';
import { aiService } from './services/aiService';
import { emailService } from './services/emailService';
import { playSound } from './services/soundEffects';
import {
  AssistantState,
  SupportedLanguage,
  ThemeMode,
  ParsedCommand,
  AppItem,
  EmailItem,
  LogMessage,
} from './types';

export default function App() {
  const [state, setState] = useState<AssistantState>('idle');
  // Default to user's reference image orb: Tony Stark Golden Hologram
  const [theme, setTheme] = useState<ThemeMode>('stark-gold');
  // Responsive HUD: Clean Mobile HUD on small screens, Reference Glass OS on desktop
  const [hudMode, setHudMode] = useState<'reference' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'reference';
  });
  const [language, setLanguage] = useState<SupportedLanguage>('auto');
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('At your service, Sir. JARVIS 4.0 systems online.');
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // Modals & In-App Web Tools
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [youtubeInitialQuery, setYoutubeInitialQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidCompanionOpen, setIsAndroidCompanionOpen] = useState(false);
  const [isCommandsOpen, setIsCommandsOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [safetyCommand, setSafetyCommand] = useState<ParsedCommand | null>(null);
  const [activeLaunchedApp, setActiveLaunchedApp] = useState<AppItem | null>(null);

  // New Modals for User Requests
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [incomingCallTarget, setIncomingCallTarget] = useState<{ name: string; number: string } | undefined>(undefined);
  const [isDeepAnalysisOpen, setIsDeepAnalysisOpen] = useState(false);
  const [deepAnalysisQuery, setDeepAnalysisQuery] = useState('');
  const [isAuthenticPlaying, setIsAuthenticPlaying] = useState(false);

  const [emails, setEmails] = useState<EmailItem[]>(() => emailService.getEmails());
  const [isNativeCompanion, setIsNativeCompanion] = useState(false);

  const audioIntervalRef = useRef<number | null>(null);

  const addLog = useCallback((sender: 'user' | 'jarvis' | 'system', text: string) => {
    const newLog: LogMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender,
      text,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50));
  }, []);

  // Play the authentic user-supplied audio clip
  const handlePlayReferenceVoice = async () => {
    playSound('boot');
    setIsAuthenticPlaying(true);
    const speechText =
      "Sir, I've detected unusual power fluctuations in the East Wing systems. I've initiated preliminary diagnostics and can implement necessary corrections immediately. Would you like me to proceed with the standard protocol, or shall I await your specific instructions?";
    setResponse(speechText);
    setState('speaking');
    addLog('jarvis', speechText);

    try {
      await speechService.playAuthenticVoiceFile();
    } finally {
      setIsAuthenticPlaying(false);
      setState('idle');
    }
  };

  // Initialize Speech & Bridge Callbacks
  useEffect(() => {
    playSound('boot');

    const bridgeStatus = androidBridge.getStatus();
    setIsNativeCompanion(bridgeStatus.isAvailable);

    speechService.setCallbacks(
      (text: string, isFinal: boolean) => {
        setTranscript(text);
        if (isFinal) {
          handleExecuteCommand(text);
        }
      },
      (speechState: 'idle' | 'listening' | 'speaking' | 'error', errorMsg?: string) => {
        if (speechState === 'listening') {
          setState('listening');
          setIsListening(true);
          startAudioLevelSimulation();
        } else if (speechState === 'speaking') {
          setState('speaking');
          startAudioLevelSimulation();
        } else if (speechState === 'idle') {
          setState('idle');
          setIsListening(false);
          stopAudioLevelSimulation();
        } else if (speechState === 'error') {
          setState('idle');
          setIsListening(false);
          stopAudioLevelSimulation();
          if (errorMsg) {
            setResponse(errorMsg);
            addLog('system', errorMsg);
          }
        }
      }
    );

    (window as unknown as { onNativeSpeechResult?: (text: string, isFinal: boolean) => void }).onNativeSpeechResult = (
      text: string,
      isFinal: boolean
    ) => {
      setTranscript(text);
      if (isFinal) {
        handleExecuteCommand(text);
      }
    };

    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
      stopAudioLevelSimulation();
    };
  }, [addLog]);

  const startAudioLevelSimulation = () => {
    if (audioIntervalRef.current) return;
    audioIntervalRef.current = window.setInterval(() => {
      setAudioLevel(0.3 + Math.random() * 0.7);
    }, 120);
  };

  const stopAudioLevelSimulation = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setAudioLevel(0);
  };

  // Main Command Execution Engine
  const handleExecuteCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    speechService.stopListening();
    setState('thinking');
    addLog('user', commandText);

    // Local Natural Language Command Parser
    const parsed = commandEngine.parse(commandText, language);

    const isHindiUser = language === 'hi-IN' || /[\u0900-\u097F]/.test(commandText);
    const moviePhrasingEn = `Right away, Sir. ${parsed.responseEn}`;
    const primaryResponse = isHindiUser ? parsed.responseHi : moviePhrasingEn;

    switch (parsed.intent) {
      case 'power_diagnostic':
        await handlePlayReferenceVoice();
        break;

      case 'check_email':
        playSound('success');
        setIsEmailOpen(true);
        const unreadCount = emailService.getUnreadCount();
        const unreadMsg = `Accessing communications relay, Sir. You have ${unreadCount} unread transmissions. Opening inbox.`;
        setResponse(unreadMsg);
        addLog('jarvis', unreadMsg);
        if (autoSpeak) {
          speechService.speak(unreadMsg, isHindiUser ? 'hi-IN' : 'en-GB');
        }
        setTimeout(() => setState('idle'), 1200);
        break;

      case 'open_dialer':
        playSound('activate');
        const contactTarget = parsed.query || 'Tony Stark';
        setIncomingCallTarget({ name: contactTarget, number: parsed.query || '+1-212-555-0100' });
        setIsPhoneOpen(true);
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);
        if (autoSpeak) {
          speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-GB');
        }
        setTimeout(() => setState('idle'), 1000);
        break;

      case 'deep_analysis':
        playSound('activate');
        setDeepAnalysisQuery(parsed.query || 'Quantum Core Physics');
        setIsDeepAnalysisOpen(true);
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);
        if (autoSpeak) {
          speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-GB');
        }
        setTimeout(() => setState('idle'), 1000);
        break;

      case 'switch_theme':
        playSound('success');
        if (parsed.query) {
          setTheme(parsed.query as ThemeMode);
        }
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);
        if (autoSpeak) {
          speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-GB');
        }
        setTimeout(() => setState('idle'), 1000);
        break;

      case 'launch_app':
        if (parsed.targetApp) {
          playSound('success');
          setState('executing');
          setResponse(primaryResponse);
          addLog('jarvis', primaryResponse);

          if (autoSpeak) {
            speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-IN');
          }

          const appId = parsed.targetApp.id;

          // Route to In-App Web tools immediately without delay
          if (appId === 'camera') {
            setIsCameraOpen(true);
          } else if (appId === 'calculator') {
            setIsCalculatorOpen(true);
          } else if (appId === 'youtube') {
            setYoutubeInitialQuery('');
            setIsYouTubeOpen(true);
          } else if (appId === 'settings') {
            setIsSettingsOpen(true);
          } else if (appId === 'chrome') {
            setSearchInitialQuery('');
            setIsSearchOpen(true);
          } else if (appId === 'gmail') {
            setIsEmailOpen(true);
          } else if (appId === 'phone' || appId === 'dialer') {
            setIsPhoneOpen(true);
          } else {
            // WhatsApp, Spotify, Maps, Instagram, Telegram, PhonePe, Paytm, etc.
            setActiveLaunchedApp(parsed.targetApp);
            androidBridge.launchApp(parsed.targetApp);
          }
          setTimeout(() => setState('idle'), 600);
        }
        break;

      case 'search_youtube':
        playSound('success');
        setState('executing');
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);

        if (autoSpeak) {
          speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-IN');
        }

        setTimeout(() => {
          setYoutubeInitialQuery(parsed.query || '');
          setIsYouTubeOpen(true);
          setState('idle');
        }, 500);
        break;

      case 'search_web':
        playSound('success');
        setState('executing');
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);

        if (autoSpeak) {
          speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-IN');
        }

        setTimeout(() => {
          setSearchInitialQuery(parsed.query || '');
          setIsSearchOpen(true);
          setState('idle');
        }, 500);
        break;

      case 'show_installed_apps':
        playSound('success');
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);
        if (autoSpeak) {
          speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-IN');
        }
        setIsAppsOpen(true);
        setState('idle');
        break;

      case 'change_language':
        if (parsed.query === 'hi-IN' || parsed.query === 'en-IN') {
          setLanguage(parsed.query);
          speechService.setLanguage(parsed.query);
        }
        playSound('success');
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);
        if (autoSpeak) {
          speechService.speak(primaryResponse, parsed.query as SupportedLanguage);
        }
        setState('idle');
        break;

      case 'stop_listening':
        playSound('pulse');
        speechService.stopListening();
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);
        if (autoSpeak) {
          await speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-IN');
        }
        setState('idle');
        break;

      case 'tell_time':
      case 'tell_date':
      case 'battery_status':
      case 'system_diagnostics':
        playSound('success');
        setResponse(primaryResponse);
        addLog('jarvis', primaryResponse);
        if (autoSpeak) {
          await speechService.speak(primaryResponse, isHindiUser ? 'hi-IN' : 'en-IN');
        }
        setState('idle');
        break;

      case 'ai_query':
      default:
        const aiConfig = aiService.getSettings();
        if (aiConfig.isEnabled && (aiConfig.provider === 'gemini' || aiConfig.apiKey)) {
          try {
            setResponse(`Scanning Gemini neural index, Sir...`);
            const aiReply = await aiService.generateChatResponse(commandText);
            const replyText = typeof aiReply === 'string' ? aiReply : aiReply.text;
            playSound('success');
            setResponse(replyText);
            addLog('jarvis', replyText);
            if (autoSpeak) {
              await speechService.speak(replyText, isHindiUser ? 'hi-IN' : 'en-IN');
            }
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            const fallbackReply = `At your service, Sir. Neural provider note: ${errorMsg}. Opening search results.`;
            setResponse(fallbackReply);
            addLog('system', fallbackReply);
            setSearchInitialQuery(commandText);
            setIsSearchOpen(true);
          }
        } else {
          // Open Deep Analysis by default so user gets complete internet synthesis
          setDeepAnalysisQuery(commandText);
          setIsDeepAnalysisOpen(true);
          const localReply = isHindiUser
            ? `सर, "${commandText}" के लिए संपूर्ण इंटरनेट का विश्लेषण किया जा रहा है।`
            : `Right away, Sir. Scanning the global knowledge network for "${commandText}".`;
          playSound('success');
          setResponse(localReply);
          addLog('jarvis', localReply);
          if (autoSpeak) {
            speechService.speak(localReply, isHindiUser ? 'hi-IN' : 'en-GB');
          }
        }
        setState('idle');
        break;
    }
  };

  const handleToggleListen = () => {
    if (isListening) {
      speechService.stopListening();
    } else {
      speechService.startListening();
    }
  };

  const handleReadEmailAloud = (email: EmailItem) => {
    const textToRead = `Incoming transmission from ${email.sender}. Subject: ${email.subject}. Message reads: ${email.preview}`;
    setResponse(textToRead);
    addLog('jarvis', textToRead);
    speechService.speak(textToRead, 'en-GB');
  };

  const handleSpeakBriefing = (text: string) => {
    setResponse(text);
    addLog('jarvis', text);
    speechService.speak(text, 'en-GB');
  };

  const unreadCount = emailService.getUnreadCount();
  const latestEmail = emails.find((e) => !e.isRead) || emails[0];

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#02050e] text-stone-100 flex flex-col justify-between select-none touch-none">
      {/* 1. Cinematic 3D Holographic Earth Globe with dynamic themes & reference discs */}
      <HologramSphere
        state={state}
        audioLevel={audioLevel}
        theme={theme}
        onTap={() => {
          playSound('pulse');
          if (state === 'speaking') {
            speechService.stopSpeaking();
            setState('idle');
            return;
          }
          handleToggleListen();
        }}
        onDoubleTap={() => {
          playSound('activate');
          handleToggleListen();
        }}
      />

      {/* Atmospheric Star Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] z-10" />

      {/* 2. HUD Rendering: Switchable between Reference Glass OS (from user's uploaded reference screenshot) and Clean Mobile HUD */}
      {hudMode === 'reference' ? (
        <GlassReferenceHUD
          state={state}
          theme={theme}
          onThemeChange={(newTheme) => setTheme(newTheme)}
          onTriggerVoice={handleToggleListen}
          onPlayReferenceVoice={handlePlayReferenceVoice}
          onOpenEmails={() => setIsEmailOpen(true)}
          onOpenPhone={() => {
            setIncomingCallTarget(undefined);
            setIsPhoneOpen(true);
          }}
          onOpenApps={() => setIsAppsOpen(true)}
          onOpenSearch={() => {
            setSearchInitialQuery('');
            setIsSearchOpen(true);
          }}
          onOpenDeepAnalysis={() => {
            setDeepAnalysisQuery('');
            setIsDeepAnalysisOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenDiagnostics={handlePlayReferenceVoice}
          onExecuteCommand={handleExecuteCommand}
          unreadEmailCount={unreadCount}
          latestEmail={latestEmail}
          transcript={transcript}
          response={response}
          inputText={inputText}
          setInputText={setInputText}
          onSubmitInput={() => {
            if (!inputText.trim()) return;
            const text = inputText;
            setInputText('');
            handleExecuteCommand(text);
          }}
          isAuthenticAudioPlaying={isAuthenticPlaying}
          onToggleHudMode={() => setHudMode('mobile')}
          hudMode={hudMode}
        />
      ) : (
        <CleanHolographicHUD
          state={state}
          theme={theme}
          onThemeChange={(newTheme) => setTheme(newTheme)}
          onTriggerVoice={handleToggleListen}
          onPlayReferenceVoice={handlePlayReferenceVoice}
          onOpenEmails={() => setIsEmailOpen(true)}
          onOpenPhone={() => {
            setIncomingCallTarget(undefined);
            setIsPhoneOpen(true);
          }}
          onOpenApps={() => setIsAppsOpen(true)}
          onOpenSearch={() => {
            setSearchInitialQuery('');
            setIsSearchOpen(true);
          }}
          onOpenDeepAnalysis={() => {
            setDeepAnalysisQuery('');
            setIsDeepAnalysisOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenDiagnostics={handlePlayReferenceVoice}
          onExecuteCommand={handleExecuteCommand}
          unreadEmailCount={unreadCount}
          latestEmail={latestEmail}
          transcript={transcript}
          response={response}
          inputText={inputText}
          setInputText={setInputText}
          onSubmitInput={() => {
            if (!inputText.trim()) return;
            const text = inputText;
            setInputText('');
            handleExecuteCommand(text);
          }}
          isAuthenticAudioPlaying={isAuthenticPlaying}
          onToggleHudMode={() => setHudMode('reference')}
        />
      )}

      {/* Dedicated Holographic App Launch Modal */}
      <AppLaunchModal
        app={activeLaunchedApp}
        isOpen={Boolean(activeLaunchedApp)}
        onClose={() => setActiveLaunchedApp(null)}
        isNativeCompanion={isNativeCompanion}
      />

      {/* Modals & Built-in In-App Web Applications */}
      <EmailNotificationsModal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        onReadEmailAloud={handleReadEmailAloud}
      />

      <PhoneCallModal
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        incomingCallTarget={incomingCallTarget}
        onCallInitiated={(name, number) => {
          addLog('user', `Calling ${name} (${number})`);
        }}
      />

      <DeepAnalysisModal
        isOpen={isDeepAnalysisOpen}
        initialQuery={deepAnalysisQuery}
        onClose={() => setIsDeepAnalysisOpen(false)}
        onSpeakBriefing={handleSpeakBriefing}
      />

      <WebSearchModal
        isOpen={isSearchOpen}
        initialQuery={searchInitialQuery}
        onClose={() => setIsSearchOpen(false)}
        onVoiceSearchRequest={() => {
          setIsSearchOpen(false);
          handleToggleListen();
        }}
      />

      <WebCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
      />

      <WebCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <ProjectZipModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
      />

      <AppsManagerModal
        isOpen={isAppsOpen}
        onClose={() => setIsAppsOpen(false)}
        onLaunchApp={async (app: AppItem) => {
          setIsAppsOpen(false);
          await handleExecuteCommand(`open ${app.name}`);
        }}
        isNativeCompanion={isNativeCompanion}
      />

      <YouTubeModal
        isOpen={isYouTubeOpen}
        initialQuery={youtubeInitialQuery}
        onClose={() => setIsYouTubeOpen(false)}
        onVoiceSearch={() => {
          setIsYouTubeOpen(false);
          handleToggleListen();
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onChangeLanguage={(l) => {
          setLanguage(l);
          speechService.setLanguage(l);
        }}
      />

      <AndroidCompanionModal
        isOpen={isAndroidCompanionOpen}
        onClose={() => setIsAndroidCompanionOpen(false)}
        isNativeCompanion={isNativeCompanion}
      />

      <CommandOverlay
        isOpen={isCommandsOpen}
        logs={logs}
        onClose={() => setIsCommandsOpen(false)}
        onExecuteSample={(sample) => {
          setIsCommandsOpen(false);
          setTranscript(sample);
          handleExecuteCommand(sample);
        }}
        onClearLogs={() => setLogs([])}
      />

      <SafetyConfirmModal
        isOpen={Boolean(safetyCommand)}
        command={safetyCommand}
        onConfirm={() => setSafetyCommand(null)}
        onCancel={() => setSafetyCommand(null)}
      />
    </div>
  );
}
