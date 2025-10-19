const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default industries
const defaultIndustries = [
  {
    name: 'Food & Beverage',
    description: 'Restaurants, cafes, bars, and food service businesses',
    icon: 'food-beverage',
    isActive: true
  },
  {
    name: 'Health & Wellness',
    description: 'Gyms, spas, clinics, and wellness centers',
    icon: 'health-wellness',
    isActive: true
  },
  {
    name: 'Retail & Shopping',
    description: 'Stores, boutiques, and retail businesses',
    icon: 'retail-shopping',
    isActive: true
  },
  {
    name: 'Entertainment & Recreation',
    description: 'Cinemas, theaters, and entertainment venues',
    icon: 'entertainment',
    isActive: true
  },
  {
    name: 'Professional Services',
    description: 'Consulting, legal, and professional service providers',
    icon: 'professional-services',
    isActive: true
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Salons, barbershops, and personal care services',
    icon: 'beauty-personal-care',
    isActive: true
  }
];

// Default business types
const defaultBusinessTypes = [
  // Food & Beverage types
  {
    industryId: '', // Will be set after industries are created
    name: 'Restaurant',
    description: 'Full-service dining establishments',
    icon: 'food-beverage',
    isActive: true
  },
  {
    industryId: '',
    name: 'Cafe',
    description: 'Coffee shops and casual dining',
    icon: 'food-beverage',
    isActive: true
  },
  {
    industryId: '',
    name: 'Bar',
    description: 'Bars, pubs, and nightlife venues',
    icon: 'food-beverage',
    isActive: true
  },
  {
    industryId: '',
    name: 'Fast Food',
    description: 'Quick service restaurants',
    icon: 'food-beverage',
    isActive: true
  },
  
  // Health & Wellness types
  {
    industryId: '',
    name: 'Gym',
    description: 'Fitness centers and gyms',
    icon: 'health-wellness',
    isActive: true
  },
  {
    industryId: '',
    name: 'Spa',
    description: 'Spas and wellness centers',
    icon: 'health-wellness',
    isActive: true
  },
  {
    industryId: '',
    name: 'Clinic',
    description: 'Medical and health clinics',
    icon: 'health-wellness',
    isActive: true
  },
  
  // Retail & Shopping types
  {
    industryId: '',
    name: 'Store',
    description: 'General retail stores',
    icon: 'retail-shopping',
    isActive: true
  },
  {
    industryId: '',
    name: 'Boutique',
    description: 'Specialty retail shops',
    icon: 'retail-shopping',
    isActive: true
  },
  
  // Beauty & Personal Care types
  {
    industryId: '',
    name: 'Salon',
    description: 'Hair and beauty salons',
    icon: 'beauty-personal-care',
    isActive: true
  },
  {
    industryId: '',
    name: 'Barbershop',
    description: 'Men\'s grooming services',
    icon: 'beauty-personal-care',
    isActive: true
  }
];

async function initializeCategories() {
  try {
    console.log('Initializing business categories...');
    
    // Add industries
    const industryIds = {};
    for (const industry of defaultIndustries) {
      const docRef = await addDoc(collection(db, 'businessIndustries'), {
        ...industry,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      industryIds[industry.name] = docRef.id;
      console.log(`Added industry: ${industry.name} (${docRef.id})`);
    }
    
    // Add business types with correct industry IDs
    for (const type of defaultBusinessTypes) {
      let industryId = '';
      
      // Map types to industries
      if (['Restaurant', 'Cafe', 'Bar', 'Fast Food'].includes(type.name)) {
        industryId = industryIds['Food & Beverage'];
      } else if (['Gym', 'Spa', 'Clinic'].includes(type.name)) {
        industryId = industryIds['Health & Wellness'];
      } else if (['Store', 'Boutique'].includes(type.name)) {
        industryId = industryIds['Retail & Shopping'];
      } else if (['Salon', 'Barbershop'].includes(type.name)) {
        industryId = industryIds['Beauty & Personal Care'];
      }
      
      if (industryId) {
        const docRef = await addDoc(collection(db, 'businessTypes'), {
          ...type,
          industryId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Added business type: ${type.name} (${docRef.id})`);
      }
    }
    
    console.log('Business categories initialized successfully!');
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

// Run the initialization
initializeCategories();
