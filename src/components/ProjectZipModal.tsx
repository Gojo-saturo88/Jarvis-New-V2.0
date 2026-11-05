/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Github,
  Check,
  Copy,
  X,
  FolderArchive,
  Sparkles,
  KeyRound,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Terminal,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import JSZip from 'jszip';
import { playSound } from '../services/soundEffects';
import { deployToGitHub, GitHubDeployProgress } from '../services/githubDeployer';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface ProjectZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectZipModal: React.FC<ProjectZipModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'zip' | 'commands'>('deploy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // GitHub Deploy State
  const [githubToken, setGithubToken] = useState('');
  const [githubOwner, setGithubOwner] = useState('ritesh911868');
  const [githubRepo, setGithubRepo] = useState('New-Jarvis-V2.0');
  const [deployProgress, setDeployProgress] = useState<GitHubDeployProgress>({
    step: 'idle',
    message: '',
    progressPercent: 0,
  });

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Build the complete files bundle
  const getProjectFiles = (): Record<string, string> => {
    return {
      'README.md': `# JARVIS 4.0 — Stark Industries Holographic AI Assistant
Inspired by Tony Stark's JARVIS from Iron Man & Avengers.

## Core Capabilities
- **3D Holographic Globe & Orbital Ring Core**: Authentic golden particle globe with continents, orbital satellite tracks, and gyro rings.
- **Natural Voice & Reference Audio**: Authentic Stark JARVIS sound and metallic voice response.
- **Deep Internet Crawl & Search**: Multi-node web intelligence analyzer with source citation.
- **Email Notifications HUD**: Real-time Stark encrypted communication notifications.
- **Quantum Phone Dialer**: Mobile voice calls and contacts engine.
- **Android Companion App**: Native Kotlin project with Android WebView Bridge to launch any installed Android app.
- **Glass HUD OS**: Authentic frosted glass interface matching Stark design reference.

## Run Web App
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build Production
\`\`\`bash
npm run build
\`\`\`

## Android APK
Open the \`android/\` directory inside Android Studio and click Run or Build APK.
`,

      'package.json': JSON.stringify(
        {
          name: 'new-jarvis-v2.0',
          private: true,
          version: '4.0.0',
          type: 'module',
          scripts: {
            dev: 'vite --port=3000 --host=0.0.0.0',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {
            '@tailwindcss/vite': '^4.3.3',
            '@vitejs/plugin-react': '^6.1.1',
            jszip: '^3.10.2',
            'lucide-react': '^0.546.0',
            motion: '^12.23.24',
            react: '^19.0.1',
            'react-dom': '^19.0.1',
            three: '^0.187.0',
            vite: '^8.3.0',
          },
          devDependencies: {
            '@types/node': '^22.14.0',
            '@types/react': '^19.3.0',
            '@types/react-dom': '^19.3.0',
            '@types/three': '^0.187.0',
            tailwindcss: '^4.3.3',
            typescript: '^7.0.2',
          },
        },
        null,
        2
      ),

      '.gitignore': `node_modules/
dist/
.DS_Store
*.log
.env
.env.local
`,

      'android/settings.gradle.kts': `rootProject.name = "JARVIS Assistant"\ninclude(":app")\n`,

      'android/build.gradle.kts': `plugins {\n    id("com.android.application") version "8.7.2" apply false\n    id("org.jetbrains.kotlin.android") version "2.0.21" apply false\n}\n`,

      'android/app/build.gradle.kts': `plugins {\n    id("com.android.application")\n    id("org.jetbrains.kotlin.android")\n}\n\nandroid {\n    namespace = "com.jarvis.assistant"\n    compileSdk = 35\n    defaultConfig {\n        applicationId = "com.jarvis.assistant"\n        minSdk = 26\n        targetSdk = 35\n        versionCode = 4\n        versionName = "4.0.0"\n    }\n}\ndependencies {\n    implementation("androidx.core:core-ktx:1.15.0")\n    implementation("androidx.appcompat:appcompat:1.7.0")\n    implementation("com.google.android.material:material:1.12.0")\n    implementation("androidx.webkit:webkit:1.12.1")\n}\n`,

      'android/app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.jarvis.assistant">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    <application
        android:allowBackup="true"
        android:label="JARVIS 4.0"
        android:theme="@style/Theme.AppCompat.NoActionBar">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,

      'android/app/src/main/java/com/jarvis/assistant/MainActivity.kt': `package com.jarvis.assistant

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebSettings
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val webView = WebView(this)
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        setContentView(webView)
        
        // Connect native Android bridge
        webView.addJavascriptInterface(JarvisAndroidBridge(this), "JarvisAndroid")
        webView.loadUrl("https://ais-dev-brw3e2jsqr4253viu3223x-995776517888.asia-east1.run.app")
    }
}`,

      'android/app/src/main/java/com/jarvis/assistant/JarvisAndroidBridge.kt': `package com.jarvis.assistant

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.JavascriptInterface

class JarvisAndroidBridge(private val context: Context) {
    @JavascriptInterface
    fun launchApp(packageName: String): Boolean {
        return try {
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else false
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun openWebUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }
}`
    };
  };

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    playSound('pulse');

    try {
      const zip = new JSZip();
      const files = getProjectFiles();

      for (const [path, content] of Object.entries(files)) {
        zip.file(path, content);
      }

      // Generate the ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });

      // Trigger instant browser download
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'New-Jarvis-V2.0-Complete.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(true);
      playSound('success');
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectDeploy = async () => {
    if (!githubToken.trim()) {
      setDeployProgress({
        step: 'error',
        message: 'Please enter your GitHub Personal Access Token (PAT).',
        progressPercent: 0,
        error: 'Token is required',
      });
      return;
    }

    playSound('pulse');
    try {
      const files = getProjectFiles();
      await deployToGitHub(
        githubToken,
        githubOwner,
        githubRepo,
        files,
        'JARVIS 4.0: Holographic AI Assistant with Glass HUD & Android Companion',
        (prog) => {
          setDeployProgress(prog);
          if (prog.step === 'success') {
            playSound('success');
          }
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeployProgress({
        step: 'error',
        message: msg,
        progressPercent: 0,
        error: msg,
      });
      playSound('alert');
    }
  };

  const gitCommands = `git init
git add .
git commit -m "JARVIS 4.0 - New Jarvis V2.0 Complete Update"
git branch -M main
git remote add origin https://github.com/${githubOwner}/${githubRepo}.git
git push -u origin main`;

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[92vh]"
      className="holo-panel rounded-2xl flex flex-col border border-amber-500/40 shadow-2xl bg-stone-950/95"
      accentColor="amber"
    >
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Github className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono flex items-center gap-2">
                <span>GITHUB DEPLOYMENT // NEW JARVIS V2.0</span>
                <span className="px-2 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                  READY
                </span>
              </h3>
              <p className="text-[10px] font-mono text-stone-400">
                DIRECT PUSH TO GITHUB REPOSITORY &bull; PROJECT ZIP &bull; TERMINAL COMMANDS
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

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/90 px-4 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-2.5 px-3 flex items-center gap-2 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'deploy'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>1-CLICK GITHUB PUSH</span>
          </button>
          <button
            onClick={() => setActiveTab('zip')}
            className={`pb-2.5 px-3 flex items-center gap-2 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'zip'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>DOWNLOAD ZIP</span>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`pb-2.5 px-3 flex items-center gap-2 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'commands'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>GIT COMMANDS</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-stone-900/60 to-stone-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Direct GitHub In-Browser Deployment
                  </span>
                  <a
                    href="https://github.com/settings/tokens/new?description=JARVIS+4.0+Deploy&scopes=repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Get GitHub Token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-stone-300 text-xs leading-relaxed">
                  Bhai, GitHub direct authentication ke liye apna <strong>Personal Access Token (PAT)</strong>{' '}
                  yahan enter karo. Yeh seedha aapke repo <code>{githubOwner}/{githubRepo}</code> me saari files
                  commit &amp; push kar dega!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 mb-1">
                      GITHUB USERNAME:
                    </label>
                    <input
                      type="text"
                      value={githubOwner}
                      onChange={(e) => setGithubOwner(e.target.value)}
                      placeholder="e.g. ritesh911868"
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 mb-1">
                      REPOSITORY NAME:
                    </label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="e.g. New-Jarvis-V2.0"
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-400 mb-1 flex items-center justify-between">
                    <span>GITHUB PERSONAL ACCESS TOKEN (PAT):</span>
                    <span className="text-[9px] text-stone-400">Format: ghp_... (needs 'repo' permission)</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="Paste your GitHub token here (ghp_...)"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-amber-300 font-mono text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* Progress & Status Box */}
                {deployProgress.step !== 'idle' && (
                  <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 text-stone-300">
                        {deployProgress.step === 'uploading' ||
                        deployProgress.step === 'authenticating' ||
                        deployProgress.step === 'checking_repo' ||
                        deployProgress.step === 'committing' ? (
                          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        ) : deployProgress.step === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span>{deployProgress.message}</span>
                      </span>
                      <span className="text-amber-400 font-bold">{deployProgress.progressPercent}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          deployProgress.step === 'error'
                            ? 'bg-red-500'
                            : deployProgress.step === 'success'
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${deployProgress.progressPercent}%` }}
                      />
                    </div>

                    {deployProgress.repoUrl && (
                      <a
                        href={deployProgress.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-mono text-[11px] pt-1"
                      >
                        <span>View Deployed Code on GitHub ({deployProgress.repoUrl})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                <button
                  onClick={handleDirectDeploy}
                  disabled={
                    deployProgress.step === 'uploading' ||
                    deployProgress.step === 'authenticating' ||
                    deployProgress.step === 'committing'
                  }
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-stone-950 font-bold font-mono text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Rocket className="w-4 h-4" />
                  <span>
                    {deployProgress.step === 'uploading' || deployProgress.step === 'committing'
                      ? 'DEPLOYING TO GITHUB...'
                      : deployProgress.step === 'success'
                      ? 'RE-DEPLOY / PUSH AGAIN'
                      : `PUSH TO GITHUB (${githubRepo})`}
                  </span>
                </button>
              </div>

              {/* Instructions on how to get token */}
              <div className="p-3.5 rounded-xl bg-stone-900/50 border border-stone-800 text-[11px] text-stone-400 space-y-1.5 leading-relaxed font-sans">
                <div className="font-bold text-stone-300 font-mono flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>How to create your GitHub token (1 minute process):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>
                    Open{' '}
                    <a
                      href="https://github.com/settings/tokens/new?description=JARVIS+4.0&scopes=repo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      github.com/settings/tokens/new
                    </a>
                  </li>
                  <li>Check the <strong>"repo"</strong> checkbox (Full control of private repositories).</li>
                  <li>Click <strong>Generate token</strong> at the bottom.</li>
                  <li>Copy the token (starts with <code>ghp_...</code>) and paste it in the box above!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'zip' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-stone-900/90 to-stone-950 border border-amber-500/40 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-stone-100 text-base font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Download Complete JARVIS 4.0 Source (.ZIP)</span>
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    Includes complete React + Three.js frontend, Kotlin Android companion app, and step-by-step setup guides. Works directly on any phone, tablet, or laptop.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:scale-[1.01] active:scale-[0.99] text-stone-950 font-bold font-mono text-sm gold-glow flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isGenerating
                    ? 'GENERATING ARCHIVE...'
                    : downloadSuccess
                    ? 'ARCHIVE DOWNLOADED (CLICK TO RE-DOWNLOAD)'
                    : 'DOWNLOAD PROJECT ZIP NOW'}
                </span>
              </button>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-3 bg-stone-950/70 p-4 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-200 font-mono font-bold">
                  <Github className="w-4 h-4 text-amber-400" />
                  <span>HOW TO PUSH FROM YOUR TERMINAL / LAPTOP</span>
                </div>
                <button
                  onClick={() => copyText(gitCommands, 'git')}
                  className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700 font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copied === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === 'git' ? 'COPIED' : 'COPY COMMANDS'}</span>
                </button>
              </div>

              <p className="text-stone-400 text-xs">
                Run these commands in your project folder to push to your repository:
              </p>

              <pre className="p-3 bg-stone-950 rounded-lg border border-stone-800 font-mono text-[11px] text-amber-300 overflow-x-auto leading-relaxed">
                {gitCommands}
              </pre>
            </div>
          )}
        </div>
    </HolographicModalWrapper>
  );
};
