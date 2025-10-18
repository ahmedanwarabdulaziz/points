const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxgAb3jpB35mDAXcbifMJHq9FxaHhYu5U",
  authDomain: "cadeala-cd61d.firebaseapp.com",
  projectId: "cadeala-cd61d",
  storageBucket: "cadeala-cd61d.firebasestorage.app",
  messagingSenderId: "202865893881",
  appId: "1:202865893881:web:85f345c1e8d1d246459d28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function testQRSignup() {
  try {
    console.log('🧪 Testing QR signup process...\n');
    
    // Test parameters (use real business and class IDs from your database)
    const testBusinessId = 'C4Xq7sloT3Tmfb2qmbfrdBcClb02'; // Replace with actual business ID
    const testClassId = 'yHj2lNR2vZE325TiR7m1'; // Replace with actual class ID
    const testEmail = `test-customer-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Test Customer';
    
    console.log('🔍 Test parameters:', {
      businessId: testBusinessId,
      classId: testClassId,
      email: testEmail,
      name: testName
    });
    
    // Step 1: Verify business and class exist
    console.log('\n📊 Step 1: Verifying business and class exist...');
    
    const businessDoc = await getDoc(doc(db, 'businesses', testBusinessId));
    if (!businessDoc.exists()) {
      console.error('❌ Business not found:', testBusinessId);
      return;
    }
    console.log('✅ Business found:', businessDoc.data().name);
    
    const classDoc = await getDoc(doc(db, 'customerClasses', testClassId));
    if (!classDoc.exists()) {
      console.error('❌ Class not found:', testClassId);
      return;
    }
    console.log('✅ Class found:', classDoc.data().name);
    
    // Step 2: Create test user
    console.log('\n📊 Step 2: Creating test user...');
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const newUser = userCredential.user;
    console.log('✅ User created:', newUser.uid);
    
    // Step 3: Create user document with assignment
    console.log('\n📊 Step 3: Creating user document with business/class assignment...');
    
    const userData = {
      id: newUser.uid,
      email: newUser.email,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Customer-specific fields with business/class assignment
      name: testName,
      businessId: testBusinessId, // Assign to the business from QR code
      classId: testClassId, // Assign to the class from QR code
      referralCode: generateReferralCode(),
      points: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      status: 'active',
      lastActivity: new Date()
    };
    
    console.log('🔍 User data to be saved:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      businessId: userData.businessId,
      classId: userData.classId,
      hasBusinessId: !!userData.businessId,
      hasClassId: !!userData.classId
    });
    
    await setDoc(doc(db, 'users', newUser.uid), userData);
    console.log('✅ User document created with assignment');
    
    // Step 4: Verify the assignment
    console.log('\n📊 Step 4: Verifying assignment...');
    
    const savedUserDoc = await getDoc(doc(db, 'users', newUser.uid));
    if (savedUserDoc.exists()) {
      const savedData = savedUserDoc.data();
      console.log('✅ Saved user data:', {
        name: savedData.name,
        businessId: savedData.businessId,
        classId: savedData.classId,
        hasBusinessId: !!savedData.businessId,
        hasClassId: !!savedData.classId,
        businessIdEmpty: savedData.businessId === '' || savedData.businessId === null,
        classIdEmpty: savedData.classId === '' || savedData.classId === null
      });
      
      if (savedData.businessId && savedData.classId) {
        console.log('🎉 SUCCESS: Customer properly assigned to business and class!');
      } else {
        console.log('❌ FAILURE: Customer assignment failed!');
      }
    } else {
      console.error('❌ Failed to retrieve saved user document');
    }
    
    console.log('\n🧹 Cleaning up test user...');
    // Note: In a real scenario, you might want to delete the test user
    // For now, we'll just log the user ID for manual cleanup
    console.log('Test user ID for cleanup:', newUser.uid);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testQRSignup();
