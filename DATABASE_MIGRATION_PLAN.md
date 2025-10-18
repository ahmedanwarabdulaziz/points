# Database Migration Plan: Consolidate Users and Customers

## 🎯 **Goal**
Consolidate the `users` and `customers` collections into a single `users` collection with role-specific fields.

## 📊 **Current Structure Issues**

### **Problems:**
1. **Data Duplication** - User info exists in both collections
2. **Complex Queries** - Need to join data from multiple collections
3. **Sync Issues** - Risk of data getting out of sync
4. **Performance** - Multiple queries to get complete user data

### **Current Collections:**
```
users/
  - id, email, role, createdAt, updatedAt

customers/
  - id, businessId, classId, userId, name, referralCode, 
    referredBy, points, totalEarned, totalRedeemed, 
    status, createdAt, lastActivity
```

## 🚀 **Proposed Unified Structure**

### **New Users Collection:**
```typescript
interface User {
  // Core fields (all users)
  id: string;
  email: string;
  role: 'admin' | 'business' | 'customer';
  createdAt: Date;
  updatedAt: Date;
  
  // Customer-specific fields (only for customers)
  name?: string;
  businessId?: string;
  classId?: string;
  referralCode?: string;
  referredBy?: string;
  points?: number;
  totalEarned?: number;
  totalRedeemed?: number;
  status?: 'active' | 'inactive' | 'suspended';
  lastActivity?: Date;
  
  // Business-specific fields (only for business owners)
  businessName?: string;
  businessDescription?: string;
  businessLogo?: string;
  businessStatus?: 'pending' | 'approved' | 'rejected';
  businessApprovedAt?: Date;
  businessApprovedBy?: string;
}
```

## 📋 **Migration Steps**

### **Phase 1: Update Types and Interfaces**
- ✅ Update TypeScript interfaces
- ✅ Create unified User interface
- ✅ Mark Customer interface as deprecated

### **Phase 2: Update AuthContext**
- ✅ Modify signUp function to create unified user documents
- ✅ Update user fetching logic
- ✅ Remove customer-specific queries

### **Phase 3: Update Components**
- ✅ Update dashboard components to use unified user data
- ✅ Modify business dashboard to work with unified structure
- ✅ Update admin dashboard to use unified user queries

### **Phase 4: Data Migration**
- ✅ Create migration script to merge existing data
- ✅ Move customer data to user documents
- ✅ Update references and relationships

### **Phase 5: Cleanup**
- ✅ Remove customers collection
- ✅ Update Firebase rules
- ✅ Remove deprecated code

## 🔧 **Implementation Benefits**

### **Advantages:**
1. **Single Source of Truth** - All user data in one place
2. **Simplified Queries** - No need to join collections
3. **Better Performance** - Single document reads
4. **Easier Maintenance** - Less complex data relationships
5. **Consistent Updates** - No sync issues between collections

### **Query Examples:**

#### **Before (Complex):**
```typescript
// Get customer data
const userDoc = await getDoc(doc(db, 'users', userId));
const customerDoc = await getDoc(doc(db, 'customers', userId));
const userData = { ...userDoc.data(), ...customerDoc.data() };
```

#### **After (Simple):**
```typescript
// Get user data (includes customer fields)
const userDoc = await getDoc(doc(db, 'users', userId));
const userData = userDoc.data();
```

## 📊 **Data Mapping**

### **Customer Data Migration:**
```typescript
// Old structure
customers/{userId} = {
  id, businessId, classId, userId, name, referralCode,
  referredBy, points, totalEarned, totalRedeemed, status,
  createdAt, lastActivity
}

// New structure (merged into users)
users/{userId} = {
  // Existing user fields
  id, email, role, createdAt, updatedAt,
  
  // Customer fields (for role === 'customer')
  name, businessId, classId, referralCode, referredBy,
  points, totalEarned, totalRedeemed, status, lastActivity
}
```

## 🚨 **Breaking Changes**

### **Components to Update:**
1. **AuthContext** - Remove customer-specific logic
2. **Dashboard Components** - Use unified user data
3. **Business Dashboard** - Update customer queries
4. **Admin Dashboard** - Update user management
5. **QR Signup** - Create unified user documents

### **Firebase Rules Updates:**
```firestore
// Remove customers collection rules
// Update users collection rules to include customer fields
match /users/{userId} {
  allow read, write: if request.auth != null;
  // Add customer-specific field validation
}
```

## ✅ **Next Steps**

1. **Update AuthContext** to use unified structure
2. **Create migration script** for existing data
3. **Update all components** to use new structure
4. **Test thoroughly** before removing old collections
5. **Deploy changes** and monitor for issues

This migration will significantly simplify the database structure and improve performance! 🎉
