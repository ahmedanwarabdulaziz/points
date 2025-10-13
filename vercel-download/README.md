# Points Redeem App - Vercel Download Page

Host your APK on Vercel for easy downloads!

## 🚀 Quick Setup (3 Steps)

### Step 1: Build Your APK

**Option A: Using EAS Build (Recommended)**
```bash
cd points-redeem-app
npx eas build --profile production --platform android
```
Wait for email with APK link (15-20 min)

**Option B: Build Locally (Faster)**
If you have Android Studio set up:
```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

### Step 2: Add APK to This Folder

1. Download your APK from Expo (or find it in android/app/build/outputs/apk/)
2. Rename it to: `points-redeem.apk`
3. Copy it to the `public/` folder:
   ```
   vercel-download/public/points-redeem.apk
   ```

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**
```bash
cd vercel-download
npm install -g vercel
vercel deploy --prod
```

**Option B: Using Vercel Website**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub: `ahmedanwarabdulaziz/points`
4. Set root directory to: `vercel-download`
5. Deploy!

**Option C: Drag & Drop**
1. Go to https://vercel.com/new
2. Drag and drop the `vercel-download` folder
3. Deploy!

---

## 🌐 Your Download URL

After deployment, your app will be available at:
```
https://your-project.vercel.app
```

Or if you have a custom domain:
```
https://points.yourdomain.com
```

Users can download directly from this URL!

---

## 📱 How It Works

1. User visits your Vercel URL
2. Clicks "Download for Android"
3. APK downloads from Vercel servers
4. User installs on Android
5. Done! 🎉

---

## 🔄 Updating Your App

### For Code Changes (No APK Rebuild):

Use Expo Updates for instant updates:
```bash
cd points-redeem-app
npx eas update --branch production --message "Bug fixes"
```

Users get updates automatically!

### For Major Updates (New APK):

1. Build new APK: `npx eas build --platform android`
2. Download new APK
3. Replace `public/points-redeem.apk` with new version
4. Update version in `index.html` (line 69)
5. Redeploy to Vercel: `vercel deploy --prod`

---

## 📦 File Structure

```
vercel-download/
├── index.html          # Beautiful download page
├── vercel.json         # Vercel configuration
├── public/             # APK storage folder
│   └── points-redeem.apk  # Your APK file (you add this)
└── README.md           # This file
```

---

## ✅ Advantages of Vercel Hosting

✅ **No Expo Queue** - Build once, host forever  
✅ **Fast Downloads** - Vercel's global CDN  
✅ **Custom Domain** - Use your own domain  
✅ **Free Forever** - Generous free tier  
✅ **Easy Updates** - Just upload new APK  
✅ **Professional** - Beautiful download page  
✅ **Analytics Ready** - Add Google Analytics easily  

---

## 🎨 Customization

### Change Colors
Edit `index.html` lines 18 and 32:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change App Name
Edit `index.html` line 69:
```html
<h1>Points Redeem App</h1>
```

### Change Version
Edit `index.html` line 70:
```html
<p class="version">Version 1.0.0</p>
```

### Change Features
Edit `index.html` lines 93-100

---

## 🔗 Custom Domain (Optional)

### Add Your Domain to Vercel:

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `download.yourapp.com`)
4. Update DNS records as instructed
5. Done!

Now users can download from: `https://download.yourapp.com`

---

## 📊 Add Analytics (Optional)

### Google Analytics

Add this to `index.html` before `</head>`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your Google Analytics ID.

---

## 🚀 Complete Workflow

### First Time Setup:

```bash
# 1. Build APK
cd points-redeem-app
npx eas build --profile production --platform android

# 2. Wait for email (15-20 min), download APK

# 3. Add to Vercel folder
cp ~/Downloads/build-*.apk vercel-download/public/points-redeem.apk

# 4. Deploy to Vercel
cd vercel-download
vercel deploy --prod

# 5. Share your URL!
```

### Future Updates:

**For code changes:**
```bash
npx eas update --branch production
```

**For new APK:**
```bash
# Build new APK
npx eas build --profile production --platform android

# Download and replace
cp ~/Downloads/build-*.apk vercel-download/public/points-redeem.apk

# Redeploy
cd vercel-download
vercel deploy --prod
```

---

## 💡 Pro Tips

1. **Always use the same filename** (`points-redeem.apk`) so the download link never changes
2. **Update version number** in index.html after each release
3. **Use Expo Updates** for quick fixes - no APK rebuild needed!
4. **Set up custom domain** for a professional look
5. **Add analytics** to track downloads

---

## 🆘 Troubleshooting

### "APK not downloading"
- Check that `points-redeem.apk` is in the `public/` folder
- Make sure file size is under 100MB
- Try redeploying: `vercel deploy --prod`

### "Page not found"
- Check `vercel.json` configuration
- Make sure you deployed from the `vercel-download` folder
- Check Vercel deployment logs

### "Download link doesn't work on mobile"
- Mobile browsers handle downloads differently
- The link should work - check browser settings
- Try using Chrome or Firefox on Android

---

## 📞 Need Help?

**Vercel Docs:** https://vercel.com/docs  
**Expo Docs:** https://docs.expo.dev/build/introduction/

**Create an issue:** https://github.com/ahmedanwarabdulaziz/points/issues

---

## ✨ You're Ready!

1. Build APK: `npx eas build --platform android`
2. Add to `public/` folder
3. Deploy: `vercel deploy --prod`
4. Share your URL!

**No more waiting in queues! Host on Vercel! 🚀**

