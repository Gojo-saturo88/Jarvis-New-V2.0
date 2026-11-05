package com.jarvis.assistant

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

        // Inject native JavaScript bridge
        webView.addJavascriptInterface(bridge, "JarvisAndroidBridge")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: android.webkit.PermissionRequest?) {
                request?.grant(request.resources)
            }
        }

        webView.webViewClient = WebViewClient()

        // Point to the hosted JARVIS web applet or local bundle
        val appUrl = getString(R.string.jarvis_app_url)
        webView.loadUrl(appUrl)
    }

    override fun onDestroy() {
        bridge.destroy()
        super.onDestroy()
    }
}
