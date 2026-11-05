import { AppItem, NativeBridgeStatus } from '../types';

// Declaring the native bridge interface that Android companion WebView injects
declare global {
  interface Window {
    JarvisAndroidBridge?: {
      launchApp?: (packageName: string) => boolean;
      getInstalledApps?: () => string; // returns JSON string
      isNativeCompanion?: () => boolean;
      openDialer?: (phoneNumber: string) => boolean;
      openYouTubeSearch?: (query: string) => boolean;
      openWebUrl?: (url: string) => boolean;
      setSpeechListener?: (callbackName: string) => void;
      startNativeSpeech?: (language: string) => void;
      stopNativeSpeech?: () => void;
      speakNative?: (text: string, language: string) => void;
      getBatteryLevel?: () => number;
    };
  }
}

export const DEFAULT_APPS: AppItem[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    hindiName: 'यूट्यूब',
    packageName: 'com.google.android.youtube',
    aliases: ['youtube', 'yt', 'you tube', 'यूट्यूब', 'यूटूब'],
    category: 'media',
    icon: 'Youtube',
    deepLink: 'vnd.youtube://',
    webFallbackUrl: 'https://www.youtube.com',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    hindiName: 'फोनपे',
    packageName: 'com.phonepe.app',
    aliases: ['phonepe', 'phone pe', 'fonepe', 'फोनपे', 'फोन पे'],
    category: 'finance',
    icon: 'CreditCard',
    deepLink: 'phonepe://',
    webFallbackUrl: 'https://www.phonepe.com',
    isSensitive: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    hindiName: 'व्हाट्सएप',
    packageName: 'com.whatsapp',
    aliases: ['whatsapp', 'whats app', 'wa', 'व्हाट्सएप', 'व्हाट्स ऐप'],
    category: 'communication',
    icon: 'MessageCircle',
    deepLink: 'whatsapp://',
    webFallbackUrl: 'https://web.whatsapp.com',
  },
  {
    id: 'maps',
    name: 'Google Maps',
    hindiName: 'गूगल मैप्स',
    packageName: 'com.google.android.apps.maps',
    aliases: ['google maps', 'maps', 'map', 'navigation', 'गूगल मैप्स', 'मैप्स', 'रास्ता'],
    category: 'navigation',
    icon: 'MapPin',
    deepLink: 'geo:0,0?q=',
    webFallbackUrl: 'https://maps.google.com',
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    hindiName: 'क्रोम',
    packageName: 'com.android.chrome',
    aliases: ['chrome', 'google chrome', 'browser', 'क्रोम', 'ब्राउज़र'],
    category: 'utility',
    icon: 'Compass',
    webFallbackUrl: 'https://www.google.com',
  },
  {
    id: 'settings',
    name: 'Settings',
    hindiName: 'सेटिंग्स',
    packageName: 'com.android.settings',
    aliases: ['settings', 'setting', 'सेटिंग्स', 'सेटिंग'],
    category: 'tools',
    icon: 'Settings',
    deepLink: 'intent:#Intent;action=android.settings.SETTINGS;end',
    webFallbackUrl: '#inapp_settings',
  },
  {
    id: 'camera',
    name: 'Camera',
    hindiName: 'कैमरा',
    packageName: 'com.android.camera',
    aliases: ['camera', 'cam', 'photo', 'कैमरा', 'फोटो'],
    category: 'media',
    icon: 'Camera',
    deepLink: 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end',
    webFallbackUrl: '#inapp_camera',
  },
  {
    id: 'gallery',
    name: 'Gallery / Photos',
    hindiName: 'गैलरी',
    packageName: 'com.google.android.apps.photos',
    aliases: ['gallery', 'photos', 'photo gallery', 'गैलरी', 'तस्वीरें'],
    category: 'media',
    icon: 'Image',
    deepLink: 'intent:#Intent;action=android.intent.action.VIEW;type=image/*;end',
    webFallbackUrl: 'https://photos.google.com',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    hindiName: 'स्पॉटिफाई',
    packageName: 'com.spotify.music',
    aliases: ['spotify', 'music', 'songs', 'gaane', 'स्पॉटिफाई', 'गाने'],
    category: 'media',
    icon: 'Music',
    deepLink: 'spotify://',
    webFallbackUrl: 'https://open.spotify.com',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    hindiName: 'पेटीएम',
    packageName: 'net.one97.paytm',
    aliases: ['paytm', 'pay tm', 'पेटीएम'],
    category: 'finance',
    icon: 'CreditCard',
    deepLink: 'upi://pay',
    webFallbackUrl: 'https://paytm.com',
    isSensitive: true,
  },
  {
    id: 'gpay',
    name: 'Google Pay (GPay)',
    hindiName: 'गूगल पे',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    aliases: ['gpay', 'google pay', 'g pay', 'गूगल पे'],
    category: 'finance',
    icon: 'Wallet',
    deepLink: 'upi://pay',
    webFallbackUrl: 'https://pay.google.com',
    isSensitive: true,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    hindiName: 'कैलकुलेटर',
    packageName: 'com.google.android.calculator',
    aliases: ['calculator', 'calc', 'कैलकुलेटर', 'हिसाब'],
    category: 'tools',
    icon: 'Calculator',
    webFallbackUrl: '#inapp_calculator',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    hindiName: 'जीमेल',
    packageName: 'com.google.android.gm',
    aliases: ['gmail', 'email', 'mail', 'जीमेल', 'ईमेल'],
    category: 'communication',
    icon: 'Mail',
    deepLink: 'mailto:',
    webFallbackUrl: 'https://mail.google.com',
  },
  {
    id: 'dialer',
    name: 'Phone / Dialer',
    hindiName: 'फोन डायलर',
    packageName: 'com.google.android.dialer',
    aliases: ['phone', 'dialer', 'call', 'caller', 'फोन', 'कॉल', 'डायलर'],
    category: 'communication',
    icon: 'Phone',
    deepLink: 'tel:',
    isSensitive: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    hindiName: 'इंस्टाग्राम',
    packageName: 'com.instagram.android',
    aliases: ['instagram', 'insta', 'इंस्टाग्राम', 'इंस्टा'],
    category: 'social',
    icon: 'Instagram',
    deepLink: 'instagram://',
    webFallbackUrl: 'https://www.instagram.com',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    hindiName: 'टेलीग्राम',
    packageName: 'org.telegram.messenger',
    aliases: ['telegram', 'tg', 'टेलीग्राम'],
    category: 'social',
    icon: 'Send',
    deepLink: 'tg://',
    webFallbackUrl: 'https://web.telegram.org',
  },
  {
    id: 'playstore',
    name: 'Google Play Store',
    hindiName: 'प्ले स्टोर',
    packageName: 'com.android.vending',
    aliases: ['play store', 'playstore', 'store', 'प्ले स्टोर'],
    category: 'utility',
    icon: 'ShoppingBag',
    deepLink: 'market://',
    webFallbackUrl: 'https://play.google.com/store',
  },
];

