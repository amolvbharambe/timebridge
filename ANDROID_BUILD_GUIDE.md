# 📱 TimeBridge Android Installation & APK Guide

There are **3 easy ways** to install TimeBridge on an Android smartphone:

---

## ⚡ Method 1: Instant PWA Install on Android (Recommended — No APK needed)

TimeBridge is configured as a fully offline-capable **Progressive Web App (PWA)** with native app manifest, service worker, and adaptive icons.

1. **Start the local sharing server on your computer**:
   ```bash
   cd /Users/abharamb/.gemini/antigravity/scratch/timezone-converter
   ./start-server.sh
   ```
2. **Open the URL on your Android phone**:
   - Ensure your phone is connected to the same Wi-Fi or office VPN.
   - Open **Google Chrome** (or Edge / Samsung Internet / Brave) on your Android phone.
   - Navigate to the IP URL shown in the terminal, for example: `http://10.x.x.x:8080`.
3. **Tap Install**:
   - Chrome will show an automatic prompt: **"Install TimeBridge"** or **"Add to Home screen"**.
   - If you don't see the banner, tap the three dots (`⋮`) in the top right of Chrome and select **"Install app"** (or **"Add to Home screen"**).
4. **Done!**
   - TimeBridge is now installed in your Android app drawer with its own app icon.
   - It opens in full-screen standalone mode without any browser URL bar.
   - It works **100% offline** anytime using the embedded Service Worker cache.

---

## 📦 Method 2: Generate APK via PWABuilder (1-Click Cloud APK)

If you need a physical `.apk` file to distribute or sideload:

1. Deploy TimeBridge to any free hosting provider (GitHub Pages, Netlify, Vercel, or Cloudflare Pages) or tunnel via Cloudflare/ngrok.
2. Go to **[https://www.pwabuilder.com](https://www.pwabuilder.com)**.
3. Paste your URL and click **Start**.
4. Click **"Package for Android"** -> **"Generate APK"**.
5. Download the signed `.apk` file directly to your phone and tap to install!

---

## 🛠️ Method 3: Build APK with Android Studio / Gradle

A complete native Android WebView wrapper project is included in the `android/` directory:

### Project Structure:
- `android/app/src/main/AndroidManifest.xml` — Native Android manifest with permissions & full-screen settings.
- `android/app/src/main/java/com/timebridge/converter/MainActivity.java` — Optimized Android WebView with hardware acceleration, back-button handling, and JavaScript enabled.
- `android/app/src/main/assets/` — Embedded offline copy of TimeBridge (`index.html`, `app.js`, `style.css`, `icons/`).
- `android/app/src/main/res/` — Mipmap launcher icons (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).

### Steps to Build:
1. Open **Android Studio**.
2. Select **File > Open** and choose the `android` folder:
   `/Users/abharamb/.gemini/antigravity/scratch/timezone-converter/android`
3. Wait for Gradle sync to complete.
4. In the menu, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Android Studio will generate the APK at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
6. Transfer `app-debug.apk` to your phone or install via ADB:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 🚀 Method 4: Automated GitHub Actions Cloud Build

If your project is pushed to a GitHub repository:
- The included workflow [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) triggers automatically on push.
- Go to your repository's **Actions** tab on GitHub.
- Download the compiled `TimeBridge-debug-apk` directly from the workflow artifacts.
