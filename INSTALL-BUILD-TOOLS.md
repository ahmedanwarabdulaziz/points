# 🔧 Install Build Tools for Local APK Building

## Quick Installation Guide (15-20 minutes)

---

## Step 1: Install Java JDK 17 (5 minutes)

### Download and Install:

**Download from:** https://adoptium.net/temurin/releases/

1. Click on **Windows x64** under **JDK 17 (LTS)**
2. Download the `.msi` installer
3. Run the installer
4. ✅ Check **"Set JAVA_HOME variable"**
5. ✅ Check **"Add to PATH"**
6. Click **Install**

### Verify Installation:

Open a **NEW** PowerShell window and run:
```powershell
java -version
```

You should see: `openjdk version "17.x.x"`

---

## Step 2: Install Android Studio (10-15 minutes)

### Download:

**Download from:** https://developer.android.com/studio

1. Download **Android Studio** (latest version)
2. Run the installer
3. Choose **Standard** installation
4. Accept all licenses
5. Wait for SDK download (~2-3 GB)

### Setup Android SDK:

1. Open **Android Studio**
2. Click **More Actions** → **SDK Manager**
3. In **SDK Platforms** tab:
   - ✅ Check **Android 13.0 (Tiramisu)** API Level 33
   - ✅ Check **Android 12.0 (S)** API Level 31
4. In **SDK Tools** tab:
   - ✅ Check **Android SDK Build-Tools**
   - ✅ Check **Android SDK Command-line Tools**
   - ✅ Check **Android Emulator** (optional)
5. Click **Apply** and wait for download

### Set Environment Variables:

**Windows:**

1. Press `Win + X` → **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under **System variables**, click **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   
5. Edit **Path** variable and add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\build-tools`

6. Click **OK** on all windows

### Verify Installation:

Open a **NEW** PowerShell window and run:
```powershell
$env:ANDROID_HOME
adb version
```

You should see your Android SDK path and ADB version.

---

## Step 3: Accept Android Licenses

Open **PowerShell as Administrator** and run:

```powershell
cd $env:ANDROID_HOME\cmdline-tools\latest\bin
.\sdkmanager --licenses
```

Type `y` for all prompts.

---

## ✅ Verification Checklist

Open a **NEW** PowerShell window and check:

```powershell
# Check Java
java -version
# Should show: openjdk version "17.x.x"

# Check Android SDK
$env:ANDROID_HOME
# Should show: C:\Users\YourUsername\AppData\Local\Android\Sdk

# Check ADB
adb version
# Should show: Android Debug Bridge version x.x.x
```

---

## 🎯 You're Ready!

After all checks pass, you can build your APK locally!

**Next:** Run the build commands from `BUILD-LOCAL-NOW.bat`

---

## 🆘 Troubleshooting

### "Java not found after installation"
- Close and reopen PowerShell
- Make sure JAVA_HOME was set during installation
- Check: `$env:JAVA_HOME` should point to Java directory

### "ANDROID_HOME not set"
- Close and reopen PowerShell after setting environment variables
- Path should be: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
- Check in File Explorer that this folder exists

### "sdkmanager not found"
- Install **Android SDK Command-line Tools** via Android Studio SDK Manager
- Path is: `ANDROID_HOME\cmdline-tools\latest\bin`

---

## ⚡ Quick Install (Using Chocolatey)

If you have Chocolatey package manager:

```powershell
# Install Chocolatey first from: https://chocolatey.org/install

# Then install tools:
choco install openjdk17 -y
choco install android-sdk -y
```

---

## 📦 Disk Space Requirements

- Java JDK 17: ~300 MB
- Android Studio: ~1 GB
- Android SDK: ~3-4 GB
- **Total:** ~5 GB

---

## ⏱️ Time Required

- Java installation: 5 minutes
- Android Studio download: 5-10 minutes (depends on internet)
- Android Studio installation: 5-10 minutes
- SDK download: 5-10 minutes
- **Total:** 20-35 minutes

---

## 🎊 After Installation

You'll be able to:
- ✅ Build APK locally in 5 minutes
- ✅ No Expo build service needed
- ✅ No waiting in queues
- ✅ Complete control over builds
- ✅ Faster development workflow

**Let's build your APK! 🚀**

