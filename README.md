# Points Redeem App

Multi-tenant loyalty/points redemption system for iOS, Android, and Web.

## 🚀 Project Setup Complete!

### What's Been Built

✅ **Project Structure**
- React Native + Expo with TypeScript
- Professional folder structure
- All dependencies installed

✅ **Navigation System**
- Role-based navigation (Customer, Business, Admin)
- Authentication flow
- Bottom tabs for customer and business views
- Stack navigation for admin panel

✅ **Authentication**
- Firebase Auth integration
- Login, Register, and QR scanning screens
- AuthContext for state management

✅ **Type System**
- Complete TypeScript interfaces
- Database schema types
- Navigation types

✅ **Configuration**
- Brand colors (#274290, #f27921, #e6e7e8)
- App constants and config
- Environment variable support

## 📁 Project Structure

```
points-redeem-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/
│   │   ├── customer/
│   │   ├── business/
│   │   └── admin/
│   ├── screens/             # Screen components
│   │   ├── auth/           # Login, Register, ScanQR, Welcome
│   │   ├── customer/       # Home, Rewards, History, Profile
│   │   ├── business/       # Dashboard, Scan, Rewards, Customers, Settings
│   │   └── admin/          # Overview, Businesses, Approvals, etc.
│   ├── navigation/          # Navigation setup
│   │   ├── index.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── CustomerNavigator.tsx
│   │   ├── BusinessNavigator.tsx
│   │   └── AdminNavigator.tsx
│   ├── services/            # External services
│   │   └── firebase.ts
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   ├── constants/          # App constants
│   │   ├── Colors.ts
│   │   └── Config.ts
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── assets/             # Images, fonts, etc.
├── App.tsx                  # Main app entry
├── app.config.js           # Expo configuration
└── package.json
```

## 🔧 Setup Instructions

### 1. Firebase Configuration

Before running the app, you need to set up Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Enable Firebase Storage
6. Get your Firebase config from Project Settings

### 2. Environment Variables

1. Copy `env.example.txt` to `.env`:
   ```
   cp env.example.txt .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### 3. Install Dependencies

Dependencies are already installed, but if needed:
```bash
npm install
```

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Run on Web
npm run web
```

## 📱 Features Implemented

### Phase 1 - Foundation (✅ COMPLETE)

- ✅ Project structure and setup
- ✅ Firebase integration
- ✅ Authentication system
- ✅ Role-based navigation
- ✅ TypeScript types
- ✅ UI constants and theming
- ✅ Basic screens for all user roles

### Coming Next - Phase 2

- Customer wallet display
- Staff scanning functionality
- Points earning system
- Transaction history
- Basic rewards

## 🎨 Design System

### Colors
- **Primary Blue**: #274290 (Headers, main actions)
- **Secondary Orange**: #f27921 (Accent, CTAs)
- **Background Gray**: #e6e7e8 (Backgrounds)

### Typography
- Headers: Playfair Display (Serif)
- Body: Source Sans Pro (Sans-serif)
- Numbers: Monospace

## 🔐 User Roles

1. **Customer** - Earn and redeem points
2. **Business Owner** - Manage business, create offers
3. **Business Staff** - Scan customers, give points
4. **Super Admin** - Manage all businesses

## 📚 Documentation

- See `PROJECT_PLAN.txt` in parent directory for complete system documentation
- All TypeScript types defined in `src/types/index.ts`
- Firebase schema documented in project plan

## 🐛 Troubleshooting

### Firebase Connection Issues
- Make sure `.env` file exists and has correct credentials
- Check Firebase project settings
- Ensure Authentication and Firestore are enabled

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Build Issues
```bash
cd ios && pod install && cd ..
```

## 📝 Next Steps

1. Set up Firebase (see Setup Instructions above)
2. Test authentication flow
3. Begin Phase 2 development (customer wallet, points system)

## 🤝 Contributing

This is a private project. For questions or issues, contact the project owner.

---

**Built with ❤️ using React Native + Expo + Firebase**


