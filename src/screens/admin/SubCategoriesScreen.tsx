/**
 * SubCategories Management Screen
 * Super Admin can view and manage subcategories for a specific category
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { SubCategory, Category, AdminStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type SubCategoriesScreenRouteProp = RouteProp<AdminStackParamList, 'SubCategories'>;

const SubCategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SubCategoriesScreenRouteProp>();
  const { categoryId } = route.params;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryAndSubCategories();
  }, [categoryId]);

  const loadCategoryAndSubCategories = async () => {
    try {
      setLoading(true);
      
      // Load category details
      console.log('🔍 Loading category with ID:', categoryId);
      const categoryRef = doc(db, 'categories', categoryId);
      const categoryDoc = await getDocs(query(collection(db, 'categories'), where('__name__', '==', categoryId)));
      console.log('🔍 Category query result:', categoryDoc.docs.length, 'documents found');
      
      if (!categoryDoc.empty) {
        const categoryData = { id: categoryDoc.docs[0].id, ...categoryDoc.docs[0].data() } as Category;
        console.log('🔍 Loaded category:', categoryData.name);
        setCategory(categoryData);
      } else {
        console.log('❌ No category found with ID:', categoryId);
      }
      
      // Load subcategories
      console.log('🔍 Loading subcategories for category ID:', categoryId);
      const subCategoriesRef = collection(db, 'subCategories');
      const q = query(
        subCategoriesRef, 
        where('categoryId', '==', categoryId),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      console.log('🔍 Subcategories query result:', snapshot.docs.length, 'documents found');
      
      const subCategoriesData: SubCategory[] = [];
      snapshot.forEach((doc) => {
        const subCategoryData = { id: doc.id, ...doc.data() } as SubCategory;
        console.log('🔍 Found subcategory:', subCategoryData.name);
        subCategoriesData.push(subCategoryData);
      });
      
      console.log('🔍 Total subcategories loaded:', subCategoriesData.length);
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      Alert.alert('Error', 'Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (subCategory: SubCategory) => {
    try {
      const subCategoryRef = doc(db, 'subCategories', subCategory.id);
      await updateDoc(subCategoryRef, {
        isActive: !subCategory.isActive,
        updatedAt: new Date(),
      });
      
      // Update local state
      setSubCategories(subCategories.map(sub => 
        sub.id === subCategory.id 
          ? { ...sub, isActive: !sub.isActive, updatedAt: new Date() as any }
          : sub
      ));
    } catch (error) {
      console.error('Error updating subcategory:', error);
      Alert.alert('Error', 'Failed to update subcategory status');
    }
  };

  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    Alert.alert(
      'Delete SubCategory',
      `Are you sure you want to delete "${subCategory.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'subCategories', subCategory.id));
              setSubCategories(subCategories.filter(sub => sub.id !== subCategory.id));
              Alert.alert('Success', 'SubCategory deleted successfully');
            } catch (error) {
              console.error('Error deleting subcategory:', error);
              Alert.alert('Error', 'Failed to delete subcategory');
            }
          }
        }
      ]
    );
  };

  const renderSubCategoryCard = (subCategory: SubCategory) => (
    <View key={subCategory.id} style={styles.subCategoryCard}>
      <View style={styles.subCategoryHeader}>
        <View style={styles.subCategoryInfo}>
          <View style={[styles.subCategoryColorBar, { backgroundColor: category?.color || Colors.primary }]} />
          <View style={styles.subCategoryDetails}>
            <Text style={styles.subCategoryName}>{subCategory.name}</Text>
            <Text style={styles.subCategoryDescription}>{subCategory.description}</Text>
            <Text style={styles.businessCount}>
              {subCategory.businessCount} {subCategory.businessCount === 1 ? 'business' : 'businesses'}
            </Text>
          </View>
        </View>
        <View style={styles.subCategoryStatus}>
          <TouchableOpacity
            style={[
              styles.statusToggle,
              { backgroundColor: subCategory.isActive ? Colors.success : Colors.gray[300] }
            ]}
            onPress={() => handleToggleActive(subCategory)}
          >
            <Text style={styles.statusText}>
              {subCategory.isActive ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subCategoryActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditSubCategory' as never, { 
            categoryId, 
            subCategoryId: subCategory.id 
          } as never)}
        >
          <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteSubCategory(subCategory)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading subcategories...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Categories</Text>
        </TouchableOpacity>
        
        {category && (
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryColorBar, { backgroundColor: category.color }]} />
            <View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          </View>
        )}
        
        <Text style={styles.title}>SubCategories</Text>
        <Text style={styles.subtitle}>
          Manage subcategories under {category?.name || 'this category'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSubCategory' as never, { categoryId } as never)}
        >
          <Text style={styles.addButtonText}>+ Add SubCategory</Text>
        </TouchableOpacity>
      </View>

      {subCategories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📋</Text>
          <Text style={styles.emptyStateTitle}>No SubCategories Yet</Text>
          <Text style={styles.emptyStateText}>
            Create subcategories to further organize businesses under {category?.name || 'this category'}
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate('AddSubCategory' as never, { categoryId } as never)}
          >
            <Text style={styles.emptyStateButtonText}>Create SubCategory</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.subCategoriesList}>
          {subCategories.map(renderSubCategoryCard)}
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Config.SPACING.lg,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Config.SPACING.lg,
    padding: Config.SPACING.md,
    backgroundColor: Colors.gray[50],
    borderRadius: Config.BORDER_RADIUS.lg,
  },
  categoryColorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Config.SPACING.md,
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
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Config.SPACING.lg,
    paddingVertical: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
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
  subCategoriesList: {
    padding: Config.SPACING.lg,
  },
  subCategoryCard: {
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
  subCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Config.SPACING.md,
  },
  subCategoryInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  subCategoryColorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Config.SPACING.md,
  },
  subCategoryDetails: {
    flex: 1,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.xs,
  },
  subCategoryDescription: {
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
  subCategoryStatus: {
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
  subCategoryActions: {
    flexDirection: 'row',
    gap: Config.SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Config.SPACING.sm,
    paddingHorizontal: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
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
    backgroundColor: Colors.error + '20',
  },
  deleteButtonText: {
    color: Colors.error,
  },
});

export default SubCategoriesScreen;
