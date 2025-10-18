# Cadeala - Rewards & Gift Cards App

A professional Next.js application for earning points, redeeming rewards, and managing gift cards.

## Features

- **User Authentication**: Firebase Auth with email/password
- **Points System**: Earn points with purchases and activities
- **Rewards Redemption**: Redeem points for gift cards and rewards
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Professional UI**: Clean, modern interface with navy blue and orange branding

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Image Storage**: Cloudinary
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with your Firebase and Cloudinary credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   CLOUDINARY_URL=your_cloudinary_url
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Set up admin account**:
   - Navigate to [http://localhost:3000/admin-setup](http://localhost:3000/admin-setup)
   - Create the initial admin account
   - After setup, you can manage user roles directly from the database

5. **Deploy Firebase rules**:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # User dashboard
│   ├── gift-cards/        # Gift cards page
│   ├── how-it-works/      # How it works page
│   ├── rewards/         # Rewards page
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── Header.tsx         # Navigation header
│   └── Footer.tsx        # Footer component
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
└── lib/                  # Utility libraries
    ├── firebase.ts       # Firebase configuration
    └── cloudinary.ts     # Cloudinary configuration
```

## Features Overview

### 🏠 Homepage
- Hero section with call-to-action
- How it works section
- Benefits and features
- Responsive design

### 🔐 Authentication
- Sign up with email/password
- Sign in functionality
- Protected routes
- User session management

### 📊 Dashboard
- Points overview
- Recent activity
- Quick actions
- User profile

### 🎁 Rewards & Gift Cards
- Browse available rewards
- Filter by category
- Points required display
- Instant redemption

### 📱 Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Touch-friendly interface

## Brand Colors

- **Navy Blue**: #1e3a8a (Primary)
- **Orange**: #f97316 (Accent)
- **White**: #ffffff (Background)

## Deployment

The app is ready for deployment on Vercel, Netlify, or any other Next.js hosting platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.