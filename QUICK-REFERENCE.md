# 📱 Quick Reference - GitHub APK Distribution

## 🚀 One-Time Setup (5 minutes)

### 1. Install GitHub CLI
```powershell
winget install --id GitHub.cli
```
Or download from: https://cli.github.com/

### 2. Login to GitHub
```powershell
gh auth login
```

### 3. Login to Expo
```powershell
npx eas login
```

**That's it! You're ready to go!**

---

## 📦 First Release (20 minutes)

### Step 1: Push to GitHub (2 minutes)
```powershell
.\push-to-github.ps1
```
✅ Code is now on GitHub: https://github.com/ahmedanwarabdulaziz/points

### Step 2: Build APK (15-20 minutes)
```powershell
.\build-local-apk.ps1
```
⏳ Wait for build to complete
📧 You'll get email with download link

### Step 3: Create Release (1 minute)
```powershell
.\create-github-release.ps1
```
✅ APK is now downloadable from GitHub!

**Download Link:**
```
https://github.com/ahmedanwarabdulaziz/points/releases/latest
```

---

## 🎯 Quick Commands

| What | Command | Time |
|------|---------|------|
| Push code | `.\push-to-github.ps1` | 1 min |
| Build APK | `.\build-local-apk.ps1` | 15-20 min |
| Create release | `.\create-github-release.ps1` | 1 min |
| Quick update (no rebuild) | `.\push-update.bat` | 2 min |
| All-in-one menu | `.\QUICK-START-GITHUB.bat` | - |

---

## 📱 Share Your App

### Option 1: Direct Link
Share this link - users click and download:
```
https://github.com/ahmedanwarabdulaziz/points/releases/latest
```

### Option 2: Download Page
Deploy the download page and share the URL:
```powershell
cd download-page-github
vercel deploy --prod
```

### Option 3: QR Code
Create a QR code pointing to:
```
https://github.com/ahmedanwarabdulaziz/points/releases/latest
```

---

## 🔄 Update Workflows

### For Code Changes (JavaScript, UI):
```powershell
# Make your changes, then:
.\push-update.bat
```
⚡ **Instant updates** - No rebuild needed!
Users get updates next time they open the app.

### For New Versions (Native changes):
```powershell
# Make your changes, then:
.\build-local-apk.ps1        # Build new APK
.\create-github-release.ps1  # Create new release
```

---

## 🔗 Your Important Links

| What | URL |
|------|-----|
| **Repository** | https://github.com/ahmedanwarabdulaziz/points |
| **Releases** | https://github.com/ahmedanwarabdulaziz/points/releases |
| **Latest Download** | https://github.com/ahmedanwarabdulaziz/points/releases/latest |
| **Expo Builds** | https://expo.dev/accounts/ahmedanwarabdulaziz/projects/points-redeem-app/builds |

---

## 💡 Pro Tips

### 1. Use "latest" URL
Always share this URL - it automatically points to newest version:
```
https://github.com/ahmedanwarabdulaziz/points/releases/latest
```

### 2. Version Naming
Use semantic versioning:
- `1.0.0` - First release
- `1.0.1` - Bug fix
- `1.1.0` - New feature
- `2.0.0` - Major update

### 3. Pre-releases
For beta testing, mark as pre-release when creating GitHub release

### 4. Instant Updates
For most changes, use `push-update.bat` instead of rebuilding APK

---

## 🆘 Common Issues

### "GitHub CLI not found"
```powershell
winget install --id GitHub.cli
# Or download from: https://cli.github.com/
```

### "Not authenticated with GitHub"
```powershell
gh auth login
```

### "Build fails"
1. Check logs: https://expo.dev/accounts/ahmedanwarabdulaziz/projects/points-redeem-app/builds
2. Clear cache: `npm start --clear`
3. Reinstall: `npm install`

### "APK won't install"
1. Enable "Install from Unknown Sources"
2. Check Android version (need 5.0+)
3. Check storage space (~50 MB needed)

---

## ✅ Success Checklist

First Time Setup:
- [ ] Installed GitHub CLI
- [ ] Logged in to GitHub
- [ ] Logged in to Expo
- [ ] Pushed code to GitHub
- [ ] Built APK successfully
- [ ] Created GitHub release
- [ ] Tested download on Android
- [ ] Shared link with users

---

## 📞 Need Help?

**Full Guide:** Read `GITHUB_DOWNLOAD_SETUP.md`

**Issues:** https://github.com/ahmedanwarabdulaziz/points/issues

**Expo Docs:** https://docs.expo.dev/build/introduction/

---

## 🎉 Quick Start Summary

```powershell
# First time:
.\push-to-github.ps1           # 1 min
.\build-local-apk.ps1          # 20 min (wait)
.\create-github-release.ps1    # 1 min

# Share this link:
# https://github.com/ahmedanwarabdulaziz/points/releases/latest

# Future updates:
.\push-update.bat              # 2 min - instant updates!

# Or for major updates:
.\build-local-apk.ps1          # 20 min
.\create-github-release.ps1    # 1 min
```

**That's it! Your app is now downloadable from GitHub! 🚀**

