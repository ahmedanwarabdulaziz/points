# Firebase Setup Checklist

## ✅ What You've Done Already

1. ✅ Created Firebase project: `points-project-f0968`
2. ✅ Got Firebase credentials
3. ✅ Credentials added to app

## 🔧 What You Need to Do Now

### Step 1: Enable Authentication

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **points-project-f0968**
3. Click **"Authentication"** in the left menu
4. Click **"Get Started"**
5. Click **"Sign-in method"** tab
6. Click **"Email/Password"**
7. **Enable** the toggle
8. Click **"Save"**

✅ **Done!** Users can now register and login.

### Step 2: Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (choose closest to you)
5. Click **"Enable"**

⚠️ **Important:** Test mode allows read/write for 30 days. We'll add security rules later.

### Step 3: Set Up Firestore Collections (Optional - Auto-Created)

The following collections will be created automatically when data is added:
- `users` - User profiles
- `businesses` - Business information
- `customers` - Customer profiles
- `transactions` - Point transactions
- `rewards` - Available rewards

No need to create them manually!

## 🔒 Security Rules (Add Later - Phase 2)

For now, test mode is fine. Later, we'll add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Verification Steps

### Test Authentication:
1. Run the app: `npm start`
2. Press 'w' for web
3. Try registering a new account
4. Check Firebase Console → Authentication → Users
5. You should see your new user!

### Test Firestore:
1. After registering, check Firestore Console
2. Look for `users` collection
3. You should see your user document!

## ⚠️ Common Issues

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Enable Email/Password in Authentication settings (Step 1)

### Issue: "Missing or insufficient permissions"
**Solution:** Make sure Firestore is in test mode or add security rules

### Issue: "Network request failed"
**Solution:** Check your internet connection and Firebase config

## 📝 Quick Test Checklist

- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firestore Database created (test mode)
- [ ] App starts without errors (`npm start`)
- [ ] Can see welcome screen
- [ ] Can register new user
- [ ] User appears in Firebase Console → Authentication
- [ ] User document created in Firestore → users collection

## 🎉 Once All Checks Pass

You're ready to start building Phase 2 features:
- Customer wallet
- Points earning
- Business dashboard
- QR code scanning

## 📞 Need Help?

Common Firebase Console URLs:
- **Authentication:** https://console.firebase.google.com/project/points-project-f0968/authentication
- **Firestore:** https://console.firebase.google.com/project/points-project-f0968/firestore
- **Project Settings:** https://console.firebase.google.com/project/points-project-f0968/settings/general

---

**Next:** After Firebase setup is complete, run `npm start` in the `points-redeem-app` directory!

