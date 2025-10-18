const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc } = require('firebase/firestore');

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

async function checkCustomerClasses() {
  try {
    console.log('🔍 Checking all customer classes in the database...\n');
    
    // Get all customer classes
    const classesSnapshot = await getDocs(collection(db, 'customerClasses'));
    
    console.log(`📊 Found ${classesSnapshot.size} customer classes:\n`);
    
    const classes = [];
    classesSnapshot.forEach(doc => {
      const data = doc.data();
      classes.push({
        id: doc.id,
        name: data.name,
        businessId: data.businessId,
        isPermanent: data.isPermanent || false,
        createdAt: data.createdAt?.toDate?.() || 'Unknown'
      });
    });
    
    // Sort by creation date
    classes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Display all classes
    classes.forEach((cls, index) => {
      console.log(`${index + 1}. ID: ${cls.id}`);
      console.log(`   Name: ${cls.name}`);
      console.log(`   Business ID: ${cls.businessId}`);
      console.log(`   Is Permanent: ${cls.isPermanent}`);
      console.log(`   Created: ${cls.createdAt}`);
      console.log('   ---');
    });
    
    // Identify permanent classes (General and Referral)
    const permanentClasses = classes.filter(cls => 
      cls.name === 'General' || cls.name === 'Referral'
    );
    
    console.log(`\n✅ Permanent classes to KEEP (${permanentClasses.length}):`);
    permanentClasses.forEach(cls => {
      console.log(`   - ${cls.name} (ID: ${cls.id})`);
    });
    
    // Identify classes to delete
    const classesToDelete = classes.filter(cls => 
      cls.name !== 'General' && cls.name !== 'Referral'
    );
    
    console.log(`\n❌ Classes to DELETE (${classesToDelete.length}):`);
    classesToDelete.forEach(cls => {
      console.log(`   - ${cls.name} (ID: ${cls.id})`);
    });
    
    // Group by business
    const businessGroups = {};
    classes.forEach(cls => {
      if (!businessGroups[cls.businessId]) {
        businessGroups[cls.businessId] = [];
      }
      businessGroups[cls.businessId].push(cls);
    });
    
    console.log(`\n📊 Classes by Business:`);
    Object.keys(businessGroups).forEach(businessId => {
      console.log(`\nBusiness ID: ${businessId}`);
      const businessClasses = businessGroups[businessId];
      businessClasses.forEach(cls => {
        console.log(`  - ${cls.name} (${cls.isPermanent ? 'PERMANENT' : 'CUSTOM'}) - ID: ${cls.id}`);
      });
    });
    
    console.log(`\n🎯 Summary:`);
    console.log(`   Total classes: ${classes.length}`);
    console.log(`   Permanent classes: ${permanentClasses.length}`);
    console.log(`   Classes to delete: ${classesToDelete.length}`);
    
    if (classesToDelete.length > 0) {
      console.log(`\n⚠️  WARNING: ${classesToDelete.length} classes will be deleted!`);
      console.log(`   Make sure to check if any customers are assigned to these classes before deleting.`);
    }
    
  } catch (error) {
    console.error('❌ Error checking customer classes:', error);
  }
}

// Run the check
checkCustomerClasses();
