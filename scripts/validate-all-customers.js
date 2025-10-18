const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, query, where } = require('firebase/firestore');

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

async function validateAllCustomers() {
  try {
    console.log('🔍 Validating all customers in the database...');
    
    // Get all users with customer role
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('role', '==', 'customer'));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log(`📊 Found ${usersSnapshot.size} customers to validate`);
    
    let validCustomers = 0;
    let invalidCustomers = 0;
    let fixedCustomers = 0;
    const issues = [];
    
    // Get all approved businesses for auto-assignment
    const businessesQuery = query(collection(db, 'businesses'), where('status', '==', 'approved'));
    const businessesSnapshot = await getDocs(businessesQuery);
    
    if (businessesSnapshot.empty) {
      console.error('❌ No approved businesses found. Cannot auto-assign customers.');
      return { validCustomers: 0, invalidCustomers: usersSnapshot.size, fixedCustomers: 0, issues: ['No approved businesses found'] };
    }
    
    const businesses = [];
    for (const businessDoc of businessesSnapshot.docs) {
      const businessData = businessDoc.data();
      
      // Find General class for this business
      const classesQuery = query(
        collection(db, 'customerClasses'),
        where('businessId', '==', businessDoc.id),
        where('name', '==', 'General')
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      if (!classesSnapshot.empty) {
        const generalClass = classesSnapshot.docs[0];
        businesses.push({
          id: businessDoc.id,
          name: businessData.name,
          generalClassId: generalClass.id
        });
      }
    }
    
    console.log(`📊 Found ${businesses.length} businesses with General classes`);
    
    if (businesses.length === 0) {
      console.error('❌ No businesses with General classes found. Cannot auto-assign customers.');
      return { validCustomers: 0, invalidCustomers: usersSnapshot.size, fixedCustomers: 0, issues: ['No businesses with General classes found'] };
    }
    
    const defaultBusiness = businesses[0]; // Use first business for auto-assignment
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`\n👤 Validating customer: ${userData.name || userData.email} (${userId})`);
      
      let isValid = true;
      let issue = null;
      
      // Check if customer has businessId and classId
      if (!userData.businessId || !userData.classId) {
        isValid = false;
        issue = `Missing businessId (${userData.businessId || 'MISSING'}) or classId (${userData.classId || 'MISSING'})`;
        console.log(`❌ ${issue}`);
      } else {
        // Validate that the assigned business and class exist
        try {
          const businessDoc = await getDoc(doc(db, 'businesses', userData.businessId));
          const classDoc = await getDoc(doc(db, 'customerClasses', userData.classId));
          
          if (!businessDoc.exists()) {
            isValid = false;
            issue = `Assigned business not found: ${userData.businessId}`;
            console.log(`❌ ${issue}`);
          } else if (!classDoc.exists()) {
            isValid = false;
            issue = `Assigned class not found: ${userData.classId}`;
            console.log(`❌ ${issue}`);
          } else {
            console.log(`✅ Valid assignment: Business=${businessDoc.data().name}, Class=${classDoc.data().name}`);
          }
        } catch (error) {
          isValid = false;
          issue = `Error validating assignment: ${error.message}`;
          console.log(`❌ ${issue}`);
        }
      }
      
      if (!isValid) {
        invalidCustomers++;
        issues.push({
          userId,
          name: userData.name || userData.email,
          issue: issue
        });
        
        // Try to fix the assignment
        try {
          console.log(`🔧 Attempting to fix customer assignment...`);
          await updateDoc(doc(db, 'users', userId), {
            businessId: defaultBusiness.id,
            classId: defaultBusiness.generalClassId,
            updatedAt: new Date()
          });
          
          console.log(`✅ Customer auto-assigned to: ${defaultBusiness.name} (General class)`);
          fixedCustomers++;
        } catch (error) {
          console.log(`❌ Failed to fix customer assignment: ${error.message}`);
        }
      } else {
        validCustomers++;
      }
    }
    
    console.log('\n📊 Validation Summary:');
    console.log(`✅ Valid customers: ${validCustomers}`);
    console.log(`❌ Invalid customers: ${invalidCustomers}`);
    console.log(`🔧 Fixed customers: ${fixedCustomers}`);
    
    if (issues.length > 0) {
      console.log('\n🚨 Issues found:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name} (${issue.userId})`);
        console.log(`   Issue: ${issue.issue}`);
      });
    }
    
    return { validCustomers, invalidCustomers, fixedCustomers, issues };
    
  } catch (error) {
    console.error('❌ Error validating customers:', error);
    throw error;
  }
}

// Run the validation
if (require.main === module) {
  validateAllCustomers()
    .then(({ validCustomers, invalidCustomers, fixedCustomers, issues }) => {
      console.log('\n🎉 Validation completed!');
      console.log(`✅ Valid customers: ${validCustomers}`);
      console.log(`❌ Invalid customers: ${invalidCustomers}`);
      console.log(`🔧 Fixed customers: ${fixedCustomers}`);
      
      if (issues.length > 0) {
        console.log(`\n📋 ${issues.length} issues were found and ${fixedCustomers} were fixed`);
      } else {
        console.log('\n🎉 All customers have valid business and class assignments!');
      }
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateAllCustomers };
