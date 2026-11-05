import { AISettings } from '../types';

export const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini 3.8 Flash (Official Neural Brain)',
    description: 'Google DeepMind state-of-the-art model with live Google Search Grounding for global internet analysis.',
    models: ['gemini-3.8-flash', 'gemini-4-argon'],
    defaultModel: 'gemini-3.8-flash',
    endpoint: '/api/gemini/chat',
    requiresKey: true,
    keyDocsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'none',
    name: 'Local Only (100% Free / Device Offline Engine)',
    description: 'Instant zero-latency command parsing on device. No internet AI key needed.',
    models: ['Local Intent Matcher'],
    defaultModel: 'Local Intent Matcher',
    requiresKey: false,
  },
  {
    id: 'groq',
    name: 'Groq Cloud (Ultra Low Latency LPU)',
    description: 'Blazing-fast inference using LPU chips (Llama 3.3 70B, Llama 3.1 8B).',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    defaultModel: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    requiresKey: true,
    keyDocsUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Universal Model Gateway)',
    description: 'Access hundreds of AI models with a single unified API key.',
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'anthropic/claude-3.5-sonnet',
    ],
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    requiresKey: true,
    keyDocsUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'qwen',
    name: 'Alibaba Qwen (DashScope)',
    description: 'Exceptional bilingual reasoning for Hindi and Asian languages.',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    defaultModel: 'qwen-plus',
    endpoint: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
    requiresKey: true,
    keyDocsUrl: 'https://www.alibabacloud.com/help/en/model-studio',
  },
] as const;

export interface GeminiGroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export class AIService {
  private settingsKey = 'jarvis_ai_settings';
  private serverHasEnvKey: boolean | null = null;

  public async checkServerStatus(): Promise<{ hasEnvKey: boolean; defaultModel: string }> {
    try {
      const res = await fetch('/api/gemini/status');
      if (res.ok) {
        const data = await res.json();
        this.serverHasEnvKey = Boolean(data.hasEnvKey);
        return data;
      }
    } catch {
      // Offline or direct client mode
    }
    return { hasEnvKey: false, defaultModel: 'gemini-3.8-flash' };
  }

  public getSettings(): AISettings {
    if (typeof window === 'undefined') {
      return { provider: 'gemini', apiKey: '', model: 'gemini-3.8-flash', isEnabled: true };
    }
    try {
      const stored = localStorage.getItem(this.settingsKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clean out any prohibited legacy models
        if (parsed.model === 'gemini-1.5-flash' || parsed.model === 'gemini-2.0-flash' || parsed.model === 'gemini-pro') {
          parsed.model = 'gemini-3.8-flash';
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-3.8-flash',
      isEnabled: true,
    };
  }

  public saveSettings(settings: AISettings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch {
      // storage failed
    }
  }

  public async generateChatResponse(
    userPrompt: string,
    systemInstruction: string = 'You are JARVIS 4.0, a concise, highly intelligent, futuristic personal AI assistant inspired by Tony Stark. Speak with calm authority, elegance, and warmth. Keep responses under 3 sentences unless requested otherwise.',
    enableSearch: boolean = true
  ): Promise<{ text: string; groundingChunks?: GeminiGroundingChunk[] }> {
    const settings = this.getSettings();

    // 1. If provider is Gemini (Default) or none specified, call server-side Gemini API
    if (settings.provider === 'gemini' || settings.provider === ('default' as unknown)) {
      try {
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            model: settings.model || 'gemini-3.8-flash',
            systemInstruction,
            enableSearch,
            apiKey: settings.apiKey?.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const msg = errorData.error || `Gemini API returned status ${response.status}`;
          throw new Error(msg);
        }

        const data = await response.json();
        return {
          text: data.text || 'JARVIS systems processed your request, Sir.',
          groundingChunks: data.groundingChunks || [],
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // If API key is not configured, give a polite, friendly JARVIS response
        if (msg.includes('Gemini API key is not configured') || msg.includes('401')) {
          return {
            text: `Sir, to enable Gemini 3.8 Flash intelligence, please provide your Gemini API key in Settings > Neural AI Brain, or configure GEMINI_API_KEY in the Secrets panel.`,
          };
        }
        throw new Error(`Gemini Neural Engine: ${msg}`);
      }
    }

    // 2. If provider is 'none', return local offline message
    if (!settings.isEnabled || settings.provider === 'none') {
      return {
        text: `JARVIS operates in local command mode, Sir. You can switch to Gemini 3.8 Flash in Settings for full conversational intelligence and internet analysis.`,
      };
    }

    // 3. For third-party providers (Groq, OpenRouter, Qwen)
    if (!settings.apiKey) {
      throw new Error(`API key missing for provider ${settings.provider}. Please configure it in Settings.`);
    }

    const providerConfig = AI_PROVIDERS.find((p) => p.id === settings.provider);
    if (!providerConfig || !('endpoint' in providerConfig)) {
      throw new Error(`Provider ${settings.provider} is not configured.`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    };

    if (settings.provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'JARVIS 4.0 AI Assistant';
    }

    const payload = {
      model: settings.model || providerConfig.defaultModel,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    };

    const response = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `Provider ${settings.provider} returned status ${response.status}`;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error?.message) {
          message = parsed.error.message;
        }
      } catch {
        // raw text
      }
      throw new Error(message);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Received empty response from AI model.');
    }
    return { text: content.trim() };
  }
}

export const aiService = new AIService();
