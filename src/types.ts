export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';

export type SupportedLanguage = 'auto' | 'en-IN' | 'hi-IN' | 'en-US' | 'en-GB';

export type ThemeMode = 'cobalt-glass' | 'stark-gold' | 'arc-reactor' | 'obsidian';

export interface AppItem {
  id: string;
  name: string;
  hindiName?: string;
  packageName: string;
  aliases: string[];
  category: 'media' | 'utility' | 'social' | 'finance' | 'navigation' | 'tools' | 'communication';
  icon: string;
  deepLink?: string;
  webFallbackUrl?: string;
  isSensitive?: boolean;
}

export type CommandIntentType =
  | 'launch_app'
  | 'search_web'
  | 'search_youtube'
  | 'open_dialer'
  | 'check_email'
  | 'deep_analysis'
  | 'switch_theme'
  | 'tell_time'
  | 'tell_date'
  | 'battery_status'
  | 'system_diagnostics'
  | 'power_diagnostic'
  | 'change_language'
  | 'stop_listening'
  | 'toggle_voice_mute'
  | 'show_installed_apps'
  | 'ai_query'
  | 'unknown';

export interface ParsedCommand {
  rawText: string;
  intent: CommandIntentType;
  targetApp?: AppItem;
  query?: string;
  responseEn: string;
  responseHi: string;
  isSensitive?: boolean;
  sensitiveActionType?: 'payment' | 'phone_call' | 'delete_data';
  requiresConfirmation?: boolean;
}

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  category?: string;
}

export interface DeepAnalysisResult {
  query: string;
  summary: string;
  keyInsights: string[];
  sources: SearchResultItem[];
  confidence: number;
  timestamp: string;
}

export interface EmailItem {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  priority: 'urgent' | 'high' | 'normal';
  category: 'security' | 'intelligence' | 'system' | 'personal';
}

export interface CallSession {
  recipientName: string;
  recipientNumber: string;
  status: 'connecting' | 'active' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
}

export interface AISettings {
  provider: 'none' | 'groq' | 'openrouter' | 'qwen' | 'gemini';
  apiKey: string;
  model: string;
  isEnabled: boolean;
  endpointUrl?: string;
}

export interface VoiceSettings {
  pitch: number;
  rate: number;
  autoSpeak: boolean;
  preferredVoice: string;
  roboticFilter: boolean;
  roboticIntensity: number;
  useAuthenticVoiceFile: boolean;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  language?: 'en' | 'hi';
  actionTaken?: string;
}

export interface NativeBridgeStatus {
  isAvailable: boolean;
  platform: 'android-webview' | 'browser-pwa';
  installedAppCount: number;
  hasSpeechRecognizer: boolean;
  hasTTS: boolean;
}
