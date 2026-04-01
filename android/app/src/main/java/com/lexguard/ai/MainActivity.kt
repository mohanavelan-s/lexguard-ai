package com.lexguard.ai

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

/**
 * MainActivity — Full-screen WebView that loads the LexGuard AI Flask app.
 *
 * ROUND 1 FIXES (preserved):
 *  1. Scroll Reloading   — SwipeRefreshLayout disabled when WebView not at top
 *  2. UI Not Mobile       — Viewport meta injected, fitsSystemWindows in layout
 *  3. Permissions          — Runtime permission requests via ActivityResultContracts
 *  4. Legal Advisor Empty  — Fixed SERVER_URL, enabled cookies/sessions
 *  5. Case Lookup Error    — Cookies fix enables Flask session
 *  6. Scanner Upload       — onShowFileChooser + file picker via GetContent contract
 *  7. Protect Me           — onGeolocationPermissionsShowPrompt + permission handling
 *
 * ROUND 2 ENHANCEMENTS:
 *  A. Legal Advisor offline fallback via AndroidBridge + LegalKnowledgeBase
 *  B. Protect Me local history via ProtectHistory + SharedPreferences
 *  C. JavaScript bridge (AndroidBridge) for native-web communication
 *  D. CSS injection for mobile UI polish (navbar, cards, dropdown)
 *  E. Download handling for evidence files
 *  F. Performance: cache mode, cookie persistence, no redundant reloads
 *  G. Language dropdown fix (CSS padding for system bars)
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var offlineView: View
    private lateinit var retryButton: Button
    private lateinit var protectHistory: ProtectHistory

    companion object {
        private const val TAG = "LexGuardAI"
        // BuildConfig.SERVER_URL comes from -PlexguardServerUrl or LEXGUARD_SERVER_URL.
        // The default points at the live Railway deployment so the APK no longer depends on ngrok.
        val SERVER_URL = BuildConfig.SERVER_URL
    }

    // ── File chooser for Document Scanner ──
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            Log.d(TAG, "File selected: $uri")
            fileChooserCallback?.onReceiveValue(arrayOf(uri))
        } else {
            fileChooserCallback?.onReceiveValue(null)
        }
        fileChooserCallback = null
    }

    // ── Runtime permission launcher ──
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        permissions.forEach { (perm, granted) ->
            Log.d(TAG, "Permission $perm: ${if (granted) "GRANTED" else "DENIED"}")
        }

        // Handle pending geolocation callback
        if (pendingGeoCallback != null) {
            val locationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
            pendingGeoCallback?.invoke(pendingGeoOrigin, locationGranted, false)
            pendingGeoCallback = null
            pendingGeoOrigin = null
        }

        // Handle pending WebView permission request
        pendingWebPermissionRequest?.let { req ->
            val grantedResources = mutableListOf<String>()
            for (resource in req.resources) {
                when (resource) {
                    PermissionRequest.RESOURCE_AUDIO_CAPTURE -> {
                        if (permissions[Manifest.permission.RECORD_AUDIO] == true) {
                            grantedResources.add(resource)
                        }
                    }
                    PermissionRequest.RESOURCE_VIDEO_CAPTURE -> {
                        if (permissions[Manifest.permission.CAMERA] == true) {
                            grantedResources.add(resource)
                        }
                    }
                    else -> grantedResources.add(resource)
                }
            }
            if (grantedResources.isNotEmpty()) {
                req.grant(grantedResources.toTypedArray())
            } else {
                req.deny()
            }
            pendingWebPermissionRequest = null
        }
    }

    // Pending callbacks
    private var pendingGeoCallback: GeolocationPermissions.Callback? = null
    private var pendingGeoOrigin: String? = null
    private var pendingWebPermissionRequest: PermissionRequest? = null

    // Track last loaded URL to avoid redundant reloads
    private var lastLoadedUrl: String? = null

    // =========================================================
    //  JAVASCRIPT BRIDGE — Exposes native features to web pages
    // =========================================================

    @Suppress("unused") // Methods called from JavaScript
    inner class AndroidBridge {

        /**
         * ENHANCEMENT A: Offline legal advisor fallback.
         * Called from injected JS when /api/legal fails.
         */
        @JavascriptInterface
        fun getOfflineLegalAdvice(question: String): String {
            Log.d(TAG, "AndroidBridge.getOfflineLegalAdvice: $question")
            return LegalKnowledgeBase.legalAdvice(question)
        }

        /**
         * ENHANCEMENT B: Save a Protect Me event to local storage.
         */
        @JavascriptInterface
        fun saveProtectEvent(
            timestamp: String,
            latitude: String,
            longitude: String,
            eventType: String,
            duration: Int
        ) {
            Log.d(TAG, "AndroidBridge.saveProtectEvent: $eventType at $latitude,$longitude")
            protectHistory.saveEvent(timestamp, latitude, longitude, eventType, duration)
        }

        /**
         * ENHANCEMENT B: Get Protect Me history from local storage.
         */
        @JavascriptInterface
        fun getProtectHistory(): String {
            return protectHistory.getHistory()
        }

        /**
         * ENHANCEMENT B: Clear Protect Me history.
         */
        @JavascriptInterface
        fun clearProtectHistory() {
            protectHistory.clearHistory()
        }

        /**
         * Check if device is online.
         */
        @JavascriptInterface
        fun isOnline(): Boolean {
            return isNetworkAvailable()
        }

        /**
         * Show a native toast message.
         */
        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }
    }

    // =========================================================
    //  LIFECYCLE
    // =========================================================

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize local storage
        protectHistory = ProtectHistory(this)

        // Bind views
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        offlineView = findViewById(R.id.offlineView)
        retryButton = findViewById(R.id.retryButton)

        // ENHANCEMENT F: Enable cookie handling for Flask session support
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // Configure WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            loadWithOverviewMode = true
            useWideViewPort = true
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            // ENHANCEMENT F: Cache for performance — use cache when available
            cacheMode = if (isNetworkAvailable()) {
                WebSettings.LOAD_DEFAULT
            } else {
                WebSettings.LOAD_CACHE_ELSE_NETWORK
            }
            userAgentString = "LexGuardAI-Android/1.0"
            setGeolocationEnabled(true)
            @Suppress("DEPRECATION")
            allowFileAccessFromFileURLs = true
            @Suppress("DEPRECATION")
            allowUniversalAccessFromFileURLs = true
            mediaPlaybackRequiresUserGesture = false
        }

        // ENHANCEMENT C: Register JavaScript bridge
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        // ── WebViewClient ──
        webView.webViewClient = object : WebViewClient() {

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
                offlineView.visibility = View.GONE
                webView.visibility = View.VISIBLE
                lastLoadedUrl = url

                // ENHANCEMENT D: Inject viewport meta tag if missing
                injectViewportMeta(view)

                // ENHANCEMENT D/G: Inject mobile CSS fixes
                injectMobileCSS(view)

                // ENHANCEMENT A: Inject offline fallback for Legal Advisor
                if (url?.contains("/legal-advisor") == true) {
                    injectLegalAdvisorFallback(view)
                }

                // ENHANCEMENT B: Inject Protect Me local history hooks
                if (url?.contains("/protect") == true) {
                    injectProtectMeEnhancements(view)
                }
            }

            override fun onReceivedError(
                view: WebView?, request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    webView.visibility = View.GONE
                    offlineView.visibility = View.VISIBLE
                    progressBar.visibility = View.GONE
                    swipeRefresh.isRefreshing = false
                }
            }
        }

        // ── WebChromeClient ──
        webView.webChromeClient = object : WebChromeClient() {

            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }

            // Document Scanner file chooser
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback

                val acceptTypes = fileChooserParams?.acceptTypes
                val mimeType = if (!acceptTypes.isNullOrEmpty() && acceptTypes[0].isNotBlank()) {
                    acceptTypes[0]
                } else {
                    "*/*"
                }

                try {
                    fileChooserLauncher.launch(mimeType)
                } catch (e: Exception) {
                    Log.e(TAG, "File chooser launch failed: ${e.message}")
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = null
                    Toast.makeText(
                        this@MainActivity,
                        "Cannot open file picker. Please check app permissions.",
                        Toast.LENGTH_SHORT
                    ).show()
                    return false
                }
                return true
            }

            // Protect Me geolocation
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                val hasPermission = ContextCompat.checkSelfPermission(
                    this@MainActivity, Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED

                if (hasPermission) {
                    callback?.invoke(origin, true, false)
                } else {
                    pendingGeoCallback = callback
                    pendingGeoOrigin = origin
                    permissionLauncher.launch(
                        arrayOf(
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                        )
                    )
                }
            }

            // WebView permission requests (mic, camera)
            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.let { req ->
                    val grantedResources = mutableListOf<String>()

                    for (resource in req.resources) {
                        when (resource) {
                            PermissionRequest.RESOURCE_AUDIO_CAPTURE -> {
                                if (ContextCompat.checkSelfPermission(
                                        this@MainActivity, Manifest.permission.RECORD_AUDIO
                                    ) == PackageManager.PERMISSION_GRANTED
                                ) {
                                    grantedResources.add(resource)
                                } else {
                                    pendingWebPermissionRequest = req
                                    permissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
                                    return
                                }
                            }
                            PermissionRequest.RESOURCE_VIDEO_CAPTURE -> {
                                if (ContextCompat.checkSelfPermission(
                                        this@MainActivity, Manifest.permission.CAMERA
                                    ) == PackageManager.PERMISSION_GRANTED
                                ) {
                                    grantedResources.add(resource)
                                } else {
                                    pendingWebPermissionRequest = req
                                    permissionLauncher.launch(arrayOf(Manifest.permission.CAMERA))
                                    return
                                }
                            }
                            else -> grantedResources.add(resource)
                        }
                    }

                    if (grantedResources.isNotEmpty()) {
                        req.grant(grantedResources.toTypedArray())
                    } else {
                        req.deny()
                    }
                }
            }
        }

        // FIX 1: Only allow pull-to-refresh when WebView is scrolled to top
        webView.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            swipeRefresh.isEnabled = scrollY == 0
        }

        // Pull-to-refresh
        swipeRefresh.setColorSchemeColors(
            resources.getColor(R.color.accent_blue, theme)
        )
        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }

        // ENHANCEMENT E: Download handling for evidence files
        webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, contentLength ->
            try {
                val request = DownloadManager.Request(Uri.parse(url))
                request.setMimeType(mimeType)
                request.addRequestHeader("User-Agent", userAgent)
                val fileName = URLUtil.guessFileName(url, contentDisposition, mimeType)
                request.setTitle(fileName)
                request.setDescription("Downloading evidence file...")
                request.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
                )
                request.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS, fileName
                )
                val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Toast.makeText(this, "Downloading: $fileName", Toast.LENGTH_SHORT).show()
                Log.d(TAG, "Download started: $fileName ($contentLength bytes)")
            } catch (e: Exception) {
                Log.e(TAG, "Download failed: ${e.message}")
                Toast.makeText(this, "Download failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }

        // Retry button (offline screen)
        retryButton.setOnClickListener {
            loadApp()
        }

        // Request critical permissions on app start
        requestCriticalPermissions()

        // Load the app
        loadApp()
    }

    // =========================================================
    //  JAVASCRIPT INJECTION METHODS
    // =========================================================

    /**
     * ENHANCEMENT D: Inject viewport meta tag if missing.
     */
    private fun injectViewportMeta(view: WebView?) {
        view?.evaluateJavascript("""
            (function() {
                if (!document.querySelector('meta[name="viewport"]')) {
                    var meta = document.createElement('meta');
                    meta.name = 'viewport';
                    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
                    document.head.appendChild(meta);
                }
            })();
        """.trimIndent(), null)
    }

    /**
     * ENHANCEMENT D/G: Inject mobile CSS fixes.
     * Fixes: navbar padding, dropdown clipping, card edges, typography, smooth scroll.
     */
    private fun injectMobileCSS(view: WebView?) {
        view?.evaluateJavascript("""
            (function() {
                if (document.getElementById('lexguard-mobile-css')) return;
                var style = document.createElement('style');
                style.id = 'lexguard-mobile-css';
                style.textContent = `
                    /* ENHANCEMENT G: Fix language dropdown clipping after reload */
                    .top-navbar {
                        padding-top: max(14px, env(safe-area-inset-top, 14px)) !important;
                        overflow: visible !important;
                        position: sticky !important;
                        top: 0 !important;
                        z-index: 1000 !important;
                    }

                    /* Fix dropdown not getting clipped */
                    .lang-dropdown {
                        position: relative !important;
                        z-index: 1001 !important;
                        -webkit-appearance: menulist !important;
                        min-width: 100px !important;
                    }

                    /* ENHANCEMENT D: Fix card edge clipping */
                    .container {
                        padding: 16px !important;
                        box-sizing: border-box !important;
                        max-width: 100vw !important;
                        overflow-x: hidden !important;
                    }

                    .grid {
                        gap: 12px !important;
                        padding: 0 !important;
                    }

                    .card {
                        margin: 0 !important;
                        border-radius: 12px !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    /* Smooth scroll behavior */
                    html {
                        scroll-behavior: smooth !important;
                    }

                    /* Typography improvements */
                    body {
                        -webkit-text-size-adjust: 100% !important;
                        text-size-adjust: 100% !important;
                        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    }

                    /* Fix auth container on mobile */
                    .auth-container {
                        max-width: calc(100vw - 32px) !important;
                        margin: 16px !important;
                        box-sizing: border-box !important;
                    }

                    /* Ensure inputs don't overflow */
                    input, textarea, select, button {
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }

                    /* Fix legal advisor results section */
                    .legal-content, .results-section {
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                    }

                    .law-detail {
                        max-width: 100% !important;
                        overflow: hidden !important;
                    }

                    /* Fix status panel and controls in Protect Me */
                    .status-panel {
                        padding: 12px !important;
                        border-radius: 10px !important;
                    }

                    .controls button {
                        padding: 12px 20px !important;
                        font-size: 0.95rem !important;
                        border-radius: 8px !important;
                    }

                    /* Smooth transitions for interactive elements */
                    a, button, .card {
                        transition: all 0.2s ease !important;
                    }

                    /* Scrollbar styling */
                    ::-webkit-scrollbar {
                        width: 4px;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: rgba(74, 158, 255, 0.3);
                        border-radius: 4px;
                    }

                    /* ENHANCEMENT B: Protect history section styling */
                    .protect-history-section {
                        margin-top: 20px;
                        padding: 16px;
                        background: rgba(20, 30, 48, 0.9);
                        border-radius: 12px;
                        border: 1px solid rgba(74, 158, 255, 0.15);
                    }
                    .protect-history-section h3 {
                        color: #4a9eff;
                        margin-bottom: 12px;
                        font-size: 1.1rem;
                    }
                    .history-event {
                        padding: 10px 14px;
                        margin-bottom: 8px;
                        background: rgba(30, 40, 60, 0.8);
                        border-radius: 8px;
                        border-left: 3px solid #4a9eff;
                        font-size: 0.85rem;
                        color: #cbd5e1;
                    }
                    .history-event .event-time {
                        color: #94a3b8;
                        font-size: 0.75rem;
                    }
                    .history-event .event-type {
                        color: #4a9eff;
                        font-weight: 600;
                    }
                    .history-empty {
                        color: #64748b;
                        text-align: center;
                        padding: 20px;
                        font-style: italic;
                    }
                    .history-clear-btn {
                        margin-top: 10px;
                        padding: 8px 16px;
                        background: rgba(248, 113, 113, 0.15);
                        color: #f87171;
                        border: 1px solid rgba(248, 113, 113, 0.3);
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.85rem;
                    }
                `;
                document.head.appendChild(style);
            })();
        """.trimIndent(), null)
    }

    /**
     * ENHANCEMENT A: Inject offline fallback for Legal Advisor.
     * Overrides the fetch call to /api/legal — if it fails, uses AndroidBridge.
     */
    private fun injectLegalAdvisorFallback(view: WebView?) {
        view?.evaluateJavascript("""
            (function() {
                if (window._lexguardOfflinePatched) return;
                window._lexguardOfflinePatched = true;

                // Store original fetch
                const originalFetch = window.fetch;

                // Override fetch to intercept /api/legal calls
                window.fetch = function(url, options) {
                    if (typeof url === 'string' && url.includes('/api/legal')) {
                        return originalFetch(url, options)
                            .then(function(response) {
                                if (!response.ok) {
                                    throw new Error('Server error: ' + response.status);
                                }
                                return response;
                            })
                            .catch(function(error) {
                                console.log('[LexGuard] API failed, using offline fallback:', error.message);

                                // Extract question from request body
                                var question = '';
                                try {
                                    var body = JSON.parse(options.body);
                                    question = body.question || '';
                                } catch(e) {}

                                // Use Android bridge for offline response
                                if (window.AndroidBridge) {
                                    var offlineResult = window.AndroidBridge.getOfflineLegalAdvice(question);
                                    console.log('[LexGuard] Offline result:', offlineResult);

                                    // Create a mock Response object
                                    return new Response(offlineResult, {
                                        status: 200,
                                        headers: { 'Content-Type': 'application/json' }
                                    });
                                } else {
                                    throw error;
                                }
                            });
                    }
                    return originalFetch(url, options);
                };

                console.log('[LexGuard] Offline fallback injected for Legal Advisor');
            })();
        """.trimIndent(), null)
    }

    /**
     * ENHANCEMENT B: Inject Protect Me local history hooks.
     * Hooks into startProtection/stopProtection to save events,
     * and adds a "View History" section to the page.
     */
    private fun injectProtectMeEnhancements(view: WebView?) {
        view?.evaluateJavascript("""
            (function() {
                if (window._lexguardProtectPatched) return;
                window._lexguardProtectPatched = true;

                // --- Hook into stopProtection to save event locally ---
                var origStop = window.stopProtection;
                if (typeof origStop === 'function') {
                    window.stopProtection = function() {
                        // Save event before stopping
                        if (window.AndroidBridge && window.protectionActive) {
                            try {
                                var ts = new Date().toISOString();
                                var lat = window.currentLat || '0.0000';
                                var lng = window.currentLng || '0.0000';
                                var dur = window.seconds || 0;
                                window.AndroidBridge.saveProtectEvent(ts, lat, lng, 'protection_ended', dur);
                                console.log('[LexGuard] Protection event saved locally');
                            } catch(e) {
                                console.error('[LexGuard] Failed to save event:', e);
                            }
                        }
                        origStop();
                    };
                }

                // --- Hook into startProtection to save start event ---
                var origStart = window.startProtection;
                if (typeof origStart === 'function') {
                    window.startProtection = function() {
                        origStart();
                        if (window.AndroidBridge) {
                            try {
                                var ts = new Date().toISOString();
                                window.AndroidBridge.saveProtectEvent(ts, '0.0000', '0.0000', 'protection_started', 0);
                            } catch(e) {}
                        }
                    };
                }

                // --- Add "View History" section ---
                function renderHistory() {
                    var container = document.getElementById('protectHistorySection');
                    if (!container) {
                        container = document.createElement('div');
                        container.id = 'protectHistorySection';
                        container.className = 'protect-history-section';
                        // Insert before footer or at end of body
                        var footer = document.querySelector('footer');
                        if (footer) {
                            footer.parentNode.insertBefore(container, footer);
                        } else {
                            document.body.appendChild(container);
                        }
                    }

                    var html = '<h3>📋 Protection History</h3>';

                    if (window.AndroidBridge) {
                        try {
                            var historyJson = window.AndroidBridge.getProtectHistory();
                            var events = JSON.parse(historyJson);

                            if (events.length === 0) {
                                html += '<p class="history-empty">No protection events recorded yet.</p>';
                            } else {
                                // Show events in reverse chronological order
                                for (var i = events.length - 1; i >= Math.max(0, events.length - 20); i--) {
                                    var evt = events[i];
                                    var date = new Date(evt.timestamp);
                                    var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                                    var typeLabel = evt.event_type === 'protection_started' ? '🟢 Started' : '🔴 Ended';
                                    var durStr = evt.duration > 0 ? ' (' + evt.duration + 's)' : '';
                                    var locStr = (evt.latitude !== '0.0000') ? '📍 ' + evt.latitude + ', ' + evt.longitude : '';

                                    html += '<div class="history-event">';
                                    html += '<span class="event-type">' + typeLabel + durStr + '</span><br>';
                                    html += '<span class="event-time">' + dateStr + '</span>';
                                    if (locStr) html += '<br>' + locStr;
                                    html += '</div>';
                                }

                                html += '<button class="history-clear-btn" onclick="clearProtectHistory()">🗑️ Clear History</button>';
                            }
                        } catch(e) {
                            html += '<p class="history-empty">Error loading history.</p>';
                        }
                    } else {
                        html += '<p class="history-empty">History not available.</p>';
                    }

                    container.innerHTML = html;
                }

                // Global function to clear history
                window.clearProtectHistory = function() {
                    if (window.AndroidBridge) {
                        window.AndroidBridge.clearProtectHistory();
                        renderHistory(); // Re-render
                    }
                };

                // Render history on load
                renderHistory();

                console.log('[LexGuard] Protect Me enhancements injected');
            })();
        """.trimIndent(), null)
    }

    // =========================================================
    //  PERMISSIONS
    // =========================================================

    private fun requestCriticalPermissions() {
        val needed = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            needed.add(Manifest.permission.RECORD_AUDIO)
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED
        ) {
            needed.add(Manifest.permission.ACCESS_FINE_LOCATION)
            needed.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            needed.add(Manifest.permission.CAMERA)
        }

        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.S_V2) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED
            ) {
                needed.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
        }

        if (needed.isNotEmpty()) {
            Log.d(TAG, "Requesting permissions: $needed")
            permissionLauncher.launch(needed.toTypedArray())
        }
    }

    // =========================================================
    //  APP LOADING
    // =========================================================

    private fun loadApp() {
        if (isNetworkAvailable()) {
            offlineView.visibility = View.GONE
            webView.visibility = View.VISIBLE
            progressBar.visibility = View.VISIBLE
            // ENHANCEMENT F: Update cache mode based on connectivity
            webView.settings.cacheMode = WebSettings.LOAD_DEFAULT
            webView.loadUrl(SERVER_URL)
        } else {
            // Try cached version first before showing offline
            webView.settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
            if (lastLoadedUrl != null) {
                webView.loadUrl(lastLoadedUrl!!)
            } else {
                webView.visibility = View.GONE
                offlineView.visibility = View.VISIBLE
            }
        }
    }

    private fun isNetworkAvailable(): Boolean {
        val cm = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    // =========================================================
    //  NAVIGATION
    // =========================================================

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    // ENHANCEMENT F: Ensure cookies are flushed when app goes to background
    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    // ENHANCEMENT F: Resume WebView when coming back
    override fun onResume() {
        super.onResume()
        webView.onResume()
    }
}
