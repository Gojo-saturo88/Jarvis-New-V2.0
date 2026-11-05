import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Terminal,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface AndroidCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNativeCompanion: boolean;
}

export const AndroidCompanionModal: React.FC<AndroidCompanionModalProps> = ({
  isOpen,
  onClose,
  isNativeCompanion,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'main_activity' | 'bridge' | 'manifest' | 'gradle'>('guide');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeSnippets = {
    main_activity: `package com.jarvis.assistant

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var bridge: JarvisAndroidBridge

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.jarvisWebView)
        bridge = JarvisAndroidBridge(this, webView)

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = false
        settings.mediaPlaybackRequiresUserGesture = false

        // Attach native JavaScript interface
        webView.addJavascriptInterface(bridge, "JarvisAndroidBridge")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: android.webkit.PermissionRequest?) {
                // Grant microphone and audio recording permission to WebView
                request?.grant(request.resources)
            }
        }

        webView.webViewClient = WebViewClient()

        // Point to your hosted JARVIS URL or local assets
        val appUrl = getString(R.string.jarvis_app_url)
        webView.loadUrl(appUrl)
    }

    override fun onDestroy() {
        bridge.destroy()
        super.onDestroy()
    }
}`,
    bridge: `package com.jarvis.assistant

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.BatteryManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

class JarvisAndroidBridge(
    private val context: Context,
    private val webView: WebView
) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context, this)
    private var speechRecognizer: SpeechRecognizer? = null

    init {
        initSpeechRecognizer()
    }

    @JavascriptInterface
    fun isNativeCompanion(): Boolean = true

    @JavascriptInterface
    fun launchApp(packageName: String): Boolean {
        return try {
            val pm: PackageManager = context.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else {
                // Fall back to Play Store
                val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName"))
                marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(marketIntent)
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    @JavascriptInterface
    fun getInstalledApps(): String {
        val array = JSONArray()
        try {
            val pm: PackageManager = context.packageManager
            val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            for (appInfo in packages) {
                // Filter launchable user apps
                if (pm.getLaunchIntentForPackage(appInfo.packageName) != null) {
                    val obj = JSONObject()
                    obj.put("name", pm.getApplicationLabel(appInfo).toString())
                    obj.put("packageName", appInfo.packageName)
                    array.put(obj)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return array.toString()
    }

    @JavascriptInterface
    fun openDialer(phoneNumber: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phoneNumber"))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun openYouTubeSearch(query: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_SEARCH)
            intent.setPackage("com.google.android.youtube")
            intent.putExtra("query", query)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            // Web fallback
            val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=$query"))
            webIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(webIntent)
            false
        }
    }

    @JavascriptInterface
    fun speakNative(text: String, language: String) {
        tts?.let { engine ->
            val locale = if (language.startsWith("hi")) Locale("hi", "IN") else Locale("en", "IN")
            engine.language = locale
            engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "JARVIS_TTS")
        }
    }

    @JavascriptInterface
    fun startNativeSpeech(language: String) {
        webView.post {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, if (language.startsWith("hi")) "hi-IN" else "en-IN")
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            }
            speechRecognizer?.startListening(intent)
        }
    }

    @JavascriptInterface
    fun stopNativeSpeech() {
        webView.post {
            speechRecognizer?.stopListening()
        }
    }

    private fun initSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val text = matches?.firstOrNull() ?: ""
                        notifyWebSpeechResult(text, true)
                    }
                    override fun onPartialResults(partialResults: Bundle?) {
                        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val text = matches?.firstOrNull() ?: ""
                        notifyWebSpeechResult(text, false)
                    }
                    override fun onReadyForSpeech(params: Bundle?) {}
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onError(error: Int) {}
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }
        }
    }

    private fun notifyWebSpeechResult(transcript: String, isFinal: Boolean) {
        webView.post {
            webView.evaluateJavascript("window.onNativeSpeechResult && window.onNativeSpeechResult('\\" + transcript.replace("'", "\\\\'") + "\\", " + isFinal + ");", null)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale("en", "IN")
        }
    }

    fun destroy() {
        tts?.shutdown()
        speechRecognizer?.destroy()
    }
}`,
    manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.jarvis.assistant">

    <!-- Free voice recognition & audio recording permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Query installed launchable apps -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" 
        tools:ignore="QueryAllPackagesPermission" />

    <!-- Calling intent permission (User confirmation modal strictly enforced) -->
    <uses-permission android:name="android.permission.CALL_PHONE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="JARVIS 4.0"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.JARVIS"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.JARVIS.Fullscreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    gradle: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.jarvis.assistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.jarvis.assistant"
        minSdk = 26
        targetSdk = 35
        versionCode = 4
        versionName = "4.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.webkit)
} `,
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      maxHeight="max-h-[90vh]"
      className="holo-panel rounded-2xl flex flex-col border border-amber-500/40 shadow-2xl"
      accentColor="amber"
    >
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
                JARVIS 4.0 // ANDROID NATIVE COMPANION
              </h3>
              <p className="text-[11px] font-mono text-stone-400">
                Kotlin Native Bridge • App Launcher • SpeechRecognizer • TextToSpeech
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-2 bg-stone-950/50 border-b border-stone-800 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            SETUP & APK GUIDE
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'bridge'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            JarvisAndroidBridge.kt
          </button>
          <button
            onClick={() => setActiveTab('main_activity')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'main_activity'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            MainActivity.kt
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'manifest'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            AndroidManifest.xml
          </button>
          <button
            onClick={() => setActiveTab('gradle')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'gradle'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            build.gradle.kts
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {activeTab === 'guide' && (
            <div className="space-y-4 text-stone-300">
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isNativeCompanion
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-bold font-mono">
                      {isNativeCompanion
                        ? 'NATIVE ANDROID COMPANION DETECTED'
                        : 'STANDALONE BROWSER / PWA MODE ACTIVE'}
                    </h4>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {isNativeCompanion
                        ? 'All hardware intents and direct package launchers are executing natively without browser dialogs.'
                        : 'Running in Web environment. Standard deep-links, web intents, and browser speech APIs are fully active.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by Step Android Studio Instructions */}
              <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-amber-400 font-mono text-sm">
                  HOW TO BUILD & INSTALL THE ANDROID COMPANION APK
                </h4>

                <ol className="list-decimal list-inside space-y-2 text-stone-300 leading-relaxed font-sans">
                  <li>
                    <strong>Open Android Studio</strong> (Ladybug / Koala or newer) and select{' '}
                    <span className="text-amber-300 font-mono">New Project &rarr; Empty Views Activity</span>.
                  </li>
                  <li>
                    Set Package Name to{' '}
                    <span className="text-amber-300 font-mono">com.jarvis.assistant</span> and Language to{' '}
                    <strong className="text-amber-300 font-mono">Kotlin</strong>.
                  </li>
                  <li>
                    Copy the Kotlin files from the tabs above:
                    <ul className="list-disc list-inside ml-4 mt-1 text-stone-400">
                      <li>
                        <code className="text-amber-300">JarvisAndroidBridge.kt</code> &rarr;{' '}
                        <code>app/src/main/java/com/jarvis/assistant/</code>
                      </li>
                      <li>
                        <code className="text-amber-300">MainActivity.kt</code> &rarr;{' '}
                        <code>app/src/main/java/com/jarvis/assistant/</code>
                      </li>
                      <li>
                        <code className="text-amber-300">AndroidManifest.xml</code> &rarr;{' '}
                        <code>app/src/main/AndroidManifest.xml</code>
                      </li>
                    </ul>
                  </li>
                  <li>
                    In <code className="text-amber-300">res/values/strings.xml</code>, add your hosted web applet URL:
                    <pre className="p-2 bg-stone-900 rounded font-mono text-[11px] text-amber-200 mt-1">
                      {`<string name="jarvis_app_url">${window.location.origin}</string>`}
                    </pre>
                  </li>
                  <li>
                    Connect your physical Android phone with USB Debugging enabled, or select an emulator.
                  </li>
                  <li>
                    Click <span className="text-emerald-400 font-mono font-bold">Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)</span>.
                  </li>
                  <li>
                    Transfer the generated <code className="text-amber-300">app-debug.apk</code> to your device and tap Install!
                  </li>
                </ol>
              </div>

              {/* Safety Architecture Note */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-stone-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>SAFETY ARCHITECTURE GUARANTEE</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  The Android bridge delegates financial operations (PhonePe, Paytm, GPay) directly to the official banking applications. JARVIS never intercepts UPI credentials or biometric signatures.
                </p>
              </div>
            </div>
          )}

          {activeTab !== 'guide' && (
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-stone-400 text-[11px]">
                  {activeTab === 'bridge'
                    ? 'JarvisAndroidBridge.kt (Bridge between JS & Android SDK)'
                    : activeTab === 'main_activity'
                    ? 'MainActivity.kt (Hardware WebView host)'
                    : activeTab === 'manifest'
                    ? 'AndroidManifest.xml (Intent & Speech Permissions)'
                    : 'build.gradle.kts (Dependencies)'}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      codeSnippets[activeTab as keyof typeof codeSnippets],
                      activeTab
                    )
                  }
                  className="px-3 py-1 rounded bg-stone-800 hover:bg-amber-500/20 text-amber-300 border border-stone-700 hover:border-amber-400 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied === activeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY CODE</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-stone-950 rounded-xl border border-stone-800 font-mono text-[11px] text-amber-200 overflow-x-auto leading-relaxed max-h-[55vh]">
                {codeSnippets[activeTab as keyof typeof codeSnippets]}
              </pre>
            </div>
          )}
        </div>
    </HolographicModalWrapper>
  );
};
