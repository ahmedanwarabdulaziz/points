/**
 * Categories Management Screen
 * Super Admin can view, add, edit, and manage business categories
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Category } from '../../types';
import { seedCategories } from '../../utils/seedData';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      const categoriesData: Category[] = [];
      snapshot.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() } as Category);
      });
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const categoryRef = doc(db, 'categories', category.id);
      await updateDoc(categoryRef, {
        isActive: !category.isActive,
        updatedAt: new Date(),
      });
      
      // Update local state
      setCategories(categories.map(cat => 
        cat.id === category.id 
          ? { ...cat, isActive: !cat.isActive, updatedAt: new Date() as any }
          : cat
      ));
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category status');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    console.log('🔥 DELETE FUNCTION CALLED!', category.name, 'ID:', category.id);
    
    // For now, let's try direct deletion without confirmation dialog
    const performDelete = async () => {
      try {
        console.log('🔥 STARTING DELETE OPERATION...');
        console.log('🔥 Category ID to delete:', category.id);
        
        const categoryRef = doc(db, 'categories', category.id);
        console.log('🔥 Document reference:', categoryRef);
        
        await deleteDoc(categoryRef);
        console.log('🔥 DELETE SUCCESSFUL!');
        
        // Update local state
        setCategories(prevCategories => {
          const newCategories = prevCategories.filter(cat => cat.id !== category.id);
          console.log('🔥 Local state updated, new count:', newCategories.length);
          return newCategories;
        });
        
        console.log('🔥 CATEGORY DELETED SUCCESSFULLY!');
      } catch (error: any) {
        console.error('🔥 DELETE ERROR:', error);
        console.error('🔥 Error code:', error.code);
        console.error('🔥 Error message:', error.message);
        Alert.alert('Delete Error', `Failed to delete: ${error.message}`);
      }
    };
    
    // Call the delete function directly
    performDelete();
  };

  const handleSeedData = async () => {
    console.log('🌱 SEED FUNCTION CALLED!');
    
    Alert.alert(
      'Seed Categories',
      'This will create sample categories and subcategories for testing. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Data',
          onPress: async () => {
            try {
              console.log('🌱 STARTING SEED OPERATION...');
              setLoading(true);
              
              const success = await seedCategories();
              console.log('🌱 Seed function result:', success);
              
              if (success) {
                console.log('🌱 SEED SUCCESSFUL! Reloading categories...');
                await loadCategories(); // Reload the categories list
                console.log('🌱 CATEGORIES SEEDED SUCCESSFULLY!');
                Alert.alert(
                  'Success!',
                  '8 categories and 30+ subcategories have been created. You can now register businesses!',
                  [{ text: 'OK' }]
                );
              } else {
                console.log('🌱 SEED FAILED!');
                Alert.alert('Error', 'Failed to seed categories. Please try again.');
              }
            } catch (error: any) {
              console.error('🌱 SEED ERROR:', error);
              console.error('🌱 Error message:', error.message);
              Alert.alert('Seed Error', `Failed to seed: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const testFirestoreConnection = async () => {
    try {
      console.log('🔍 Testing Firestore connection...');
      console.log('🔍 Database instance:', db);
      
      // Try to read from categories collection
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      console.log('🔍 Firestore connection successful!');
      console.log('🔍 Found categories:', snapshot.size);
      
      // Try to read from subcategories collection (without the composite query)
      const subCategoriesRef = collection(db, 'subCategories');
      const subSnapshot = await getDocs(subCategoriesRef);
      console.log('🔍 SubCategories in database:', subSnapshot.size);
      
      // Log some subcategory details
      subSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`🔍 SubCategory: ${data.name} → Category ID: ${data.categoryId}`);
      });
      
      Alert.alert(
        'Connection Test', 
        `✅ Successfully connected!\n\n📊 Categories: ${snapshot.size}\n📋 SubCategories: ${subSnapshot.size}\n\nCheck console for details!`
      );
    } catch (error: any) {
      console.error('❌ Firestore connection failed:', error);
      Alert.alert('Connection Test Failed', `Error: ${error.message}`);
    }
  };

  const renderCategoryCard = (category: Category) => {
    console.log('🔥 RENDERING CATEGORY CARD:', category.name);
    return (
    <View key={category.id} style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryColorBar, { backgroundColor: category.color }]} />
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <Text style={styles.businessCount}>
              {category.businessCount} {category.businessCount === 1 ? 'business' : 'businesses'}
            </Text>
          </View>
        </View>
        <View style={styles.categoryStatus}>
          <TouchableOpacity
            style={[
              styles.statusToggle,
              { backgroundColor: category.isActive ? Colors.success : Colors.gray[300] }
            ]}
            onPress={() => handleToggleActive(category)}
          >
            <Text style={styles.statusText}>
              {category.isActive ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SubCategories' as never, { categoryId: category.id } as never)}
        >
          <Text style={styles.actionButtonText}>Subcategories</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditCategory' as never, { categoryId: category.id } as never)}
        >
          <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            console.log('🔥 DELETE BUTTON TOUCHED!', category.name);
            handleDeleteCategory(category);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Categories</Text>
        <Text style={styles.subtitle}>
          Manage categories and subcategories for businesses
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddCategory' as never)}
          >
            <Text style={styles.addButtonText}>+ Add Category</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.seedButton}
            onPress={() => {
              console.log('🌱 SEED BUTTON TOUCHED!');
              handleSeedData();
            }}
          >
            <Text style={styles.seedButtonText}>🌱 Seed Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={testFirestoreConnection}
          >
            <Text style={styles.testButtonText}>🔍 Test Connection</Text>
          </TouchableOpacity>
        </View>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📂</Text>
          <Text style={styles.emptyStateTitle}>No Categories Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first business category to organize businesses by type
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate('AddCategory' as never)}
          >
            <Text style={styles.emptyStateButtonText}>Create Category</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.categoriesList}>
          {categories.map(renderCategoryCard)}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Config.SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Config.SPACING.md,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Config.SPACING.lg,
    paddingVertical: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  seedButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: Config.SPACING.lg,
    paddingVertical: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.lg,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  seedButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Config.SPACING.lg,
    paddingVertical: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.lg,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  testButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Config.SPACING.xl,
    marginTop: Config.SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: Config.SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Config.SPACING.xl,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Config.SPACING.xl,
    paddingVertical: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesList: {
    padding: Config.SPACING.lg,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.lg,
    padding: Config.SPACING.lg,
    marginBottom: Config.SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Config.SPACING.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryColorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Config.SPACING.md,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.xs,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Config.SPACING.xs,
    lineHeight: 18,
  },
  businessCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryStatus: {
    alignItems: 'flex-end',
  },
  statusToggle: {
    paddingHorizontal: Config.SPACING.md,
    paddingVertical: Config.SPACING.sm,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: Config.SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Config.SPACING.md,
    paddingHorizontal: Config.SPACING.sm,
    borderRadius: Config.BORDER_RADIUS.md,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  editButton: {
    backgroundColor: Colors.warning + '20',
  },
  editButtonText: {
    color: Colors.warning,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default CategoriesScreen;
