const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, getDocs } = require('firebase/firestore');

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

async function createPermanentClasses() {
  try {
    console.log('Creating permanent customer classes...');
    
    // Get all businesses
    const businessesSnapshot = await getDocs(collection(db, 'businesses'));
    
    for (const businessDoc of businessesSnapshot.docs) {
      const businessId = businessDoc.id;
      const businessData = businessDoc.data();
      
      console.log(`Creating classes for business: ${businessData.name}`);
      
      // Create General class
      const generalClassRef = doc(collection(db, 'customerClasses'));
      await setDoc(generalClassRef, {
        id: generalClassRef.id,
        businessId: businessId,
        name: 'General',
        type: 'permanent',
        description: 'Default customer class for all customers',
        pointsPerDollar: 10, // Fixed at 10 points per $1 (standardized)
        referralBonus: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create Referral class
      const referralClassRef = doc(collection(db, 'customerClasses'));
      await setDoc(referralClassRef, {
        id: referralClassRef.id,
        businessId: businessId,
        name: 'Referral',
        type: 'permanent',
        description: 'Customer class for referred customers',
        pointsPerDollar: 10, // Fixed at 10 points per $1 (standardized)
        referralBonus: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Created classes for ${businessData.name}`);
    }
    
    console.log('✅ All permanent classes created successfully!');
  } catch (error) {
    console.error('❌ Error creating permanent classes:', error);
  }
}

createPermanentClasses();
