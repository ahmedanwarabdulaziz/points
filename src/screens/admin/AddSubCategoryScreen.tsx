/**
 * Add SubCategory Screen
 * Super Admin can create new subcategories for a specific category
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { Category, AdminStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type AddSubCategoryScreenRouteProp = RouteProp<AdminStackParamList, 'AddSubCategory'>;

const AddSubCategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddSubCategoryScreenRouteProp>();
  const { categoryId } = route.params;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      const categoryDoc = await getDoc(categoryRef);
      
      if (categoryDoc.exists()) {
        const categoryData = { id: categoryDoc.id, ...categoryDoc.data() } as Category;
        setCategory(categoryData);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      Alert.alert('Error', 'Failed to load category');
    }
  };

  const handleCreateSubCategory = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a subcategory name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a subcategory description');
      return;
    }

    try {
      setLoading(true);
      
      const subCategoryData = {
        categoryId,
        name: name.trim(),
        description: description.trim(),
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user?.uid || 'system',
      };

      await addDoc(collection(db, 'subCategories'), subCategoryData);
      
      Alert.alert(
        'Success',
        'SubCategory created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating subcategory:', error);
      Alert.alert('Error', 'Failed to create subcategory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading category...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New SubCategory</Text>
        <Text style={styles.subtitle}>
          Add a new subcategory under "{category.name}"
        </Text>
      </View>

      <View style={styles.form}>
        {/* Parent Category Info */}
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            <Text style={styles.categoryIconText}>{category.icon}</Text>
          </View>
          <View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
        </View>

        {/* SubCategory Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>SubCategory Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Restaurant, Cafe, Bar"
            placeholderTextColor={Colors.textLight}
            maxLength={50}
          />
        </View>

        {/* SubCategory Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe this subcategory and what types of businesses it includes"
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Preview */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={[styles.previewIcon, { backgroundColor: category.color }]}>
              <Text style={styles.previewIconText}>📋</Text>
            </View>
            <View style={styles.previewDetails}>
              <Text style={styles.previewName}>{name || 'SubCategory Name'}</Text>
              <Text style={styles.previewDescription}>
                {description || 'SubCategory description will appear here'}
              </Text>
              <Text style={styles.previewParent}>
                Under: {category.name}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateSubCategory}
          disabled={loading || !name.trim() || !description.trim()}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create SubCategory'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  form: {
    padding: Config.SPACING.lg,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Config.SPACING.xl,
    padding: Config.SPACING.lg,
    backgroundColor: Colors.gray[50],
    borderRadius: Config.BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Config.SPACING.md,
  },
  categoryIconText: {
    fontSize: 24,
    color: Colors.white,
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
  inputGroup: {
    marginBottom: Config.SPACING.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Config.BORDER_RADIUS.md,
    padding: Config.SPACING.md,
    fontSize: 16,
    color: Colors.textDark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.lg,
    padding: Config.SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Config.SPACING.md,
  },
  previewIconText: {
    fontSize: 24,
    color: Colors.white,
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.xs,
  },
  previewDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Config.SPACING.xs,
    lineHeight: 18,
  },
  previewParent: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: Config.SPACING.lg,
    gap: Config.SPACING.md,
  },
  cancelButton: {
    flex: 1,
    padding: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  createButton: {
    flex: 1,
    padding: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
});

export default AddSubCategoryScreen;

