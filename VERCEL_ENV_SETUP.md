# Vercel Environment Variables Setup Guide

## 🚨 CRITICAL: Add these environment variables to fix the 404 error

### Step 1: Go to Vercel Dashboard
1. Open [vercel.com](https://vercel.com)
2. Sign in to your account
3. Find your project (should be named "points" or similar)
4. Click on your project

### Step 2: Add Environment Variables
1. Click on **"Settings"** tab
2. Click on **"Environment Variables"** in the left sidebar
3. Add each variable below one by one:

## 📱 Firebase Configuration Variables

Add these 6 Firebase variables:

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyCxgAb3jpB35mDAXcbifMJHq9FxaHhYu5U
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: cadeala-cd61d.firebaseapp.com
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: cadeala-cd61d
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: cadeala-cd61d.firebasestorage.app
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 202865893881
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:202865893881:web:85f345c1e8d1d246459d28
Environment: Production, Preview, Development
```

## ☁️ Cloudinary Configuration Variables

Add these 5 Cloudinary variables:

```
Name: NEXT_PUBLIC_CLOUDINARY_URL
Value: cloudinary://984549417134457:zfKeoO4s5EUBljSHZYUmtBcUeSM@dbo3xd0df
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_CLOUDINARY_API_KEY
Value: 984549417134457
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_CLOUDINARY_API_SECRET
Value: zfKeoO4s5EUBljSHZYUmtBcUeSM
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: dbo3xd0df
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_CLOUDINARY_PRESET
Value: Points-app
Environment: Production, Preview, Development
```

### Step 3: Redeploy
1. After adding ALL variables, go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Or trigger a new deployment from GitHub

## 🔍 Troubleshooting

If you still get 404 errors after adding variables:

1. **Check variable names** - Make sure they start with `NEXT_PUBLIC_`
2. **Check environments** - Make sure variables are enabled for Production
3. **Redeploy** - Variables only take effect after redeployment
4. **Check logs** - Look at Vercel deployment logs for errors

## 📞 Need Help?

If you're still having issues:
1. Check the Vercel deployment logs
2. Make sure all 11 variables are added
3. Ensure variables are enabled for Production environment
4. Try redeploying the project

---
**Total Variables to Add: 11**
**Firebase: 6 variables**
**Cloudinary: 5 variables**
