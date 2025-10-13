# Download Page for Points Redeem App

This is a simple, beautiful download page for your APK hosted on GitHub Releases.

## 🚀 Quick Deploy

### Option 1: GitHub Pages (Free)

1. **Update the download URL in `index.html`:**
   - Line 87: Change the `href` to your actual GitHub release URL
   - Format: `https://github.com/ahmedanwarabdulaziz/points/releases/latest/download/points-redeem-v1.0.0.apk`

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add download page"
   git push
   ```

3. **Enable GitHub Pages:**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select source: `main` branch, `/download-page-github` folder
   - Save

4. **Your download page will be at:**
   ```
   https://ahmedanwarabdulaziz.github.io/points/
   ```

### Option 2: Vercel (Free)

1. **Update the download URL in `index.html`** (same as above)

2. **Deploy to Vercel:**
   ```bash
   cd download-page-github
   vercel deploy --prod
   ```

3. **Your download page will be at:**
   ```
   https://your-project.vercel.app
   ```

### Option 3: Netlify (Free)

1. **Update the download URL in `index.html`** (same as above)

2. **Deploy:**
   - Drag and drop the `download-page-github` folder to Netlify
   - Or use Netlify CLI:
     ```bash
     cd download-page-github
     netlify deploy --prod
     ```

## 📝 Customization

### Change Colors:

Edit the gradient colors in `index.html` (lines 18 and 32):
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Replace with your brand colors!

### Change App Name:

Line 69: Update `<h1>Points Redeem App</h1>`

### Change Version:

Line 70: Update `<p class="version">Version 1.0.0</p>`

### Change Icon:

Line 68: Replace the emoji `🎁` with any emoji or use an `<img>` tag

### Update Features List:

Lines 93-100: Modify the feature list

## 🔗 Important Links to Update

1. **Download URL** (Line 87):
   ```html
   href="https://github.com/ahmedanwarabdulaziz/points/releases/latest/download/points-redeem-v1.0.0.apk"
   ```

2. **GitHub Repository Link** (Line 120):
   ```html
   href="https://github.com/ahmedanwarabdulaziz/points"
   ```

## 🎨 Features

- ✅ Responsive design (works on all devices)
- ✅ Beautiful gradient background
- ✅ Clear installation instructions
- ✅ Professional look
- ✅ Fast loading
- ✅ No dependencies

## 📱 How It Looks

- **Desktop:** Centered card with gradient background
- **Mobile:** Full-width responsive design
- **Download Button:** Large, easy to tap
- **Features:** Clear bullet points
- **Requirements:** Highlighted installation info

## 🔄 Updating for New Versions

When you release a new version:

1. Update version number (line 70)
2. Update download URL (line 87) - or use `/latest/` to always get latest
3. Update file size if changed (line 93)
4. Add new features to the list if any
5. Redeploy

## 💡 Pro Tip: Always Latest Version

To always point to the latest release, use this URL format:
```html
href="https://github.com/ahmedanwarabdulaziz/points/releases/latest/download/points-redeem-v1.0.0.apk"
```

Or even better, if you always name your APK the same way:
```html
href="https://github.com/ahmedanwarabdulaziz/points/releases/latest"
```

This way users always get the newest version!

