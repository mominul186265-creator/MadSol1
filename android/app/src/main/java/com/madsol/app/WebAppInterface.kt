package com.madsol.app

import android.webkit.JavascriptInterface
import android.widget.Toast

/**
 * WebAppInterface
 * JavaScript Interface bridge injected into WebView as `window.AndroidBridge`.
 * Enables web app actions (like generating exam admit cards, fee slips) 
 * to trigger native AdMob interstitial ads or native capabilities safely.
 */
class WebAppInterface(
    private val activity: MainActivity
) {

    @JavascriptInterface
    fun isAndroidApp(): Boolean {
        return true
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.0"
    }

    @JavascriptInterface
    fun showToast(message: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Called from JavaScript when a major milestone is completed
     * (e.g. after exam report generation, fee invoice print, or admission submit).
     */
    @JavascriptInterface
    fun triggerInterstitialAd() {
        activity.runOnUiThread {
            activity.showInterstitialAd()
        }
    }
}
