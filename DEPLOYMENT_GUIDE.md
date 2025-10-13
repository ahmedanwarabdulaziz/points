# 🚀 Deployment & Distribution Guide

This guide shows you how to deploy your Android app, host it, and push updates automatically.

---

## 🎯 **Option 1: EAS Build + EAS Update (RECOMMENDED)** ⭐

### **What You Get:**
- ✅ Build APK once on Expo's servers
- ✅ Host updates on Expo (free tier available)
- ✅ Users download APK once, updates push instantly (no re-download)
- ✅ Over-the-Air (OTA) updates - like a web app!
- ✅ No Android SDK needed on your computer
- ✅ Share download link from Expo's server

### **How It Works:**

1. **Build once** → Creates installable APK
2. **Users install APK** → From download link you share
3. **You push updates** → `eas update` command
4. **Users get updates** → Automatically on next app open!

### **Setup Steps:**

#### 1. Initial Setup (One Time)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo (create free account)
eas login

# Configure project
eas build:configure

# This will generate a project ID - copy it!
```

#### 2. Update Project ID

After running `eas build:configure`, you'll get a project ID like `abc123-def456-ghi789`.

Update these files:
- `app.config.js`: Replace `'your-project-id-here'` with your actual project ID (in 2 places)

#### 3. Build Your App

```bash
# Build production APK (takes 15-20 min)
eas build --profile production --platform android

# OR build preview APK for testing
eas build --profile preview --platform android
```

**Wait for build to complete.** You'll get a download link!

#### 4. Distribute Your App

**Expo provides a hosted download page!**

After build completes:
- You get a shareable link like: `https://expo.dev/artifacts/eas/ABC123.apk`
- Users click link → Download APK → Install
- That's it!

**OR Create Your Own Download Page:**
- Host a simple HTML page on Vercel (see Option 3 below)
- Link to your APK hosted on Expo

#### 5. Push Updates (The Magic Part!)

When you make changes to your code:

```bash
# Push update to production channel
eas update --branch production --message "Fixed login bug"

# Push to preview channel
eas update --branch preview --message "Testing new feature"
```

**Users automatically get updates next time they open the app!** No need to rebuild or re-download.

### **What Gets Updated Automatically:**
- ✅ JavaScript/TypeScript code changes
- ✅ React components
- ✅ Styling changes
- ✅ Business logic
- ✅ Most configuration changes

### **What Requires New Build:**
- ❌ Native module changes (adding new libraries)
- ❌ App icon/splash screen changes
- ❌ Permissions changes
- ❌ Android/iOS config changes

### **Cost:**
- **Free tier**: 15 builds/month, unlimited updates
- **Production tier**: $29/month - unlimited builds
- Perfect for small teams and personal projects!

---

## 🌐 **Option 2: Host APK on Your Own Server/Vercel**

### **What You Get:**
- ✅ Full control over distribution
- ✅ Custom download page
- ✅ Host on your own domain
- ✅ Still use EAS for building and updates

### **Setup Steps:**

#### 1. Build with EAS (Same as Option 1)

```bash
eas build --profile production --platform android
```

#### 2. Download APK

Download the built APK from the link provided.

#### 3. Host APK

**Option A: Vercel Static Site**

Create a simple download page:

```bash
# Create a public folder in your project
mkdir apk-download
cd apk-download
```

Create `index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Download Points Redeem App</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
        }
        .app-icon {
            width: 120px;
            height: 120px;
            margin: 0 auto 1.5rem;
            background: #274290;
            border-radius: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
        }
        h1 {
            color: #274290;
            margin-bottom: 0.5rem;
        }
        .version {
            color: #666;
            margin-bottom: 2rem;
        }
        .download-btn {
            display: inline-block;
            background: #f27921;
            color: white;
            padding: 1rem 3rem;
            border-radius: 50px;
            text-decoration: none;
            font-size: 1.2rem;
            font-weight: bold;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(242, 121, 33, 0.3);
        }
        .info {
            margin-top: 2rem;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="app-icon">📱</div>
        <h1>Points Redeem App</h1>
        <p class="version">Version 1.0.0</p>
        <a href="./points-redeem-v1.0.0.apk" download class="download-btn">
            ⬇️ Download for Android
        </a>
        <div class="info">
            <p>After downloading, you may need to enable "Install from unknown sources" in your Android settings.</p>
            <p>App size: ~50MB</p>
        </div>
    </div>
</body>
</html>
```

Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Copy your APK to apk-download folder
cp ~/Downloads/points-redeem.apk ./apk-download/points-redeem-v1.0.0.apk

# Deploy
cd apk-download
vercel deploy --prod
```

**Option B: Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**Option C: GitHub Releases**

1. Push APK to GitHub repository
2. Create a new release
3. Attach APK as release asset
4. Users download from GitHub releases page

---

## 📦 **Option 3: Progressive Web App (PWA) on Vercel**

### **What You Get:**
- ✅ Installable from browser
- ✅ Updates automatically
- ✅ Works on any device
- ✅ No APK download needed
- ❌ Limited native features (no Firebase native, Camera may not work fully)

### **Setup Steps:**

This option requires converting your app to use web-compatible libraries (no React Native Firebase).

**Only use this if:**
- You're okay with limited features
- You want the fastest deployment
- You can use Firebase JS SDK instead of React Native Firebase

---

## 🎯 **My Recommendation**

### **For Your Use Case: Option 1 (EAS Build + EAS Update)** ⭐

**Why?**
1. ✅ **Free tier is enough** for your needs
2. ✅ **No Android SDK** setup required
3. ✅ **Push updates instantly** without rebuilding
4. ✅ **Expo hosts your APK** - just share the link
5. ✅ **All features work** (Firebase, Camera, etc.)
6. ✅ **Professional workflow**

### **Workflow After Setup:**

```bash
# 1. Make code changes
# ... edit your files ...

# 2. Test locally
npm start --dev-client

# 3. Push update to users
eas update --branch production --message "Added new features"

# Done! Users get update next time they open app (2-3 seconds)
```

**When to rebuild APK:**
- Only when adding new native libraries
- Only when changing app icon/splash
- Maybe once every few months

---

## 🚀 **Quick Start Command**

Run this to set up EAS deployment:

```bash
# Run the setup script
.\quick-android-setup.ps1

# Then build for production
eas build --profile production --platform android

# Get download link and share with users!
```

---

## 📊 **Comparison Table**

| Feature | EAS Build + Update | Self-Host APK | PWA on Vercel |
|---------|-------------------|---------------|---------------|
| **One-time setup** | 30 min | 30 min | 2 hours |
| **Android SDK needed** | ❌ No | ❌ No | ❌ No |
| **Push updates** | ✅ Instant | ❌ Manual | ✅ Instant |
| **All features work** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Monthly cost (free tier)** | ✅ Free | ✅ Free | ✅ Free |
| **Download experience** | Link → Install | Link → Install | Browser → Install |
| **Update experience** | Auto (OTA) | Re-download APK | Auto |

---

## 🆘 **Troubleshooting**

### "Project ID not found"
- Run `eas build:configure`
- Copy the project ID it generates
- Update `app.config.js` with the ID

### "Updates not received"
- Check if you're on correct channel
- Make sure app is using latest build
- Updates only work for JS changes, not native changes

### "Build failed"
- Check Firebase configuration
- Ensure all assets exist
- Review build logs on expo.dev

---

## 📞 **Ready to Deploy?**

Let's set it up! Run:

```bash
.\quick-android-setup.ps1
```

Then I'll guide you through the rest! 🚀

