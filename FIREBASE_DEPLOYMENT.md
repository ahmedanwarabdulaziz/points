# Firebase Deployment Guide

## Prerequisites

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase project**:
   ```bash
   firebase init
   ```

## Deployment Steps

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 3. Deploy Hosting (if using Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

### 4. Deploy Everything

```bash
firebase deploy
```

## Security Rules Overview

The Firestore security rules implement a multi-tier access control system:

### **Admin Access**
- Full read/write access to all collections
- Can manage user roles
- Can approve/reject businesses
- Can view system analytics

### **Business Access**
- Can read/write their own business data
- Can manage their customers
- Can create and manage customer classes
- Can generate QR codes
- Can view their business analytics

### **Customer Access**
- Can read their own customer data
- Can read business info for their assigned business
- Can read rewards and classes for their business
- Can create referrals

### **Data Isolation**
- Each business has isolated customer data
- Customers can only access data from their assigned business
- Business owners can only manage their own customers
- Admins can access all data for management purposes

## Important Notes

1. **Test Rules**: Always test the security rules in the Firebase console before deploying
2. **Backup**: Create a backup of your current rules before deploying new ones
3. **Indexes**: The provided indexes are optimized for common queries in the app
4. **Monitoring**: Monitor the Firebase console for any rule violations after deployment

## Rule Testing

Use the Firebase console to test your rules:

1. Go to Firestore Database
2. Click on "Rules" tab
3. Use the "Rules playground" to test different scenarios
4. Test with different user roles and data access patterns

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Check if the user has the correct role and is authenticated
2. **Missing Indexes**: Create the required indexes in the Firebase console
3. **Rule Complexity**: Simplify rules if they're too complex for Firestore to evaluate

### Debug Steps:

1. Check user authentication status
2. Verify user role in the users collection
3. Test rule conditions in the Firebase console
4. Check for missing indexes
5. Review rule syntax and logic

## Production Considerations

1. **Rate Limiting**: Consider implementing rate limiting for API calls
2. **Data Validation**: Add client-side validation to prevent invalid data
3. **Monitoring**: Set up monitoring for security rule violations
4. **Backup Strategy**: Implement regular backups of your Firestore data
5. **Performance**: Monitor query performance and optimize indexes as needed
