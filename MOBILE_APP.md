# Mobile app (Android / iOS)

This wraps the deployed site in a native WebView via [Capacitor](https://capacitorjs.com). No app code
was rewritten — `android/` and `ios/` are thin shells that load the URL in `capacitor.config.ts`.

## 1. Point it at your deployment

Edit `REMOTE_URL` in [capacitor.config.ts](capacitor.config.ts) — it's a placeholder
(`https://bharat-bank.onrender.com`). Use your actual Render URL (check the Render dashboard for the
service named `bharat-bank`; Render may have added a random suffix if that name was taken).

After changing it:

```bash
npx cap sync
```

## 2. Android — build an APK

Needs the Android SDK + a JDK (not installed on this machine). Easiest path: install
[Android Studio](https://developer.android.com/studio), then:

```bash
npm run cap:android
```

This opens `android/` in Android Studio. Build → Build Bundle(s)/APK(s) → Build APK(s). The debug APK
lands in `android/app/build/outputs/apk/debug/app-debug.apk` and installs on any device with
"unknown sources" allowed — no signing needed for debug. A Play Store release needs a signing key
(Build → Generate Signed Bundle/APK).

## 3. iOS — build an IPA

Needs full Xcode (not just the Command Line Tools) + CocoaPods, plus an Apple Developer account for a
device/TestFlight build — this machine only has the CLT. Install Xcode from the App Store, then:

```bash
sudo gem install cocoapods   # if not already installed
npm run cap:ios
```

This opens `ios/App/App.xcworkspace` in Xcode. Pick your Team under Signing & Capabilities, then
Product → Archive for a device build, or just hit Run to try it in the Simulator.

## Updating after app changes

Since the native shell just loads a remote URL, most changes need nothing further — redeploy to Render
and the app picks it up on next load. Re-run `npx cap sync` only if you change `capacitor.config.ts`
(icons, app name, plugins).
