# 🐧 Building APK on Linux (No Android Studio)

Since you are on Linux and don't want to install the full Android Studio, you can build your APK directly from the terminal.

### 1. Install Java (Required)
Open your terminal and run:
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

### 2. Install Android Build Tools
You still need the "Android SDK" (the engine that builds apps). The easiest way to get it on Linux without the IDE is:
```bash
sudo apt install android-sdk
```
*(Note: If your Linux version doesn't have this, you may need to download the "Command Line Tools" from the Android website).*

### 3. Build your APK
Once the tools are installed, go to your project folder and run:

```bash
cd frontend
# 1. Update the code
npm run build
# 2. Send code to Android folder
npx cap sync
# 3. Trigger the build
cd android
./gradlew assembleDebug
```

### 4. Locate your APK
After the build finishes, your installer file will be here:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

### 💡 The "Professional" Way (GitHub Actions)
If the steps above are too complicated, I recommend setting up a **GitHub Action**. 
1. You push your code to GitHub.
2. GitHub's servers build the APK for you.
3. You just click "Download" on the GitHub website.

Would you like me to create the GitHub Action file for you?
