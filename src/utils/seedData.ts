/**
 * Seed Data for Development
 * Add sample categories and subcategories for testing
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const seedCategories = async () => {
  try {
    console.log('🌱 Seeding professional categories...');
    
    const categoriesData = [
      {
        name: 'Food & Beverage',
        description: 'Restaurants, cafes, bars, and food service businesses',
        icon: '',
        color: '#f27921',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        name: 'Health & Wellness',
        description: 'Clinics, pharmacies, gyms, and wellness centers',
        icon: '',
        color: '#10b981',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        name: 'Retail & Shopping',
        description: 'Stores, boutiques, malls, and shopping centers',
        icon: '',
        color: '#8b5cf6',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        name: 'Beauty & Personal Care',
        description: 'Salons, spas, beauty clinics, and personal care services',
        icon: '',
        color: '#ec4899',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        name: 'Professional Services',
        description: 'Legal, accounting, consulting, and business services',
        icon: '',
        color: '#374151',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        name: 'Automotive',
        description: 'Car dealerships, repair shops, and automotive services',
        icon: '',
        color: '#dc2626',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        name: 'Home & Garden',
        description: 'Furniture stores, hardware, and home improvement',
        icon: '',
        color: '#059669',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        name: 'Entertainment',
        description: 'Cinemas, theaters, gaming centers, and entertainment venues',
        icon: '',
        color: '#7c3aed',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
    ];

    const categoryIds: string[] = [];
    
    for (const categoryData of categoriesData) {
      const docRef = await addDoc(collection(db, 'categories'), categoryData);
      categoryIds.push(docRef.id);
      console.log(`✅ Added category: ${categoryData.name} with ID: ${docRef.id}`);
    }
    
    console.log('🌱 Generated category IDs:', categoryIds);

    // Add professional subcategories for each category
    const subCategoriesData = [
      // Food & Beverage subcategories
      {
        categoryId: categoryIds[0],
        name: 'Restaurant',
        description: 'Full-service restaurants and fine dining establishments',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[0],
        name: 'Café',
        description: 'Coffee shops and casual dining cafes',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[0],
        name: 'Fast Food',
        description: 'Quick service restaurants and fast food chains',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[0],
        name: 'Bar & Pub',
        description: 'Bars, pubs, and nightlife establishments',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },

      // Health & Wellness subcategories
      {
        categoryId: categoryIds[1],
        name: 'Medical Clinic',
        description: 'General medical clinics and healthcare facilities',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[1],
        name: 'Pharmacy',
        description: 'Pharmacies and drug stores',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[1],
        name: 'Fitness Center',
        description: 'Gyms, fitness centers, and personal training',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[1],
        name: 'Dental Clinic',
        description: 'Dental clinics and oral healthcare services',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },

      // Retail & Shopping subcategories
      {
        categoryId: categoryIds[2],
        name: 'Fashion Store',
        description: 'Clothing, accessories, and fashion retailers',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[2],
        name: 'Electronics Store',
        description: 'Electronics, gadgets, and technology retailers',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[2],
        name: 'Supermarket',
        description: 'Grocery stores and supermarkets',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },

      // Beauty & Personal Care subcategories
      {
        categoryId: categoryIds[3],
        name: 'Hair Salon',
        description: 'Hair salons and barbershops',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[3],
        name: 'Spa & Wellness',
        description: 'Spas, massage therapy, and wellness centers',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[3],
        name: 'Beauty Clinic',
        description: 'Beauty clinics and cosmetic services',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },

      // Professional Services subcategories
      {
        categoryId: categoryIds[4],
        name: 'Law Firm',
        description: 'Legal services and law firms',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[4],
        name: 'Accounting Firm',
        description: 'Accounting and financial services',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[4],
        name: 'Consulting',
        description: 'Business consulting and advisory services',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },

      // Automotive subcategories
      {
        categoryId: categoryIds[5],
        name: 'Car Dealership',
        description: 'New and used car dealerships',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[5],
        name: 'Auto Repair',
        description: 'Auto repair shops and maintenance services',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[5],
        name: 'Auto Parts',
        description: 'Auto parts and accessories stores',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },

      // Home & Garden subcategories
      {
        categoryId: categoryIds[6],
        name: 'Furniture Store',
        description: 'Furniture and home furnishings',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[6],
        name: 'Hardware Store',
        description: 'Hardware, tools, and home improvement',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[6],
        name: 'Garden Center',
        description: 'Plants, gardening supplies, and landscaping',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },

      // Entertainment subcategories
      {
        categoryId: categoryIds[7],
        name: 'Cinema',
        description: 'Movie theaters and cinemas',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[7],
        name: 'Gaming Center',
        description: 'Gaming centers and arcades',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
      {
        categoryId: categoryIds[7],
        name: 'Event Venue',
        description: 'Event venues and party centers',
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
      },
    ];

    console.log(`🌱 Starting to add ${subCategoriesData.length} subcategories...`);
    for (const subCategoryData of subCategoriesData) {
      try {
        console.log(`🌱 Adding subcategory: ${subCategoryData.name} for category: ${subCategoryData.categoryId}`);
        await addDoc(collection(db, 'subCategories'), subCategoryData);
        console.log(`✅ Added subcategory: ${subCategoryData.name}`);
      } catch (error) {
        console.error(`❌ Failed to add subcategory ${subCategoryData.name}:`, error);
      }
    }

    console.log('🎉 Professional seeding completed successfully!');
    console.log(`📊 Added ${categoriesData.length} categories and ${subCategoriesData.length} subcategories`);
    return true;
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    return false;
  }
};

// Function to clear all test data
export const clearSeedData = async () => {
  try {
    console.log('🧹 Clearing seed data...');
    
    // Note: In production, you'd want to be more careful about this
    // For now, this is just for development testing
    console.log('⚠️ Clear data function not implemented - manual cleanup required');
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return false;
  }
};
