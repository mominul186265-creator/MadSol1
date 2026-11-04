package com.madsol.app

import android.app.Activity
import android.content.Context
import android.util.DisplayMetrics
import android.util.Log
import android.view.ViewGroup
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

/**
 * AdMobManager
 * Manages Google Mobile Ads SDK initialization, lifecycle, and loading
 * for both Banner and Interstitial Ads.
 * 
 * Official Guide: https://developers.google.com/admob/android/quick-start
 */
class AdMobManager(private val context: Context) {

    companion object {
        private const val TAG = "AdMobManager"
    }

    private var bannerAdView: AdView? = null
    private var interstitialAd: InterstitialAd? = null
    private var isInterstitialLoading = false
    // Per-session frequency capping: maximum 1 interstitial per app session
    private var hasShownInterstitialInSession = false

    /**
     * Initializes Google Mobile Ads SDK on a background thread.
     */
    fun initialize(onInitializationComplete: (() -> Unit)? = null) {
        MobileAds.initialize(context) { initializationStatus ->
            Log.d(TAG, "Mobile Ads SDK Initialized: $initializationStatus")
            onInitializationComplete?.invoke()
        }
    }

    /**
     * Creates and loads an adaptive Banner Ad into the specified container.
     */
    fun loadBanner(container: ViewGroup, adUnitId: String) {
        try {
            // Destroy any existing ad view before creating a new one
            destroyBanner()

            val adView = AdView(context)
            adView.adUnitId = adUnitId
            
            // Calculate anchored adaptive banner size based on screen width
            val adSize = getAdaptiveAdSize(context)
            adView.setAdSize(adSize)

            adView.adListener = object : AdListener() {
                override fun onAdLoaded() {
                    Log.d(TAG, "Banner Ad loaded successfully")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    Log.w(TAG, "Banner Ad failed to load: ${error.message} (Code: ${error.code})")
                }

                override fun onAdOpened() {
                    Log.d(TAG, "Banner Ad opened")
                }

                override fun onAdClicked() {
                    Log.d(TAG, "Banner Ad clicked")
                }

                override fun onAdClosed() {
                    Log.d(TAG, "Banner Ad closed")
                }
            }

            container.removeAllViews()
            container.addView(adView)
            bannerAdView = adView

            val adRequest = AdRequest.Builder().build()
            adView.loadAd(adRequest)
        } catch (e: Exception) {
            Log.e(TAG, "Exception while loading banner ad", e)
        }
    }

    /**
     * Pre-loads an Interstitial Ad to be ready when triggered.
     */
    fun preloadInterstitial(adUnitId: String) {
        if (interstitialAd != null || isInterstitialLoading) return

        isInterstitialLoading = true
        val adRequest = AdRequest.Builder().build()

        InterstitialAd.load(
            context,
            adUnitId,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isInterstitialLoading = false
                    Log.d(TAG, "Interstitial Ad loaded")
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    interstitialAd = null
                    isInterstitialLoading = false
                    Log.w(TAG, "Interstitial Ad failed to load: ${loadAdError.message}")
                }
            }
        )
    }

    /**
     * Shows the pre-loaded Interstitial Ad if available.
     * Enforces frequency capping (max 1 per session) and non-blocking callback.
     */
    fun showInterstitial(activity: Activity, adUnitId: String, onDismissed: (() -> Unit)? = null) {
        // Frequency capping: Strictly show maximum one interstitial per app session
        if (hasShownInterstitialInSession) {
            Log.d(TAG, "Interstitial skipped: Already shown in this session (max 1 per session policy)")
            onDismissed?.invoke()
            return
        }

        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdShowedFullScreenContent() {
                    hasShownInterstitialInSession = true
                    Log.d(TAG, "Interstitial ad showed full screen")
                }

                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    Log.d(TAG, "Interstitial ad dismissed by user")
                    // Do not eagerly reload to respect frequency capping per session
                    onDismissed?.invoke()
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    interstitialAd = null
                    Log.w(TAG, "Interstitial ad failed to show: ${adError.message}")
                    onDismissed?.invoke()
                }
            }
            ad.show(activity)
        } else {
            // Ad is not loaded yet; NEVER block the user or app operations
            Log.d(TAG, "Interstitial ad not ready; proceeding without blocking user")
            onDismissed?.invoke()
            preloadInterstitial(adUnitId)
        }
    }

    /**
     * Computes the adaptive banner ad size based on device orientation and density.
     */
    private fun getAdaptiveAdSize(context: Context): AdSize {
        val displayMetrics: DisplayMetrics = context.resources.displayMetrics
        val density = displayMetrics.density
        var adWidthPixels = displayMetrics.widthPixels.toFloat()
        if (adWidthPixels == 0f) {
            adWidthPixels = displayMetrics.widthPixels.toFloat()
        }
        val adWidth = (adWidthPixels / density).toInt()
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(context, adWidth)
    }

    fun pauseBanner() {
        bannerAdView?.pause()
    }

    fun resumeBanner() {
        bannerAdView?.resume()
    }

    fun destroyBanner() {
        bannerAdView?.destroy()
        bannerAdView = null
    }
}
