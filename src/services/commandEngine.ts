import { ParsedCommand, AppItem, SupportedLanguage } from '../types';
import { androidBridge } from './androidBridge';

export class LocalCommandEngine {
  /**
   * Parse user speech (English, Hindi, or mixed Hinglish)
   * into a structured intent with localized responses.
   * Completely local, zero AI API key required!
   */
  public parse(input: string, currentLang: SupportedLanguage = 'auto'): ParsedCommand {
    const raw = input.trim();
    const lower = raw.toLowerCase();

    // 1. Language switching commands
    if (
      lower.includes('hindi mein') ||
      lower.includes('hindi me') ||
      lower.includes('speak in hindi') ||
      lower.includes('हिंदी में') ||
      lower.includes('hindi bhasha')
    ) {
      return {
        rawText: raw,
        intent: 'change_language',
        query: 'hi-IN',
        responseEn: 'Switched voice response to Hindi. Aapka aadesh, Sir?',
        responseHi: 'आदेश स्वीकार किया गया सर, अब मैं आपसे हिन्दी में बात करूँगा।',
      };
    }

    if (
      lower.includes('english mein') ||
      lower.includes('speak english') ||
      lower.includes('in english') ||
      lower.includes('switch to english')
    ) {
      return {
        rawText: raw,
        intent: 'change_language',
        query: 'en-IN',
        responseEn: 'Language switched to English. Ready for your instructions, Sir.',
        responseHi: 'भाषा अंग्रेज़ी में बदल दी गई है सर।',
      };
    }

    // 2. Stop listening / Mute
    if (
      lower.includes('stop listening') ||
      lower.includes('ruk jao') ||
      lower.includes('shant ho jao') ||
      lower.includes('chup ho jao') ||
      lower.includes('sleep mode') ||
      lower.includes('standby') ||
      lower === 'stop'
    ) {
      return {
        rawText: raw,
        intent: 'stop_listening',
        responseEn: 'Entering standby mode. Tap the holographic orb whenever you need me.',
        responseHi: 'स्टैंडबाय मोड चालू। जब भी ज़रूरत हो, होलोग्राफिक ऑर्ब पर टैप करें।',
      };
    }

    // 3. YouTube specific search commands: "YouTube par [query] search karo", "search [query] on YouTube"
    const ytSearchPatterns = [
      /(?:youtube\s+(?:par|pe|me|mein)\s+)(.*?)(?:\s+(?:search|chalao|bajao|kholo|dikhao))?$/i,
      /(?:search\s+)(.*?)(?:\s+(?:on|in)\s+youtube)/i,
      /(?:youtube\s+search\s+)(.*)/i,
      /(?:play\s+)(.*?)(?:\s+(?:on|in)\s+youtube)/i,
    ];

    for (const pattern of ytSearchPatterns) {
      const match = lower.match(pattern);
      if (match && match[1] && match[1].trim().length > 1) {
        const query = match[1].replace(/kholo|search|karo|dikhao|bajao|chalao/gi, '').trim();
        if (query) {
          return {
            rawText: raw,
            intent: 'search_youtube',
            query,
            responseEn: `Searching for "${query}" on YouTube.`,
            responseHi: `यूट्यूब पर "${query}" खोजा जा रहा है सर।`,
          };
        }
      }
    }

    // 4. Web search command: "Google par [query] search karo", "search [query] on google", "web search [query]"
    const webSearchPatterns = [
      /(?:google\s+(?:par|pe|me|mein)\s+)(.*?)(?:\s+(?:search|kholo|dikhao))?$/i,
      /(?:search\s+)(.*?)(?:\s+(?:on|in)\s+google|\s+on\s+web|\s+online)?$/i,
      /(?:who is|what is|where is|tell me about)\s+(.*)/i,
      /(?:khojo|search karo|dhoondo)\s+(.*)/i,
    ];

    // Check if query is explicitly asking to search Google or asking a question
    if (
      lower.startsWith('search ') ||
      lower.includes('search karo') ||
      lower.includes('google par') ||
      lower.includes('google search') ||
      lower.startsWith('who is ') ||
      lower.startsWith('what is ')
    ) {
      let queryClean = lower
        .replace(/^(search|google par|google search|search karo|khojo|tell me about|who is|what is)/i, '')
        .replace(/(on google|on web|search karo|kholo|karo)/gi, '')
        .trim();

      if (queryClean.length > 1) {
        return {
          rawText: raw,
          intent: 'search_web',
          query: queryClean,
          responseEn: `Scanning global neural network for "${queryClean}".`,
          responseHi: `इंटरनेट पर "${queryClean}" के परिणाम खोजे जा रहे हैं सर।`,
        };
      }
    }

    // 5. Installed apps inquiry: "Meri installed apps dikhao", "show installed apps"
    if (
      lower.includes('installed apps') ||
      lower.includes('installed app') ||
      lower.includes('apps dikhao') ||
      lower.includes('app list') ||
      lower.includes('saari apps')
    ) {
      return {
        rawText: raw,
        intent: 'show_installed_apps',
        responseEn: 'Accessing local application registry. Displaying installed packages.',
        responseHi: 'डिवाइस में मौजूद सभी ऐप्स की सूची प्रदर्शित की जा रही है।',
      };
    }

    // 6. Time and Date commands
    if (
      lower.includes('time kya') ||
      lower.includes('what time') ||
      lower.includes('kitne baje') ||
      lower.includes('current time')
    ) {
      const now = new Date();
      const timeStringEn = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        rawText: raw,
        intent: 'tell_time',
        responseEn: `The current time is ${timeStringEn}, Sir.`,
        responseHi: `अभी समय ${timeStringEn} हुआ है सर।`,
      };
    }