class AndroidBridgeService {
  private customApps: AppItem[] = [];

  constructor() {
    this.loadCustomApps();
  }

  private loadCustomApps() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('jarvis_custom_apps');
      if (stored) {
        this.customApps = JSON.parse(stored);
      }
    } catch {
      this.customApps = [];
    }
  }

  public saveCustomApp(app: AppItem) {
    this.customApps = [...this.customApps.filter((a) => a.id !== app.id), app];
    try {
      localStorage.setItem('jarvis_custom_apps', JSON.stringify(this.customApps));
    } catch {
      // storage unavailable
    }
  }

  public getStatus(): NativeBridgeStatus {
    const isAvailable = Boolean(window.JarvisAndroidBridge?.isNativeCompanion?.());
    return {
      isAvailable,
      platform: isAvailable ? 'android-webview' : 'browser-pwa',
      installedAppCount: this.getAllApps().length,
      hasSpeechRecognizer: isAvailable || ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),
      hasTTS: isAvailable || ('speechSynthesis' in window),
    };
  }

  public getAllApps(): AppItem[] {
    // If native companion has discovered packages, merge them
    if (window.JarvisAndroidBridge?.getInstalledApps) {
      try {
        const nativeAppsJson = window.JarvisAndroidBridge.getInstalledApps();
        const nativeList = JSON.parse(nativeAppsJson) as { name: string; packageName: string }[];
        if (Array.isArray(nativeList) && nativeList.length > 0) {
          const mappedNative: AppItem[] = nativeList.map((item) => ({
            id: item.packageName,
            name: item.name,
            packageName: item.packageName,
            aliases: [item.name.toLowerCase()],
            category: 'utility',
            icon: 'Smartphone',
          }));
          return [...mappedNative, ...this.customApps];
        }
      } catch (e) {
        console.warn('Native installed apps query failed, using built-in registry', e);
      }
    }
    return [...DEFAULT_APPS, ...this.customApps];
  }

  public findAppByQuery(query: string): AppItem | null {
    const cleaned = query.toLowerCase().trim();
    const apps = this.getAllApps();

    // Exact name match
    const exact = apps.find((a) => a.name.toLowerCase() === cleaned || (a.hindiName && a.hindiName.toLowerCase() === cleaned));
    if (exact) return exact;

    // Alias match
    const byAlias = apps.find((a) =>
      a.aliases.some((alias) => cleaned.includes(alias) || alias.includes(cleaned))
    );
    if (byAlias) return byAlias;

    // Substring match
    const sub = apps.find((a) => cleaned.includes(a.name.toLowerCase()));
    return sub || null;
  }

  public async launchApp(app: AppItem): Promise<{ success: boolean; method: string; message: string }> {
    // 1. If running inside Native Android Companion WebView
    if (window.JarvisAndroidBridge?.launchApp) {
      const launched = window.JarvisAndroidBridge.launchApp(app.packageName);
      if (launched) {
        return {
          success: true,
          method: 'native-intent',
          message: `Opened ${app.name} via native Android Intent.`,
        };
      }
    }

    // 2. Check for In-App Web tools (Camera, Calculator, Settings, YouTube)
    if (app.webFallbackUrl?.startsWith('#inapp_')) {
      return {
        success: true,
        method: 'in-app',
        message: `Activating ${app.name} interface, Sir.`,
      };
    }

    // 3. Web URL fallback (WhatsApp, Maps, Spotify, YouTube, etc.)
    if (app.webFallbackUrl) {
      try {
        window.open(app.webFallbackUrl, '_blank', 'noopener,noreferrer');
        return {
          success: true,
          method: 'web-fallback',
          message: `Opened ${app.name} in browser display.`,
        };
      } catch {
        // ignore
      }
    }

    // 4. Deep link scheme if mobile device
    if (app.deepLink && !app.deepLink.startsWith('intent:')) {
      try {
        window.location.href = app.deepLink;
        return {
          success: true,
          method: 'deep-link',
          message: `Invoked mobile intent for ${app.name}.`,
        };
      } catch {
        // fall through
      }
    }

    // 5. Play store fallback if app not installed
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${app.packageName}`;
    window.open(playStoreUrl, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      method: 'play-store',
      message: `Navigating to Play Store to install ${app.name}.`,
    };
  }

  public openDialer(phoneNumber: string): boolean {
    if (window.JarvisAndroidBridge?.openDialer) {
      return window.JarvisAndroidBridge.openDialer(phoneNumber);
    }
    window.location.href = `tel:${encodeURIComponent(phoneNumber)}`;
    return true;
  }

  public searchYouTube(query: string): boolean {
    if (window.JarvisAndroidBridge?.openYouTubeSearch) {
      return window.JarvisAndroidBridge.openYouTubeSearch(query);
    }
    const clean = encodeURIComponent(query.trim());
    window.open(`https://www.youtube.com/results?search_query=${clean}`, '_blank');
    return true;
  }
}

export const androidBridge = new AndroidBridgeService();
