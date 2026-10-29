# Proguard rules for MadSol Android App

# Keep JavaScript Interface methods so ProGuard does not strip or obfuscate them
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Google Mobile Ads (AdMob) SDK
-keep public class com.google.android.gms.ads.** {
   public *;
}

-keep public class com.google.ads.** {
   public *;
}

# Keep Android WebKit classes
-keepclassmembers class * extends android.webkit.WebChromeClient {
   public *;
}

-keepclassmembers class * extends android.webkit.WebViewClient {
   public *;
}