    if (
      lower.includes('date kya') ||
      lower.includes('what date') ||
      lower.includes('aaj ka din') ||
      lower.includes('todays date') ||
      lower.includes('today date')
    ) {
      const now = new Date();
      const dateStringEn = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const dateStringHi = now.toLocaleDateString('hi-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return {
        rawText: raw,
        intent: 'tell_date',
        responseEn: `Today is ${dateStringEn}.`,
        responseHi: `आज की तिथि ${dateStringHi} है।`,
      };
    }

    // 7. Battery & Diagnostics & Power Fluctuation (From User's Authentic Audio)
    if (
      lower.includes('power fluctuation') ||
      lower.includes('east wing') ||
      lower.includes('fluctuation') ||
      lower.includes('power diagnostic')
    ) {
      return {
        rawText: raw,
        intent: 'power_diagnostic',
        responseEn: "Sir, I've detected unusual power fluctuations in the East Wing systems. I've initiated preliminary diagnostics and can implement necessary corrections immediately. Would you like me to proceed with the standard protocol, or shall I await your specific instructions?",
        responseHi: "सर, मैंने ईस्ट विंग सिस्टम में असामान्य पावर उतार-चढ़ाव का पता लगाया है। मैंने प्रारंभिक डायग्नोस्टिक्स शुरू कर दिए हैं और तुरंत आवश्यक सुधार लागू कर सकता हूँ। क्या आप मानक प्रोटोकॉल के साथ आगे बढ़ना चाहते हैं, या मैं आपके निर्देशों की प्रतीक्षा करूँ?",
      };
    }

    if (
      lower.includes('battery') ||
      lower.includes('charge kitna') ||
      lower.includes('power level')
    ) {
      return {
        rawText: raw,
        intent: 'battery_status',
        responseEn: 'Core reactor power is online. Battery diagnostics connected.',
        responseHi: 'पावर रिएक्टर सुचारू रूप से कार्य कर रहा है। बैटरी जांच पूरी हुई।',
      };
    }

    // 7.5 Check Email Notifications: "check email", "emails dikhao", "read notifications"
    if (
      lower.includes('check email') ||
      lower.includes('check mail') ||
      lower.includes('emails dikhao') ||
      lower.includes('email dikhao') ||
      lower.includes('read notification') ||
      lower.includes('notifications') ||
      lower.includes('unread email') ||
      lower.includes('stark relay') ||
      lower === 'email' ||
      lower === 'emails' ||
      lower === 'mail'
    ) {
      return {
        rawText: raw,
        intent: 'check_email',
        responseEn: 'Accessing Stark encrypted communications relay. Displaying latest intelligence transmissions.',
        responseHi: 'स्टार्क एन्क्रिप्टेड ईमेल रिले खोला जा रहा है। ट्रांसमिशन संदेश तैयार हैं।',
      };
    }

