/**
 * Utility to safely interact with Android Native JavaScript Bridge (`window.AndroidBridge`)
 * Supports Google AdMob Interstitial triggers and native Android status checks.
 * Completely safe to call in standard browsers (fails gracefully without errors).
 */

declare global {
  interface Window {
    AndroidBridge?: {
      isAndroidApp?: () => boolean;
      getAppVersion?: () => string;
      showToast?: (message: string) => void;
      triggerInterstitialAd?: () => void;
    };
  }
}

/**
 * Checks if current web app is running inside the MadSol Android Native Wrapper
 */
export const isRunningInAndroidApp = (): boolean => {
  try {
    return typeof window !== 'undefined' && Boolean(window.AndroidBridge?.isAndroidApp?.());
  } catch {
    return false;
  }
};

/**
 * Safely requests the native Android wrapper to display a preloaded AdMob Interstitial Ad.
 * 
 * Complies with strict AdMob guidelines:
 * - Only triggers on verified user milestone successes (e.g. Admission Success, Marksheet Generated).
 * - Maximum 1 interstitial per session (enforced natively in AdMobManager).
 * - Fails silently and safely in browser or if ad is not ready, never blocking user actions.
 */
export const triggerNativeInterstitialAd = (): void => {
  try {
    if (typeof window !== 'undefined' && window.AndroidBridge?.triggerInterstitialAd) {
      window.AndroidBridge.triggerInterstitialAd();
    }
  } catch (err) {
    // Non-blocking catch to ensure web app logic remains completely unaffected
    console.debug('[AdMobBridge] Native interstitial trigger bypassed:', err);
  }
};
