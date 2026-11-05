import { SupportedLanguage, VoiceSettings } from '../types';
import { playSound, startRoboticVoiceFilter, stopRoboticVoiceFilter } from './soundEffects';

// Type definitions for Web Speech API
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface WebkitSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => WebkitSpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => WebkitSpeechRecognitionInstance;
  }
}

export class SpeechService {
  private recognition: WebkitSpeechRecognitionInstance | null = null;
  private isListening = false;
  private isContinuous = false;
  private currentLanguage: SupportedLanguage = 'auto';
  private currentAudioElement: HTMLAudioElement | null = null;
  private voiceSettings: VoiceSettings = {
    pitch: 0.90,
    rate: 1.0,
    autoSpeak: true,
    preferredVoice: '',
    roboticFilter: true,
    roboticIntensity: 0.85,
    useAuthenticVoiceFile: true,
  };
  private onResultCallback?: (transcript: string, isFinal: boolean) => void;
  private onStateChangeCallback?: (state: 'idle' | 'listening' | 'speaking' | 'error', errorMsg?: string) => void;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
    this.initRecognition();
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      this.availableVoices = window.speechSynthesis.getVoices();
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.applyLanguage();

      this.recognition.onstart = () => {
        this.isListening = true;
        playSound('listen_start');
        this.onStateChangeCallback?.('listening');
      };

      this.recognition.onend = () => {
        const wasListening = this.isListening;
        this.isListening = false;
        if (wasListening) {
          playSound('listen_end');
        }
        this.onStateChangeCallback?.('idle');

        // Continuous mode automatic restart
        if (this.isContinuous) {
          setTimeout(() => {
            if (this.isContinuous && !this.isListening) {
              this.startListening();
            }
          }, 350);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.onStateChangeCallback?.('error', 'Microphone permission denied. Please allow microphone access.');
        } else if (event.error !== 'no-speech') {
          this.onStateChangeCallback?.('error', `Speech error: ${event.error}`);
        }
        this.isListening = false;
      };

