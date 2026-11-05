package com.jarvis.assistant

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.webkit.JavascriptInterface
import android.webkit.WebView
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
            intent.`package` = "com.google.android.youtube"
            intent.putExtra("query", query)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            true
        } catch (e: Exception) {
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
            webView.evaluateJavascript("window.onNativeSpeechResult && window.onNativeSpeechResult('${transcript.replace("'", "\\'")}', $isFinal);", null)
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
}
