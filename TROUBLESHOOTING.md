# Firebase Permission Troubleshooting Guide

## Common "Missing or insufficient permissions" Errors

### 1. **User Document Missing**
**Problem**: User is authenticated but doesn't have a document in the `users` collection.

**Solution**:
```javascript
// Check if user document exists
const userDoc = await getDoc(doc(db, 'users', user.uid));
if (!userDoc.exists()) {
  // Create user document
  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    email: user.email,
    role: 'customer', // or 'admin', 'business'
    createdAt: new Date(),
    updatedAt: new Date()
  });
}
```

### 2. **Role Not Set**
**Problem**: User document exists but role is not set correctly.

**Solution**:
- Check the user document in Firestore console
- Ensure the role field is set to 'admin', 'business', or 'customer'
- Update the role if needed

### 3. **Business Document Missing**
**Problem**: Business user doesn't have a business document.

**Solution**:
```javascript
// For business users, ensure business document exists
if (appUser?.role === 'business') {
  const businessDoc = await getDoc(doc(db, 'businesses', user.uid));
  if (!businessDoc.exists()) {
    // Create business document or redirect to registration
  }
}
```

### 4. **Customer Document Missing**
**Problem**: Customer user doesn't have a customer document.

**Solution**:
```javascript
// For customer users, ensure customer document exists
if (appUser?.role === 'customer') {
  const customerDoc = await getDoc(doc(db, 'customers', user.uid));
  if (!customerDoc.exists()) {
    // Create customer document
    await setDoc(doc(db, 'customers', user.uid), {
      id: user.uid,
      businessId: '',
      classId: '',
      userId: user.uid,
      name: 'Customer Name',
      referralCode: generateReferralCode(),
      points: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date()
    });
  }
}
```

## Debugging Steps

### 1. **Check Authentication Status**
```javascript
console.log('User:', user);
console.log('App User:', appUser);
console.log('Loading:', loading);
```

### 2. **Test Firebase Rules**
Visit `/test-auth` page to run comprehensive tests.

### 3. **Check Firestore Console**
- Go to Firebase Console → Firestore Database
- Check if user documents exist
- Verify role assignments
- Check for any rule violations

### 4. **Test Individual Operations**
```javascript
// Test reading user document
try {
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  console.log('User document:', userDoc.data());
} catch (error) {
  console.error('Error reading user document:', error);
}

// Test writing to test collection
try {
  await setDoc(doc(db, 'test', user.uid), { test: true });
  console.log('Write test successful');
} catch (error) {
  console.error('Write test failed:', error);
}
```

## Quick Fixes

### 1. **Temporary Permissive Rules**
The current rules include a catch-all rule for development:
```javascript
// Temporary: Allow all authenticated users to read/write for development
match /{document=**} {
  allow read, write: if isAuthenticated();
}
```

### 2. **Manual Database Setup**
If you're still having issues, manually create the required documents:

1. **Create User Document**:
   ```javascript
   // In Firebase Console or code
   {
     id: "user_uid",
     email: "user@example.com",
     role: "customer", // or "admin", "business"
     createdAt: new Date(),
     updatedAt: new Date()
   }
   ```

2. **Create Customer Document** (if role is 'customer'):
   ```javascript
   {
     id: "user_uid",
     businessId: "",
     classId: "",
     userId: "user_uid",
     name: "Customer Name",
     referralCode: "ABC12345",
     points: 0,
     totalEarned: 0,
     totalRedeemed: 0,
     status: "active",
     createdAt: new Date(),
     lastActivity: new Date()
   }
   ```

### 3. **Admin Setup**
1. Go to `/admin-setup`
2. Create admin account
3. Manually update role in Firestore if needed

## Production Considerations

### 1. **Remove Debug Rules**
Before production, remove the catch-all rule:
```javascript
// Remove this in production
match /{document=**} {
  allow read, write: if isAuthenticated();
}
```

### 2. **Implement Proper Error Handling**
```javascript
try {
  const result = await someFirestoreOperation();
  return result;
} catch (error) {
  if (error.code === 'permission-denied') {
    // Handle permission error
    console.error('Permission denied:', error);
    // Redirect to appropriate page or show error
  } else {
    // Handle other errors
    console.error('Firestore error:', error);
  }
}
```

### 3. **Add Loading States**
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const checkPermissions = async () => {
    try {
      // Check user permissions
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  checkPermissions();
}, []);
```

## Testing URLs

- **Main App**: http://localhost:3000
- **Test Auth**: http://localhost:3000/test-auth
- **Admin Setup**: http://localhost:3000/admin-setup
- **Dashboard**: http://localhost:3000/dashboard (after login)

## Common Error Messages

1. **"Missing or insufficient permissions"**
   - Check user authentication
   - Verify user document exists
   - Check user role assignment

2. **"Document not found"**
   - Ensure document exists in Firestore
   - Check document ID matches user ID

3. **"Permission denied"**
   - Check Firebase security rules
   - Verify user has correct role
   - Test with more permissive rules

## Support

If you continue to have issues:
1. Check the Firebase Console for rule violations
2. Use the test page to identify specific problems
3. Check the browser console for detailed error messages
4. Verify all required documents exist in Firestore
