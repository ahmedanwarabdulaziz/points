# Vercel Deployment Guide

## Required Environment Variables

Add these environment variables in your Vercel dashboard:

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin SDK (for server-side operations)
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### Cloudinary Configuration
```
CLOUDINARY_URL=your_cloudinary_url
```

## Deployment Steps

1. **Go to Vercel Dashboard**
   - Navigate to your project settings
   - Go to Environment Variables section

2. **Add Environment Variables**
   - Copy the values from your `.env.local` file
   - Add each variable with the exact name and value

3. **Redeploy**
   - Trigger a new deployment after adding environment variables

## Common Issues

### Build Failures
- Ensure all environment variables are set
- Check that Firebase Admin SDK credentials are correct
- Verify the private key format (should include `\n` for newlines)

### Runtime Errors
- Check that all required environment variables are present
- Verify Firebase project ID matches across all variables
- Ensure service account has proper permissions

## Firebase Admin SDK Setup

1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate a new private key
3. Copy the JSON content
4. Extract the values for environment variables:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Troubleshooting

If deployment still fails:
1. Check Vercel build logs for specific error messages
2. Ensure all dependencies are in `package.json`
3. Verify Next.js configuration is correct
4. Check that all imports are valid
