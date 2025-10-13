# Download Page for Points Redeem App

This folder contains a beautiful download page for your Android app that you can host on Vercel (or any static hosting).

## 🎯 What This Does

- Provides a professional download page for your APK
- Works on any device (mobile, tablet, desktop)
- Responsive and modern design
- Shows app features and information
- Installation instructions included

## 🚀 Deploy to Vercel (FREE)

### Option 1: Quick Deploy (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd download-page
   vercel deploy --prod
   ```

4. **You'll get a URL like:** `https://points-redeem.vercel.app`

### Option 2: Deploy via GitHub

1. Push this folder to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Set root directory to `download-page`
6. Deploy!

## 📝 Configuration

### Update the APK Download Link

After building your app with EAS, you'll get a download link like:
`https://expo.dev/artifacts/eas/abc123xyz.apk`

**Update in `index.html`:**
```javascript
// Line ~200 in index.html
const APK_URL = 'https://expo.dev/artifacts/eas/YOUR_BUILD_ID.apk';
```

Replace `YOUR_BUILD_ID` with your actual build ID from Expo.

### Customize the Content

Edit `index.html` to customize:
- App name and description
- Version number
- Features list
- Support email
- App size
- Screenshots (add img tags)

## 🔄 Update Workflow

### When You Release a New Version:

1. **Build new APK:**
   ```bash
   eas build --profile production --platform android
   ```

2. **Get the new download link from Expo**

3. **Update `index.html`:**
   - Change the `APK_URL` to the new link
   - Update version number
   - Update "What's New" section (if added)

4. **Deploy updated page:**
   ```bash
   vercel deploy --prod
   ```

Users visiting the page will now download the new version!

## 🎨 Customization Ideas

### Add Screenshots

```html
<div class="screenshots">
  <img src="screenshot1.png" alt="App Screenshot">
  <img src="screenshot2.png" alt="App Screenshot">
</div>
```

### Add What's New Section

```html
<div class="whats-new">
  <h3>What's New in v1.0.0</h3>
  <ul>
    <li>New rewards system</li>
    <li>Improved QR scanning</li>
    <li>Bug fixes and performance improvements</li>
  </ul>
</div>
```

### Add QR Code for Easy Download

Users can scan with their phone:

```html
<div class="qr-code">
  <img src="qr-code.png" alt="Scan to download">
  <p>Scan with your phone to download</p>
</div>
```

Generate QR code at: https://www.qr-code-generator.com/

## 📱 Alternative: Host APK on Vercel

If you want to host the APK file itself on Vercel:

1. **Copy your APK to this folder:**
   ```bash
   cp ~/Downloads/points-redeem.apk ./points-redeem-v1.0.0.apk
   ```

2. **Update APK_URL in index.html:**
   ```javascript
   const APK_URL = './points-redeem-v1.0.0.apk';
   ```

3. **Deploy:**
   ```bash
   vercel deploy --prod
   ```

**⚠️ Note:** Vercel has file size limits (100MB on Pro, 50MB on free tier). If your APK is larger, use the Expo-hosted link instead.

## 🌐 Custom Domain

Want to use your own domain? (e.g., `download.pointsredeem.com`)

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Update DNS records as instructed

## 📊 Analytics (Optional)

Add Google Analytics to track downloads:

```html
<!-- Add in <head> section of index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Track downloads:
```javascript
document.getElementById('downloadBtn').addEventListener('click', function() {
  gtag('event', 'download', {
    'event_category': 'app',
    'event_label': 'android_apk'
  });
});
```

## 🔒 Security Best Practices

1. **Always use HTTPS** (Vercel provides this automatically)
2. **Keep APK link updated** to latest secure version
3. **Consider adding checksum** for APK verification
4. **Monitor for suspicious activity**

## 🆘 Troubleshooting

### "File not found" when downloading
- Check that APK_URL is correct
- Ensure APK is accessible (not expired)

### Page not updating after deploy
- Clear browser cache
- Vercel cache might be active (wait a few minutes)
- Force refresh: Ctrl+Shift+R

### APK won't install on phone
- User needs to enable "Install from unknown sources"
- APK might be corrupted (re-download)
- Device might not meet Android version requirements

## 📞 Need Help?

See the main `DEPLOYMENT_GUIDE.md` in the parent directory for complete deployment instructions!

