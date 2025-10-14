# 🔧 Local APK Build - Step by Step Guide

**Follow these steps IN ORDER!**

---

## ✅ STEP 1: Install Java JDK 17 (5-10 minutes)

### What I did for you:
- ✅ Opened download page: https://adoptium.net/temurin/releases/?version=17

### What you need to do:

1. **Download:**
   - Operating System: **Windows**
   - Architecture: **x64**
   - Package Type: **JDK**
   - Click **.msi** download button

2. **Install:**
   - Run the downloaded `.msi` file
   - **IMPORTANT - Check these boxes:**
     - ✅ Set JAVA_HOME variable
     - ✅ Add to PATH
     - ✅ JavaSoft registry keys
   - Click Next → Install
   - Wait 2-3 minutes

3. **Verify:**
   - **CLOSE PowerShell completely**
   - **Open NEW PowerShell**
   - Run: `.\1-check-java.bat`
   - Should say: **[SUCCESS] Java is installed!**

**Don't proceed until Java is verified!** ⚠️

---

## ✅ STEP 2: Install Android Studio (15-20 minutes)

### What I'll do for you:
- Open download page
- Create checker script

### What you need to do:

1. **Download:**
   - I'll open: https://developer.android.com/studio
   - Click **"Download Android Studio"**
   - Download ~1.1 GB (may take 5-10 minutes)

2. **Install:**
   - Run `android-studio-xxx-windows.exe`
   - Choose **"Standard"** installation
   - Choose any theme (Light/Dark)
   - Click Next → Finish
   - **Wait for SDK download (~3-4 GB, takes 10-15 minutes)**

3. **Setup SDK:**
   - When Android Studio opens
   - Click **"More Actions"** → **"SDK Manager"**
   - In **"SDK Platforms"** tab:
     - ✅ Check **Android 13.0 (Tiramisu)** API 33
     - ✅ Check **Android 12.0 (S)** API 31
   - In **"SDK Tools"** tab:
     - ✅ Check **Android SDK Build-Tools**
     - ✅ Check **Android SDK Command-line Tools**
     - ✅ Check **Android SDK Platform-Tools**
   - Click **"Apply"**
   - Wait for download

4. **Note SDK Location:**
   - Usually: `C:\Users\YourName\AppData\Local\Android\Sdk`
   - Write this down! You'll need it next!

---

## ✅ STEP 3: Accept Android Licenses (2 minutes)

### What you need to do:

1. **Open PowerShell AS ADMINISTRATOR**
   - Right-click PowerShell → "Run as Administrator"

2. **Run these commands:**
   ```powershell
   cd C:\Users\YourName\AppData\Local\Android\Sdk\cmdline-tools\latest\bin
   .\sdkmanager --licenses
   ```
   (Replace `YourName` with your Windows username!)

3. **Accept all licenses:**
   - Type **`y`** for each prompt
   - Press Enter

---

## ✅ STEP 4: Set Environment Variables (3 minutes)

### What you need to do:

1. **Open System Environment Variables:**
   - Press **Win + X**
   - Click **"System"**
   - Click **"Advanced system settings"** (right side)
   - Click **"Environment Variables"** button

2. **Add ANDROID_HOME:**
   - Under **"System variables"** (bottom section)
   - Click **"New"**
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk`
   - (Use the path you noted earlier!)
   - Click **OK**

3. **Update PATH:**
   - Still in "System variables"
   - Select **"Path"**
   - Click **"Edit"**
   - Click **"New"** and add:
     - `%ANDROID_HOME%\platform-tools`
   - Click **"New"** again and add:
     - `%ANDROID_HOME%\cmdline-tools\latest\bin`
   - Click **OK** on all windows

4. **RESTART:**
   - **CLOSE ALL PowerShell windows**
   - **Open a NEW PowerShell**

---

## ✅ STEP 5: Verify Everything (1 minute)

### What you need to do:

Run: `.\2-check-all.bat`

Should show:
- ✅ Java installed
- ✅ ANDROID_HOME set
- ✅ ADB installed

If all ✅ then you're ready to build!

---

## ✅ STEP 6: Build APK! (5-10 minutes)

### What you need to do:

Run: `.\3-build-apk.bat`

This will:
1. Install dependencies (~2 min)
2. Generate Android project (~2 min)
3. Build APK (~5-10 min)
4. Your APK is ready!

**APK Location:**
```
android\app\build\outputs\apk\release\app-release.apk
```

---

## 📋 Quick Checklist:

```
□ STEP 1: Install Java JDK 17
  □ Download from Adoptium
  □ Install with JAVA_HOME and PATH
  □ Run: 1-check-java.bat

□ STEP 2: Install Android Studio
  □ Download Android Studio
  □ Install (Standard setup)
  □ Install SDK components
  □ Note SDK location

□ STEP 3: Accept Licenses
  □ Run as Administrator
  □ Run sdkmanager --licenses
  □ Type 'y' for all

□ STEP 4: Set Environment Variables
  □ Add ANDROID_HOME
  □ Update PATH
  □ Close and reopen PowerShell

□ STEP 5: Verify
  □ Run: 2-check-all.bat
  □ All checks pass

□ STEP 6: Build!
  □ Run: 3-build-apk.bat
  □ Get APK!
```

---

## ⏱️ Time Breakdown:

- Java installation: 5-10 min
- Android Studio download: 5-10 min
- Android Studio install + SDK: 15-20 min
- Setup & verification: 5 min
- APK build: 5-10 min
- **TOTAL: 35-55 minutes**

---

## 💾 Disk Space Required:

- Java JDK: ~300 MB
- Android Studio: ~1 GB
- Android SDK: ~4 GB
- Build files: ~500 MB
- **TOTAL: ~6 GB**

---

## 🆘 Troubleshooting:

### "Java not found after installation"
- Did you close and reopen PowerShell?
- Check: `$env:JAVA_HOME` should show path

### "ANDROID_HOME not set"
- Check Environment Variables
- Path should be: `C:\Users\YourName\AppData\Local\Android\Sdk`
- Did you close and reopen PowerShell?

### "sdkmanager not found"
- Install "Android SDK Command-line Tools" in SDK Manager
- Check path: `ANDROID_HOME\cmdline-tools\latest\bin`

### "Build failed"
- Run: `npm install`
- Clear cache: `npm start --clear`
- Try build again

---

## 🎊 After This Setup:

You'll be able to:
- ✅ Build APK anytime in 5-10 minutes
- ✅ No waiting in queues
- ✅ Complete control
- ✅ Test immediately

**Let's do this!** 🚀