      this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        if (transcript && this.onResultCallback) {
          this.onResultCallback(transcript.trim(), Boolean(finalTranscript));
        }
      };
    } catch (err) {
      console.error('Failed to initialize Speech Recognition:', err);
    }
  }

  private applyLanguage() {
    if (!this.recognition) return;
    if (this.currentLanguage === 'hi-IN') {
      this.recognition.lang = 'hi-IN';
    } else if (this.currentLanguage === 'en-US') {
      this.recognition.lang = 'en-US';
    } else {
      // auto / en-IN (Indian English also handles mixed Hindi/Hinglish speech seamlessly)
      this.recognition.lang = 'en-IN';
    }
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
    this.applyLanguage();
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public setContinuous(enable: boolean) {
    this.isContinuous = enable;
  }

  public getContinuous(): boolean {
    return this.isContinuous;
  }

  public setCallbacks(
    onResult: (transcript: string, isFinal: boolean) => void,
    onStateChange: (state: 'idle' | 'listening' | 'speaking' | 'error', errorMsg?: string) => void
  ) {
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
  }

  public updateVoiceSettings(settings: Partial<VoiceSettings>) {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
  }

  public getVoiceSettings(): VoiceSettings {
    return this.voiceSettings;
  }

  public startListening() {
    // Interfere/stop any current speech first
    this.stopSpeaking();

    // Check if Android companion bridge has native speech
    if (window.JarvisAndroidBridge?.startNativeSpeech) {
      window.JarvisAndroidBridge.startNativeSpeech(this.currentLanguage);
      this.isListening = true;
      playSound('listen_start');
      this.onStateChangeCallback?.('listening');
      return;
    }

    if (!this.recognition) {
      this.initRecognition();
    }

    if (this.recognition && !this.isListening) {
      try {
        this.applyLanguage();
        this.recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition start failed (might be already running):', err);
      }
    }
  }

  public stopListening() {
    this.isContinuous = false;
    if (window.JarvisAndroidBridge?.stopNativeSpeech) {
      window.JarvisAndroidBridge.stopNativeSpeech();
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    this.onStateChangeCallback?.('idle');
  }

  public stopSpeaking() {
    stopRoboticVoiceFilter();
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isPlayingAuthenticAudio(): boolean {
    return Boolean(this.currentAudioElement && !this.currentAudioElement.paused);
  }

  /**
   * Plays the genuine authentic JARVIS audio clip provided by the user in the reference attachment:
   * "Sir, I've detected unusual power fluctuations in the East Wing systems..."
   */
  public playAuthenticVoiceFile(): Promise<void> {
    return new Promise((resolve) => {
      this.stopSpeaking();

      // Primary file path copied from the user's uploaded MP3 asset
      const audio = new Audio('/jarvis_voice.mp3');
      this.currentAudioElement = audio;

      this.onStateChangeCallback?.('speaking');
      playSound('activate');

      audio.onended = () => {
        this.currentAudioElement = null;
        this.onStateChangeCallback?.('idle');
        resolve();
      };

      audio.onerror = (e) => {
        console.warn('Playback error for reference audio file:', e);
        this.currentAudioElement = null;
        this.onStateChangeCallback?.('idle');
        resolve();
      };

      audio.play().catch((err) => {
        console.warn('Autoplay prevented or failed:', err);
        this.currentAudioElement = null;
        this.onStateChangeCallback?.('idle');
        resolve();
      });
    });
  }

  public speak(text: string, forceLanguage?: SupportedLanguage): Promise<void> {
    return new Promise((resolve) => {
      if (!this.voiceSettings.autoSpeak) {
        resolve();
        return;
      }

      // Check native Android TTS bridge first
      if (window.JarvisAndroidBridge?.speakNative) {
        window.JarvisAndroidBridge.speakNative(text, forceLanguage || this.currentLanguage);
        resolve();
        return;
      }

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // Cancel previous speech and robotic filters
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      // When metallic filter is active, slightly lower pitch gives that iconic resonant hollow timbre
      utterance.pitch = this.voiceSettings.roboticFilter
        ? Math.max(0.75, this.voiceSettings.pitch * 0.94)
        : this.voiceSettings.pitch;
      utterance.rate = this.voiceSettings.rate;

      // Detect language or use forceLanguage
      const isHindiText = /[\u0900-\u097F]/.test(text) || forceLanguage === 'hi-IN';
      const targetLang = isHindiText ? 'hi-IN' : 'en-IN';
      utterance.lang = targetLang;

      // Pick best matching natural voice
      const voices = this.availableVoices.length > 0 ? this.availableVoices : window.speechSynthesis.getVoices();
      
      let matchedVoice: SpeechSynthesisVoice | undefined;
      if (this.voiceSettings.preferredVoice) {
        matchedVoice = voices.find((v) => v.name === this.voiceSettings.preferredVoice);
      }

      if (!matchedVoice) {
        if (isHindiText) {
          matchedVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
        } else {
          // Look for British, Indian, or American natural voices (Jarvis-like calm authoritative voice)
          matchedVoice =
            voices.find((v) => v.name.includes('Google UK English Male') || v.name.includes('George') || v.name.includes('Daniel')) ||
            voices.find((v) => v.lang.startsWith('en-IN') && !v.name.includes('Female')) ||
            voices.find((v) => v.lang.startsWith('en-GB')) ||
            voices.find((v) => v.lang.startsWith('en'));
        }
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        if (this.voiceSettings.roboticFilter) {
          startRoboticVoiceFilter(this.voiceSettings.roboticIntensity);
          playSound('tick');
        }
        this.onStateChangeCallback?.('speaking');
      };

      utterance.onend = () => {
        stopRoboticVoiceFilter();
        this.onStateChangeCallback?.('idle');
        resolve();
      };

      utterance.onerror = (e) => {
        stopRoboticVoiceFilter();
        console.warn('TTS error:', e);
        this.onStateChangeCallback?.('idle');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices.length > 0 ? this.availableVoices : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
  }

  public isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.JarvisAndroidBridge?.startNativeSpeech
    );
  }
}

export const speechService = new SpeechService();
