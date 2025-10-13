# Android Development Setup Guide for Windows

This guide will help you set up Android development environment for your Expo React Native app.

## Step 1: Install Android Studio

1. **Download Android Studio**
   - Visit: https://developer.android.com/studio
   - Download the latest version for Windows
   - Run the installer

2. **Installation Options**
   - ✅ Check "Android SDK"
   - ✅ Check "Android SDK Platform"
   - ✅ Check "Android Virtual Device"
   - Click "Next" and complete the installation

3. **First Launch Setup**
   - Launch Android Studio
   - Complete the setup wizard
   - Choose "Standard" installation type
   - Wait for all components to download

## Step 2: Install Required SDK Components

1. Open Android Studio
2. Go to `Tools` → `SDK Manager` (or click the SDK Manager icon in the toolbar)
3. In the **SDK Platforms** tab:
   - ✅ Check the latest Android version (e.g., Android 14.0 or Android 13.0)
   - ✅ Check "Show Package Details" at the bottom
   - ✅ Make sure these are checked:
     - Android SDK Platform
     - Sources for Android SDK

4. In the **SDK Tools** tab:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Tools (if available)

5. Click "Apply" and wait for downloads to complete

## Step 3: Set Up Environment Variables

### Option A: Automatic Setup (Recommended)

1. **Run the setup script**:
   ```powershell
   # Open PowerShell as Administrator
   # Navigate to your project directory
   cd "D:\Res\Points Redeem\points-redeem-app"
   
   # Run the setup script
   .\setup-android-env.ps1
   ```

2. **Restart your terminal/IDE** (IMPORTANT!)

### Option B: Manual Setup

1. **Set ANDROID_HOME**:
   - Open System Environment Variables:
     - Press `Win + R`
     - Type: `sysdm.cpl`
     - Press Enter
     - Go to "Advanced" tab
     - Click "Environment Variables"
   
   - Under "User variables", click "New":
     - Variable name: `ANDROID_HOME`
     - Variable value: `C:\Users\ahmed\AppData\Local\Android\Sdk`
     - Click OK
   
   - Repeat for `ANDROID_SDK_ROOT`:
     - Variable name: `ANDROID_SDK_ROOT`
     - Variable value: `C:\Users\ahmed\AppData\Local\Android\Sdk`
     - Click OK

2. **Update PATH**:
   - In "User variables", find and select "Path"
   - Click "Edit"
   - Click "New" and add these paths:
     ```
     C:\Users\ahmed\AppData\Local\Android\Sdk\platform-tools
     C:\Users\ahmed\AppData\Local\Android\Sdk\emulator
     C:\Users\ahmed\AppData\Local\Android\Sdk\tools\bin
     ```
   - Click OK on all windows

3. **Restart your computer** (or at minimum, restart all terminals and VS Code/Cursor)

## Step 4: Verify Installation

Open a **NEW** PowerShell window and run:

```powershell
# Check ANDROID_HOME
echo $env:ANDROID_HOME

# Check ADB
adb --version

# Check Android SDK
sdkmanager --list
```

You should see:
- ANDROID_HOME showing the SDK path
- ADB version information
- List of installed SDK packages

## Step 5: Create/Start an Android Emulator

### Option A: Using Android Studio (Easier)

1. Open Android Studio
2. Click on "More Actions" → "Virtual Device Manager" (or `Tools` → `Device Manager`)
3. Click "Create Device"
4. Select a device (e.g., "Pixel 5")
5. Download a system image (recommended: latest stable release)
6. Click "Finish"
7. Click the ▶️ play button to start the emulator

### Option B: Using Command Line

```powershell
# List available AVDs
emulator -list-avds

# Start an emulator
emulator -avd <avd_name>
```

## Step 6: Run Your Expo App

Once the emulator is running:

```bash
# Navigate to your project
cd "D:\Res\Points Redeem\points-redeem-app"

# Install dependencies (if not already done)
npm install

# Start Expo
npm start

# When Expo DevTools opens, press 'a' to run on Android
# OR run directly:
npm run android
```

## Troubleshooting

### "adb not found" error
- Make sure platform-tools is in your PATH
- Restart your terminal/IDE
- Run the setup script again

### Emulator won't start
- Enable virtualization in BIOS (Intel VT-x or AMD-V)
- Disable Hyper-V if using Intel HAXM:
  ```powershell
  # Run as Administrator
  bcdedit /set hypervisorlaunchtype off
  # Restart computer
  ```

### Expo not detecting device
- Make sure emulator is fully booted (can take 2-3 minutes)
- Run `adb devices` to see if device is connected
- If not showing, restart adb:
  ```bash
  adb kill-server
  adb start-server
  ```

### Build failures
- Make sure you have Java JDK installed (Android Studio includes it)
- Check that all SDK components are installed in SDK Manager

## Alternative: Use Expo Go on Physical Device

If setting up the emulator is too complex, you can use a physical Android device:

1. Install "Expo Go" from Google Play Store
2. Enable USB Debugging on your phone
3. Connect phone via USB
4. Run `npm start` and scan the QR code with Expo Go

## Need Help?

If you continue to have issues, provide:
- Output of `adb --version`
- Output of `echo $env:ANDROID_HOME`
- Output of `adb devices`
- Any error messages you're seeing