    // 7.6 Deep Internet Analysis: "analyze [topic]", "deep analysis of [topic]", "scan internet for [topic]"
    if (
      lower.startsWith('analyze ') ||
      lower.startsWith('deep analyze ') ||
      lower.includes('internet analysis') ||
      lower.includes('deep analysis') ||
      lower.includes('deep scan')
    ) {
      const topic = lower
        .replace(/^(analyze|deep analyze|internet analysis of|deep analysis of|deep scan of|deep scan|analyze the)/i, '')
        .trim();
      return {
        rawText: raw,
        intent: 'deep_analysis',
        query: topic || 'Global Quantum Computing Trends',
        responseEn: `Initiating multi-node global web scan on "${topic}". Synthesizing intelligence dossier.`,
        responseHi: `"${topic}" के लिए संपूर्ण इंटरनेट का विश्लेषण किया जा रहा है सर।`,
      };
    }

    // 7.7 Smart Theme Switcher: "switch to gold theme", "cobalt theme", "arc reactor mode", "stealth theme"
    if (
      lower.includes('theme') ||
      lower.includes('mode')
    ) {
      let targetTheme = 'cobalt-glass';
      if (lower.includes('gold')) targetTheme = 'stark-gold';
      else if (lower.includes('arc') || lower.includes('cyan')) targetTheme = 'arc-reactor';
      else if (lower.includes('stealth') || lower.includes('obsidian') || lower.includes('dark')) targetTheme = 'obsidian';
      else if (lower.includes('cobalt') || lower.includes('blue') || lower.includes('glass')) targetTheme = 'cobalt-glass';

      return {
        rawText: raw,
        intent: 'switch_theme',
        query: targetTheme,
        responseEn: `Calibrating holographic optics to ${targetTheme} spectrum, Sir.`,
        responseHi: `होलोग्राफिक थीम को ${targetTheme} में बदला जा रहा है सर।`,
      };
    }

    // 8. Phone call intent
    const callMatch = lower.match(/(?:call|phone karo|dial)\s+([0-9\+\s]{5,15}|[a-zA-Z\s]+)/i) ||
                      lower.match(/(.*?)\s+(?:ko call lagao|ko call karo|ko phone karo)/i);
    if (callMatch && callMatch[1]) {
      const target = callMatch[1].trim();
      return {
        rawText: raw,
        intent: 'open_dialer',
        query: target,
        responseEn: `Dialing ${target} on your mobile device, Sir.`,
        responseHi: `${target} को कॉल किया जा रहा है सर।`,
      };
    }

    // 9. App Launching Intent: Immediately launches apps on its own!
    const app = this.detectAppInSpeech(lower);
    if (app) {
      return {
        rawText: raw,
        intent: 'launch_app',
        targetApp: app,
        responseEn: `Opening ${app.name} for you immediately, Sir.`,
        responseHi: `${app.hindiName || app.name} आपके लिए तुरंत खोला जा रहा है सर।`,
      };
    }

    // 10. General conversational query or fallback to search / AI
    return {
      rawText: raw,
      intent: 'ai_query',
      query: raw,
      responseEn: `Processing inquiry: "${raw}". Checking neural knowledge base.`,
      responseHi: `आपके प्रश्न "${raw}" का उत्तर खोजा जा रहा है।`,
    };
  }

  private detectAppInSpeech(speech: string): AppItem | null {
    // Strip trailing punctuation & clean speech
    const cleaned = speech.replace(/[.,?!:;'"_]/g, ' ').toLowerCase().trim();
    const words = cleaned.split(/\s+/).filter(Boolean);

    const apps = androidBridge.getAllApps();
    // Sort apps with longest names first to prevent partial alias overlap
    const sortedApps = [...apps].sort((a, b) => b.name.length - a.name.length);

    for (const app of sortedApps) {
      const appNameLower = app.name.toLowerCase();

      // Direct exact word match or substring
      if (words.includes(appNameLower) || cleaned.includes(appNameLower)) {
        return app;
      }

      // Check Hindi name if present
      if (app.hindiName) {
        const hindiLower = app.hindiName.toLowerCase();
        if (words.includes(hindiLower) || cleaned.includes(hindiLower)) {
          return app;
        }
      }

      // Check aliases
      for (const alias of app.aliases) {
        const aliasLower = alias.toLowerCase();
        if (words.includes(aliasLower) || cleaned.includes(aliasLower)) {
          return app;
        }
      }
    }

    return null;
  }
}

export const commandEngine = new LocalCommandEngine();
