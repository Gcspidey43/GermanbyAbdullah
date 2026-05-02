# 📱 Converting to Android App (.APK)

I have already initialized the mobile configuration using **Capacitor**. This allows your React website to run as a native Android application.

### 📁 Where is the mobile code?
All the Android-specific code is now in the `/frontend/android` folder. This is a full Android Studio project.

---

### 🛠️ How to generate the .APK file (for No Coders):

Since generating an `.apk` requires the Android SDK (which is very large), you need to do these steps on your own computer:

#### 1. Install Android Studio
Download and install [Android Studio](https://developer.android.com/studio).

#### 2. Prepare the Frontend
Open your terminal in the `frontend` folder and run:
```bash
npm run build
npx cap sync
```
*This command copies your latest website design into the Android project.*

#### 3. Open in Android Studio
Run this command to open the project:
```bash
npx cap open android
```
*Alternatively, just open Android Studio and "Open Project" -> select the `frontend/android` folder.*

#### 4. Build the APK
In Android Studio:
1.  Wait for the "Gradle Sync" to finish (it might take a few minutes).
2.  Go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3.  When it's done, a small popup will appear at the bottom right. Click **"locate"** to find your `app-debug.apk` file!

---

### ⚠️ Critical Note for Mobile:
On a real phone, the app cannot find your server at `localhost`. 
1. Open `frontend/src/config.ts`.
2. Change `localhost` to your computer's **Local IP Address** (e.g., `http://192.168.1.10:8787`).
3. Re-run `npm run build` and `npx cap sync`.

You can now install that `.apk` on any Android phone! 🚀
