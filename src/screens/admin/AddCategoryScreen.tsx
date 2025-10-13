/**
 * Add Category Screen
 * Super Admin can create new business categories
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';
import ColorPalettePicker from '../../components/common/ColorPalettePicker';

const AddCategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#274290');

  const handleCreateCategory = async () => {
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
      
      const categoryData = {
        name: name.trim(),
        description: description.trim(),
        icon: '',
        color,
        isActive: true,
        businessCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user?.uid || 'system',
      };

      await addDoc(collection(db, 'categories'), categoryData);
      
      Alert.alert(
        'Success',
        'Category created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Category</Text>
        <Text style={styles.subtitle}>
          Add a new business category to organize businesses
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
            <View style={[styles.previewColorBar, { backgroundColor: color }]} />
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
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateCategory}
          disabled={loading || !name.trim() || !description.trim()}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Category'}
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
  previewColorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Config.SPACING.md,
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

export default AddCategoryScreen;
