/**
 * Edit Category Screen
 * Super Admin can edit existing business categories
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Category, AdminStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';
import ColorPalettePicker from '../../components/common/ColorPalettePicker';

type EditCategoryScreenRouteProp = RouteProp<AdminStackParamList, 'EditCategory'>;

const EditCategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditCategoryScreenRouteProp>();
  const { categoryId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏢');
  const [color, setColor] = useState('#274290');

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
        setName(categoryData.name);
        setDescription(categoryData.description);
        setIcon(categoryData.icon);
        setColor(categoryData.color);
      } else {
        Alert.alert('Error', 'Category not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading category:', error);
      Alert.alert('Error', 'Failed to load category');
      navigation.goBack();
    }
  };

  const handleUpdateCategory = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a category description');
      return;
    }

    try {
      setLoading(true);
      
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        updatedAt: Timestamp.now(),
      });
      
      Alert.alert(
        'Success',
        'Category updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Professional category icons
  const categoryIcons = [
    { emoji: '🍽️', label: 'Food & Beverage' },
    { emoji: '💊', label: 'Health & Wellness' },
    { emoji: '🛍️', label: 'Retail & Shopping' },
    { emoji: '🎨', label: 'Beauty & Personal Care' },
    { emoji: '🏠', label: 'Home & Garden' },
    { emoji: '🚗', label: 'Automotive' },
    { emoji: '🎓', label: 'Education & Training' },
    { emoji: '💼', label: 'Professional Services' },
    { emoji: '🎪', label: 'Entertainment' },
    { emoji: '🏃', label: 'Sports & Fitness' },
    { emoji: '✈️', label: 'Travel & Tourism' },
    { emoji: '🔧', label: 'Repair & Maintenance' },
  ];

  const renderIconOption = (iconData: { emoji: string; label: string }) => (
    <TouchableOpacity
      key={iconData.emoji}
      style={[
        styles.iconOption,
        icon === iconData.emoji && styles.selectedIconOption,
      ]}
      onPress={() => setIcon(iconData.emoji)}
    >
      <Text style={styles.iconEmoji}>{iconData.emoji}</Text>
      <Text style={[
        styles.iconLabel,
        icon === iconData.emoji && styles.selectedIconLabel,
      ]}>
        {iconData.label}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Edit Category</Text>
        <Text style={styles.subtitle}>
          Update the category information
        </Text>
      </View>

      <View style={styles.form}>
        {/* Category Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Food & Beverage"
            placeholderTextColor={Colors.textLight}
            maxLength={50}
          />
        </View>

        {/* Category Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe this category and what types of businesses it includes"
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Category Icon */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category Icon</Text>
          <Text style={styles.inputHint}>
            Choose an icon that represents this category
          </Text>
          <View style={styles.iconsGrid}>
            {categoryIcons.map(renderIconOption)}
          </View>
        </View>

        {/* Category Color */}
        <View style={styles.inputGroup}>
          <ColorPalettePicker
            label="Category Color"
            selectedColor={color}
            onSelectColor={setColor}
            type="primary"
          />
        </View>

        {/* Preview */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={[styles.previewIcon, { backgroundColor: color }]}>
              <Text style={styles.previewIconText}>{icon}</Text>
            </View>
            <View style={styles.previewDetails}>
              <Text style={styles.previewName}>{name || 'Category Name'}</Text>
              <Text style={styles.previewDescription}>
                {description || 'Category description will appear here'}
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
          style={[styles.updateButton, loading && styles.disabledButton]}
          onPress={handleUpdateCategory}
          disabled={loading || !name.trim() || !description.trim()}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Updating...' : 'Update Category'}
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
  inputHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: Config.SPACING.md,
    fontStyle: 'italic',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Config.SPACING.sm,
  },
  iconOption: {
    alignItems: 'center',
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    width: '30%',
    marginBottom: Config.SPACING.sm,
  },
  selectedIconOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  iconEmoji: {
    fontSize: 24,
    marginBottom: Config.SPACING.xs,
  },
  iconLabel: {
    fontSize: 10,
    color: Colors.textDark,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedIconLabel: {
    color: Colors.primary,
    fontWeight: 'bold',
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
    lineHeight: 18,
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
  updateButton: {
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
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
});

export default EditCategoryScreen;

