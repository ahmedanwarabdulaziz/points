const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require('firebase/firestore');

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

async function migratePointsStandardization() {
  try {
    console.log('🔄 Starting points standardization migration...');
    console.log('📊 Updating all customer classes to use 10 points per $1 (standardized)');
    
    // Get all customer classes
    const classesRef = collection(db, 'customerClasses');
    const classesSnapshot = await getDocs(classesRef);
    
    console.log(`📋 Found ${classesSnapshot.size} customer classes to update`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classId = classDoc.id;
      
      console.log(`🔍 Processing class: ${classData.name} (${classId})`);
      
      // Check if this class already has the standardized rate
      if (classData.pointsPerDollar === 10) {
        console.log(`   ✅ Already standardized (10 points per $1) - skipping`);
        skippedCount++;
        continue;
      }
      
      // Update the class to use standardized rate
      const classRef = doc(db, 'customerClasses', classId);
      await updateDoc(classRef, {
        pointsPerDollar: 10, // Standardized rate
        updatedAt: new Date()
      });
      
      console.log(`   ✅ Updated from ${classData.pointsPerDollar} to 10 points per $1`);
      updatedCount++;
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} classes`);
    console.log(`   ⏭️  Skipped: ${skippedCount} classes (already standardized)`);
    console.log(`   📋 Total processed: ${classesSnapshot.size} classes`);
    
    console.log('\n🎉 Points standardization migration completed successfully!');
    console.log('💡 All customer classes now use the standardized rate of 10 points per $1');
    
  } catch (error) {
    console.error('❌ Error during points standardization migration:', error);
  }
}

// Run the migration
migratePointsStandardization();
