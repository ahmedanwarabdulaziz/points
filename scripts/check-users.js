const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function checkUsers() {
  try {
    console.log('🔍 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 Fetching users from database...');
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log('📊 Total users found:', usersSnapshot.docs.length);
    
    if (usersSnapshot.docs.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('\n📋 Users in database:');
    usersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Role: ${data.role}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Business ID: ${data.businessId || 'N/A'}`);
      console.log(`   Created: ${data.createdAt?.toDate?.() || 'N/A'}`);
      console.log('---');
    });
    
    // Count by role
    const roleCounts = {};
    usersSnapshot.docs.forEach(doc => {
      const role = doc.data().role || 'unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    console.log('\n📊 Users by role:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkUsers();
