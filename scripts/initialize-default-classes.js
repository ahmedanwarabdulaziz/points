const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where } = require('firebase/firestore');

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

async function createDefaultClasses(businessId) {
  try {
    console.log(`🏢 Creating default classes for business: ${businessId}`);
    
    // Check if classes already exist for this business
    const classesRef = collection(db, 'customerClasses');
    const q = query(classesRef, where('businessId', '==', businessId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log(`✅ Default classes already exist for business ${businessId}. Skipping creation.`);
      return;
    }

    // Create General class
    const generalClassRef = doc(collection(db, 'customerClasses'));
    await setDoc(generalClassRef, {
      id: generalClassRef.id,
      businessId: businessId,
      name: 'General',
      type: 'permanent',
      description: 'Default customer class for all customers',
      features: {
        pointsPerDollar: 1,
        referralBonus: 0,
        specialRewards: [],
        restrictions: [],
        minSpend: 0,
        maxPointsPerTransaction: 1000,
        expiryDays: 365
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      customerCount: 0,
      totalPointsIssued: 0
    });

    // Create Referral class
    const referralClassRef = doc(collection(db, 'customerClasses'));
    await setDoc(referralClassRef, {
      id: referralClassRef.id,
      businessId: businessId,
      name: 'Referral',
      type: 'permanent',
      description: 'Customer class for referred customers',
      features: {
        pointsPerDollar: 1,
        referralBonus: 100,
        specialRewards: ['Welcome bonus', 'Double points on first purchase'],
        restrictions: [],
        minSpend: 0,
        maxPointsPerTransaction: 1000,
        expiryDays: 365
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      customerCount: 0,
      totalPointsIssued: 0
    });

    console.log('✅ Created default classes for business:', businessId);
    console.log('   - General class (1 point per dollar)');
    console.log('   - Referral class (1 point per dollar + 100 bonus)');
    
  } catch (error) {
    console.error('❌ Error creating default classes:', error);
  }
}

async function createDefaultClassesForAllBusinesses() {
  try {
    console.log('🔍 Finding all businesses...');
    
    // Get all businesses
    const businessesRef = collection(db, 'businesses');
    const businessesSnapshot = await getDocs(businessesRef);
    
    if (businessesSnapshot.empty) {
      console.log('❌ No businesses found in database');
      return;
    }

    console.log(`📊 Found ${businessesSnapshot.size} businesses`);
    
    // Create default classes for each business
    for (const businessDoc of businessesSnapshot.docs) {
      const businessData = businessDoc.data();
      console.log(`\n🏢 Processing business: ${businessData.name} (${businessDoc.id})`);
      
      await createDefaultClasses(businessDoc.id);
    }
    
    console.log('\n✅ Default classes creation completed for all businesses!');
    
  } catch (error) {
    console.error('❌ Error creating default classes for all businesses:', error);
  }
}

// Run the script
if (require.main === module) {
  createDefaultClassesForAllBusinesses()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createDefaultClasses, createDefaultClassesForAllBusinesses };
