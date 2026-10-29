package com.madsol.app

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.madsol.app.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MadSolMainActivity"
    }

    private lateinit var binding: ActivityMainBinding
    private lateinit var adMobManager: AdMobManager

    // File chooser callback for <input type="file"> image/document uploads
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    // Double-press back to exit tracking
    private var backPressedTime: Long = 0

    // Activity Result Launcher for selecting files/photos
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult

        val results: Array<Uri>? = if (result.resultCode == RESULT_OK && result.data != null) {
            val clipData = result.data?.clipData
            if (clipData != null) {
                val uris = mutableListOf<Uri>()
                for (i in 0 until clipData.itemCount) {
                    uris.add(clipData.getItemAt(i).uri)
                }
                uris.toTypedArray()
            } else {
                val dataUri = result.data?.data
                if (dataUri != null) arrayOf(dataUri) else null
            }
        } else {
            null
        }

        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Initialize AdMob Manager
        adMobManager = AdMobManager(this)

        setupAdMob()
        setupWebView()
        setupSwipeRefresh()
        setupOfflineRetry()
        setupBackNavigation()

        loadWebApp()
    }

    /**
     * Initializes Google Mobile Ads SDK and loads the Banner Ad
     */
    private fun setupAdMob() {
        val bannerAdUnitId = getString(R.string.admob_banner_ad_unit_id)
        val interstitialAdUnitId = getString(R.string.admob_interstitial_ad_unit_id)

        adMobManager.initialize {
            // Load Banner Ad into bottom container
            adMobManager.loadBanner(binding.adViewFrameLayout, bannerAdUnitId)
            // Pre-load Interstitial Ad for major milestones
            adMobManager.preloadInterstitial(interstitialAdUnitId)
        }
    }

    /**
     * Public method callable from WebAppInterface to trigger an interstitial ad
     */
    fun showInterstitialAd() {
        val interstitialAdUnitId = getString(R.string.admob_interstitial_ad_unit_id)
        adMobManager.showInterstitial(this, interstitialAdUnitId)
    }

    /**
     * Configures the WebView for high performance, localStorage persistence,
     * file uploading, downloads, and JavaScript bridge.
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webView = binding.webView
        val settings = webView.settings

        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            useWideViewPort = true
            loadWithOverviewMode = true
            displayZoomControls = false
            builtInZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            userAgentString = settings.userAgentString + " MadSolAndroidApp/1.0.0"
        }

        // Enable Cookies
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // Add JavaScript Interface Bridge (window.AndroidBridge)
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge")

        // Setup WebChromeClient for File Upload & Progress Indicator
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.progressBar.progress = newProgress
                } else {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    fileChooserLauncher.launch(
                        Intent.createChooser(intent, getString(R.string.file_chooser_title))
                    )
                } catch (e: Exception) {
                    fileUploadCallback = null
                    Log.e(TAG, "Cannot launch file chooser", e)
                    return false
                }
                return true
            }
        }

        // Setup WebViewClient for internal navigation & error handling
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                // Keep MadSol host and subdomains inside the WebView
                if (url.contains("mad-sol1.vercel.app") || url.contains("vercel.app") || url.contains("madsol")) {
                    return false
                }

                // Handle external intent schemes (phone call, email, whatsapp)
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    Log.w(TAG, "Cannot handle external URL: $url", e)
                    false
                }
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.offlineLayout.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.swipeRefreshLayout.isRefreshing = false
                binding.progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                // Show offline layout only for main frame navigation errors
                if (request?.isForMainFrame == true) {
                    binding.offlineLayout.visibility = View.VISIBLE
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                }
            }
        }

        // Setup DownloadListener for PDF reports, Admit Cards & CSV exports
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimetype)
                    addRequestHeader("User-Agent", userAgent)
                    setDescription("মাদসোল ডকুমেন্ট ডাউনলোড হচ্ছে...")
                    setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS,
                        URLUtil.guessFileName(url, contentDisposition, mimetype)
                    )
                }
                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Toast.makeText(this, "ডাউনলোড শুরু হয়েছে...", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                // Fallback to opening in external browser
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
            }
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setColorSchemeColors(
            getColor(R.color.primary_emerald),
            getColor(R.color.accent_emerald_light)
        )
        binding.swipeRefreshLayout.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    private fun setupOfflineRetry() {
        binding.btnRetry.setOnClickListener {
            if (isNetworkAvailable()) {
                binding.offlineLayout.visibility = View.GONE
                binding.webView.reload()
            } else {
                Toast.makeText(this, getString(R.string.offline_title), Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Handles hardware back button navigation:
     * Navigates web page history if available, else double-tap to exit.
     */
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    if (System.currentTimeMillis() - backPressedTime < 2000) {
                        finish()
                    } else {
                        backPressedTime = System.currentTimeMillis()
                        Toast.makeText(this@MainActivity, getString(R.string.exit_prompt), Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun loadWebApp() {
        val targetUrl = getString(R.string.web_url)
        if (isNetworkAvailable()) {
            binding.offlineLayout.visibility = View.GONE
            binding.webView.loadUrl(targetUrl)
        } else {
            binding.offlineLayout.visibility = View.VISIBLE
        }
    }

    private fun isNetworkAvailable(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    // Lifecycle Management for AdMob Banner and WebView
    override fun onPause() {
        adMobManager.pauseBanner()
        binding.webView.onPause()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        binding.webView.onResume()
        adMobManager.resumeBanner()
    }

    override fun onDestroy() {
        adMobManager.destroyBanner()
        binding.webView.destroy()
        super.onDestroy()
    }
}
