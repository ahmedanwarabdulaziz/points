const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCxgAb3jpB35mDAXcbifMJHq9FxaHhYu5U",
  authDomain: "cadeala-cd61d.firebaseapp.com",
  projectId: "cadeala-cd61d",
  storageBucket: "cadeala-cd61d.firebasestorage.app",
  messagingSenderId: "202865893881",
  appId: "1:202865893881:web:85f345c1e8d1d246459d28"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function validateCustomerData() {
  try {
    console.log('🔍 Validating customer data...');
    
    // Get all users with customer role
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('role', '==', 'customer'));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log(`📊 Found ${usersSnapshot.size} customers`);
    
    let validCustomers = 0;
    let invalidCustomers = 0;
    const issues = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`\n👤 Checking customer: ${userData.name || userData.email} (${userId})`);
      
      // Check if customer has businessId and classId
      if (!userData.businessId || !userData.classId) {
        console.log(`❌ Missing business/class assignment:`, {
          businessId: userData.businessId || 'MISSING',
          classId: userData.classId || 'MISSING'
        });
        
        issues.push({
          userId,
          name: userData.name || userData.email,
          issue: 'Missing businessId or classId',
          businessId: userData.businessId,
          classId: userData.classId
        });
        
        invalidCustomers++;
      } else {
        // Validate that the business and class exist
        try {
          const businessDoc = await getDoc(doc(db, 'businesses', userData.businessId));
          const classDoc = await getDoc(doc(db, 'customerClasses', userData.classId));
          
          if (!businessDoc.exists()) {
            console.log(`❌ Business not found: ${userData.businessId}`);
            issues.push({
              userId,
              name: userData.name || userData.email,
              issue: 'Business not found',
              businessId: userData.businessId,
              classId: userData.classId
            });
            invalidCustomers++;
          } else if (!classDoc.exists()) {
            console.log(`❌ Class not found: ${userData.classId}`);
            issues.push({
              userId,
              name: userData.name || userData.email,
              issue: 'Class not found',
              businessId: userData.businessId,
              classId: userData.classId
            });
            invalidCustomers++;
          } else {
            console.log(`✅ Valid customer: Business=${businessDoc.data().name}, Class=${classDoc.data().name}`);
            validCustomers++;
          }
        } catch (error) {
          console.log(`❌ Error validating customer:`, error.message);
          invalidCustomers++;
        }
      }
    }
    
    console.log('\n📊 Validation Summary:');
    console.log(`✅ Valid customers: ${validCustomers}`);
    console.log(`❌ Invalid customers: ${invalidCustomers}`);
    
    if (issues.length > 0) {
      console.log('\n🚨 Issues found:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name} (${issue.userId})`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Business ID: ${issue.businessId || 'MISSING'}`);
        console.log(`   Class ID: ${issue.classId || 'MISSING'}`);
      });
    }
    
    return { validCustomers, invalidCustomers, issues };
    
  } catch (error) {
    console.error('❌ Error validating customer data:', error);
    throw error;
  }
}

async function fixCustomerAssignments() {
  try {
    console.log('🔧 Attempting to fix customer assignments...');
    
    // Get all businesses
    const businessesRef = collection(db, 'businesses');
    const businessesSnapshot = await getDocs(businessesRef);
    
    if (businessesSnapshot.empty) {
      console.log('❌ No businesses found. Cannot fix assignments.');
      return;
    }
    
    // Get default classes for each business
    const businesses = [];
    for (const businessDoc of businessesSnapshot.docs) {
      const businessData = businessDoc.data();
      const classesQuery = query(
        collection(db, 'customerClasses'),
        where('businessId', '==', businessDoc.id),
        where('type', '==', 'permanent')
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      if (!classesSnapshot.empty) {
        const generalClass = classesSnapshot.docs.find(doc => doc.data().name === 'General');
        if (generalClass) {
          businesses.push({
            id: businessDoc.id,
            name: businessData.name,
            generalClassId: generalClass.id
          });
        }
      }
    }
    
    console.log(`📊 Found ${businesses.length} businesses with default classes`);
    
    // Get customers without proper assignments
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('role', '==', 'customer'));
    const usersSnapshot = await getDocs(usersQuery);
    
    let fixedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      if (!userData.businessId || !userData.classId) {
        // Assign to first available business and its general class
        if (businesses.length > 0) {
          const business = businesses[0];
          
          try {
            await updateDoc(doc(db, 'users', userDoc.id), {
              businessId: business.id,
              classId: business.generalClassId,
              updatedAt: new Date()
            });
            
            console.log(`✅ Fixed customer ${userData.name || userData.email}: assigned to ${business.name}`);
            fixedCount++;
          } catch (error) {
            console.log(`❌ Failed to fix customer ${userData.name || userData.email}:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} customer assignments`);
    
  } catch (error) {
    console.error('❌ Error fixing customer assignments:', error);
    throw error;
  }
}

// Run the validation
if (require.main === module) {
  validateCustomerData()
    .then(({ validCustomers, invalidCustomers, issues }) => {
      console.log('\n📊 Final Results:');
      console.log(`✅ Valid customers: ${validCustomers}`);
      console.log(`❌ Invalid customers: ${invalidCustomers}`);
      
      if (invalidCustomers > 0) {
        console.log('\n🔧 Would you like to attempt to fix the assignments?');
        console.log('Run: node scripts/validate-customer-data.js --fix');
      }
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateCustomerData, fixCustomerAssignments };
