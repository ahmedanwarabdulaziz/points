const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function debugCustomerAssignments() {
  try {
    console.log('🔍 Debugging customer assignments...\n');
    
    // Get all customers
    const customersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'customer')
    );
    const customersSnapshot = await getDocs(customersQuery);
    
    console.log(`📊 Found ${customersSnapshot.size} customers:\n`);
    
    const customers = [];
    customersSnapshot.forEach(doc => {
      const data = doc.data();
      customers.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        businessId: data.businessId,
        classId: data.classId,
        role: data.role,
        createdAt: data.createdAt?.toDate?.() || 'Unknown',
        hasBusinessId: !!data.businessId,
        hasClassId: !!data.classId,
        businessIdEmpty: data.businessId === '' || data.businessId === null || data.businessId === undefined,
        classIdEmpty: data.classId === '' || data.classId === null || data.classId === undefined
      });
    });
    
    // Sort by creation date
    customers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Display all customers
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. Customer: ${customer.name || 'N/A'} (${customer.email})`);
      console.log(`   ID: ${customer.id}`);
      console.log(`   Business ID: ${customer.businessId || 'MISSING'}`);
      console.log(`   Class ID: ${customer.classId || 'MISSING'}`);
      console.log(`   Has Business ID: ${customer.hasBusinessId}`);
      console.log(`   Has Class ID: ${customer.hasClassId}`);
      console.log(`   Business ID Empty: ${customer.businessIdEmpty}`);
      console.log(`   Class ID Empty: ${customer.classIdEmpty}`);
      console.log(`   Created: ${customer.createdAt}`);
      console.log('   ---');
    });
    
    // Analyze issues
    const customersWithIssues = customers.filter(customer => 
      customer.businessIdEmpty || customer.classIdEmpty
    );
    
    const customersWithoutBusinessId = customers.filter(customer => 
      customer.businessIdEmpty
    );
    
    const customersWithoutClassId = customers.filter(customer => 
      customer.classIdEmpty
    );
    
    console.log(`\n📊 Analysis:`);
    console.log(`   Total customers: ${customers.length}`);
    console.log(`   Customers with issues: ${customersWithIssues.length}`);
    console.log(`   Customers without businessId: ${customersWithoutBusinessId.length}`);
    console.log(`   Customers without classId: ${customersWithoutClassId.length}`);
    
    if (customersWithIssues.length > 0) {
      console.log(`\n❌ Customers with assignment issues:`);
      customersWithIssues.forEach(customer => {
        console.log(`   - ${customer.name} (${customer.email})`);
        if (customer.businessIdEmpty) console.log(`     Missing businessId`);
        if (customer.classIdEmpty) console.log(`     Missing classId`);
      });
    }
    
    // Group by business
    const businessGroups = {};
    customers.forEach(customer => {
      if (customer.businessId && !customer.businessIdEmpty) {
        if (!businessGroups[customer.businessId]) {
          businessGroups[customer.businessId] = [];
        }
        businessGroups[customer.businessId].push(customer);
      }
    });
    
    console.log(`\n📊 Customers by Business:`);
    Object.keys(businessGroups).forEach(businessId => {
      console.log(`\nBusiness ID: ${businessId}`);
      const businessCustomers = businessGroups[businessId];
      businessCustomers.forEach(customer => {
        console.log(`  - ${customer.name} (Class: ${customer.classId || 'MISSING'})`);
      });
    });
    
    // Check for customers without business assignment
    const unassignedCustomers = customers.filter(customer => 
      customer.businessIdEmpty
    );
    
    if (unassignedCustomers.length > 0) {
      console.log(`\n⚠️  Unassigned customers (${unassignedCustomers.length}):`);
      unassignedCustomers.forEach(customer => {
        console.log(`   - ${customer.name} (${customer.email}) - Created: ${customer.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging customer assignments:', error);
  }
}

// Run the debug
debugCustomerAssignments();
