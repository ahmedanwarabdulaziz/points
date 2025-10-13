/**
 * Edit Business Screen
 * Super Admin can edit existing business details
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AdminStackParamList, Category, SubCategory } from '../../types';
import { uploadImage, getPlaceholderUrl, trackOldImage, isImgBBUrl } from '../../services/imageUpload';
import ColorPalettePicker from '../../components/common/ColorPalettePicker';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type EditBusinessScreenRouteProp = RouteProp<AdminStackParamList, 'EditBusiness'>;

const EditBusinessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditBusinessScreenRouteProp>();
  const { businessId } = route.params;
  
  // Form state
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#274290');
  const [secondaryColor, setSecondaryColor] = useState('#f27921');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  
  // Points settings
  const [earningRate, setEarningRate] = useState('1');
  const [homeRedemptionRate, setHomeRedemptionRate] = useState('10');
  const [externalRedemptionRate, setExternalRedemptionRate] = useState('20');
  const [expirationMonths, setExpirationMonths] = useState('12');
  const [approvalThreshold, setApprovalThreshold] = useState('500');
  const [maxTransactionPerStaff, setMaxTransactionPerStaff] = useState('10000');
  
  // Categories and subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subCategoryDropdownOpen, setSubCategoryDropdownOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadBusinessData();
  }, [businessId]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadSubCategories(selectedCategoryId);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('📂 Loading categories...');
      
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const categoriesData: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Category;
        if (data.isActive) {
          categoriesData.push({ id: doc.id, ...data });
        }
      });
      
      categoriesData.sort((a, b) => a.name.localeCompare(b.name));
      console.log('📂 Active categories loaded:', categoriesData.length);
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubCategories = async (categoryId: string) => {
    try {
      console.log('📋 Loading subcategories for category:', categoryId);
      
      const subCategoriesRef = collection(db, 'subCategories');
      const snapshot = await getDocs(subCategoriesRef);
      
      const subCategoriesData: SubCategory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as SubCategory;
        if (data.categoryId === categoryId && data.isActive) {
          subCategoriesData.push({ id: doc.id, ...data });
        }
      });
      
      subCategoriesData.sort((a, b) => a.name.localeCompare(b.name));
      console.log('📋 Active subcategories for this category:', subCategoriesData.length);
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('❌ Error loading subcategories:', error);
      setSubCategories([]);
    }
  };

  const pickImage = async () => {
    try {
      console.log('');
      console.log('📸📸📸 PICK IMAGE BUTTON CLICKED 📸📸📸');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📸 Permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Permission denied!');
        Alert.alert('Permission needed', 'Please allow access to your photos to upload a logo');
        return;
      }

      console.log('📸 Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📸 Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('');
        console.log('✅✅✅ IMAGE SELECTED SUCCESSFULLY! ✅✅✅');
        console.log('✅ Image URI:', result.assets[0].uri);
        console.log('✅ Image width:', result.assets[0].width);
        console.log('✅ Image height:', result.assets[0].height);
        console.log('');
        
        setSelectedImage(result.assets[0].uri);
        console.log('✅ selectedImage state updated!');
        console.log('✅ Now when you click "Update Business", this new image will be uploaded!');
        console.log('');
      } else {
        console.log('⚠️ Image picker was canceled or no image selected');
      }
    } catch (error: any) {
      console.log('');
      console.error('❌❌❌ IMAGE PICKER ERROR! ❌❌❌');
      console.error('❌ Error:', error.message);
      console.error('❌ Full error:', error);
      console.log('');
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    // Don't clear logoUrl - user might want to keep the existing URL
  };

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      console.log('📂 Loading business data for ID:', businessId);
      
      const businessRef = doc(db, 'businesses', businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (businessDoc.exists()) {
        const data = businessDoc.data();
        console.log('📂 Business data loaded:', data);
        
        setName(data.name || '');
        setLogoUrl(data.logoUrl || '');
        setPrimaryColor(data.primaryColor || '#274290');
        setSecondaryColor(data.secondaryColor || '#f27921');
        setSelectedCategoryId(data.categoryId || '');
        setSelectedSubCategoryId(data.subCategoryId || '');
        setOwnerEmail(data.ownerEmail || '');
        
        // Load business settings from subcollection
        try {
          const settingsRef = collection(db, 'businesses', businessId, 'settings');
          const settingsSnapshot = await getDocs(settingsRef);
          
          if (!settingsSnapshot.empty) {
            const settingsData = settingsSnapshot.docs[0].data();
            console.log('📂 Settings loaded:', settingsData);
            
            setEarningRate(String(settingsData.pointsEarningRate || 1));
            setHomeRedemptionRate(String(settingsData.homeRedemptionRate || 10));
            setExternalRedemptionRate(String(settingsData.externalRedemptionRate || 20));
            setExpirationMonths(String(settingsData.pointsExpirationMonths || 12));
            setApprovalThreshold(String(settingsData.transactionApprovalThreshold || 500));
            setMaxTransactionPerStaff(String(settingsData.maxTransactionPerStaffDaily || 10000));
          }
        } catch (settingsError) {
          console.log('⚠️ No settings found, using defaults');
        }
      } else {
        console.error('❌ Business not found');
        Alert.alert('Error', 'Business not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ Error loading business:', error);
      Alert.alert('Error', 'Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBusiness = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Category is required');
      return;
    }
    if (!selectedSubCategoryId) {
      Alert.alert('Error', 'SubCategory is required');
      return;
    }
    if (!ownerEmail.trim()) {
      Alert.alert('Error', 'Owner email is required');
      return;
    }

    try {
      setSaving(true);
      console.log('');
      console.log('🚀🚀🚀 STARTING BUSINESS UPDATE PROCESS 🚀🚀🚀');
      console.log('💾 Business ID:', businessId);
      console.log('💾 Business Name:', name);

      // Determine final logo URL
      let finalLogoUrl = logoUrl; // Keep existing logo by default
      
      console.log('');
      console.log('📷📷📷 LOGO PROCESSING START 📷📷📷');
      console.log('📷 Has new image selected?', selectedImage ? 'YES ✅' : 'NO ❌');
      console.log('📷 Current logo URL:', logoUrl);
      console.log('📷 Is current logo from image host?', (isImgBBUrl(logoUrl) || logoUrl.includes('cloudinary')) ? 'YES ✅' : 'NO ❌');
      
      if (selectedImage) {
        console.log('');
        console.log('📤📤📤 UPLOADING NEW IMAGE 📤📤📤');
        console.log('📤 Selected image URI:', selectedImage);
        console.log('📤 Upload name:', `${name.replace(/\s+/g, '_')}_logo`);
        
        setUploading(true);
        try {
          finalLogoUrl = await uploadImage(selectedImage, `${name.replace(/\s+/g, '_')}_logo`);
          console.log('');
          console.log('✅✅✅ IMAGE UPLOAD SUCCESS! ✅✅✅');
          console.log('✅ New logo URL:', finalLogoUrl);
          console.log('');
          
          // Track the old image (for reference)
          if (logoUrl && (isImgBBUrl(logoUrl) || logoUrl.includes('cloudinary'))) {
            console.log('📝📝📝 TRACKING OLD IMAGE 📝📝📝');
            console.log('📝 Old logo URL:', logoUrl);
            await trackOldImage(logoUrl, businessId);
            console.log('📝 Tracking complete!');
            console.log('');
          } else {
            console.log('⏭️ Old logo was not from an image hosting service, skipping tracking');
            console.log('⏭️ Old logo URL:', logoUrl);
            console.log('');
          }
        } catch (uploadError: any) {
          console.log('');
          console.error('❌❌❌ UPLOAD FAILED! ❌❌❌');
          console.error('❌ Error:', uploadError.message);
          console.error('❌ Full error:', uploadError);
          Alert.alert('Upload Warning', `Image upload failed: ${uploadError.message}. Keeping existing logo.`);
          // Keep the existing logoUrl if upload fails
          finalLogoUrl = logoUrl;
          console.log('');
        } finally {
          setUploading(false);
        }
      } else {
        console.log('⏭️ No new image selected, keeping existing logo');
        console.log('');
      }
      
      console.log('📋 Final logoUrl to save:', finalLogoUrl);
      
      // Ensure we have a valid logo URL (fallback to placeholder if needed)
      if (!finalLogoUrl || finalLogoUrl.trim() === '') {
        console.log('⚠️ No valid logo URL, using placeholder');
        finalLogoUrl = getPlaceholderUrl(name.charAt(0), primaryColor);
      }
      
      console.log('📋 Confirmed final logoUrl:', finalLogoUrl);
      console.log('');

      // Update business document
      console.log('💾💾💾 UPDATING FIRESTORE DOCUMENT 💾💾💾');
      const businessRef = doc(db, 'businesses', businessId);
      const updateData = {
        name: name.trim(),
        logoUrl: finalLogoUrl,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId,
        ownerEmail: ownerEmail.trim(),
        updatedAt: Timestamp.now(),
      };
      
      console.log('💾 Update data:', JSON.stringify(updateData, null, 2));
      await updateDoc(businessRef, updateData);
      console.log('');
      console.log('✅✅✅ BUSINESS DOCUMENT UPDATED IN FIRESTORE! ✅✅✅');
      console.log('');

      // Update or create settings subcollection
      const settingsRef = collection(db, 'businesses', businessId, 'settings');
      const settingsSnapshot = await getDocs(settingsRef);
      
      const settingsData = {
        pointsEarningRate: parseFloat(earningRate) || 1,
        homeRedemptionRate: parseFloat(homeRedemptionRate) || 10,
        externalRedemptionRate: parseFloat(externalRedemptionRate) || 20,
        pointsExpirationMonths: parseInt(expirationMonths) || 12,
        transactionApprovalThreshold: parseFloat(approvalThreshold) || 500,
        maxTransactionPerStaffDaily: parseFloat(maxTransactionPerStaff) || 10000,
        updatedAt: Timestamp.now(),
      };

      if (!settingsSnapshot.empty) {
        // Update existing settings
        const settingsDocRef = doc(db, 'businesses', businessId, 'settings', settingsSnapshot.docs[0].id);
        await updateDoc(settingsDocRef, settingsData);
        console.log('✅ Settings updated');
      } else {
        // Create new settings
        await addDoc(settingsRef, settingsData);
        console.log('✅ Settings created');
      }

      console.log('');
      console.log('🎉🎉🎉 BUSINESS UPDATE COMPLETE! 🎉🎉🎉');
      console.log('🎉 Business:', name.trim());
      console.log('🎉 New logo URL:', finalLogoUrl);
      console.log('');
      
      // Clear selectedImage to prevent re-upload
      setSelectedImage(null);
      
      // Navigate back to Businesses screen
      console.log('🔙 Navigating back to Businesses screen...');
      navigation.navigate('Businesses' as never);
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Success', `Business "${name.trim()}" updated successfully!`);
      }, 500);
    } catch (error: any) {
      console.log('');
      console.error('❌❌❌ BUSINESS UPDATE FAILED! ❌❌❌');
      console.error('❌ Error:', error.message);
      console.error('❌ Full error:', error);
      console.log('');
      Alert.alert('Error', error.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading business data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Business</Text>
          <Text style={styles.subtitle}>Update business information</Text>
        </View>

        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Joe's Restaurant"
          value={name}
          onChangeText={setName}
          placeholderTextColor={Colors.textLight}
        />

        {/* Logo Upload/URL Section */}
        <View style={styles.logoSection}>
          <Text style={styles.sectionTitle}>Business Logo</Text>
          
          {/* Image Preview */}
          {(selectedImage || (logoUrl && logoUrl.trim() && logoUrl !== 'https://via.placeholder.com/150')) && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage || logoUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
              {selectedImage && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <Text style={styles.removeImageText}>✕ Remove Selected Image</Text>
                </TouchableOpacity>
              )}
              {logoUrl && !selectedImage && (
                <Text style={styles.currentImageLabel}>Current Logo from URL</Text>
              )}
            </View>
          )}

          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
          >
            <Text style={styles.uploadButtonText}>
              📷 {selectedImage || logoUrl ? 'Change Logo' : 'Upload Logo'}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.selectedImageNotice}>
              <Text style={styles.selectedImageNoticeText}>
                ✅ New image selected! Click "Update Business" to upload and replace the old logo.
              </Text>
            </View>
          )}
          
          <Text style={styles.hint}>
            {selectedImage ? 'The new image will be uploaded when you save' : 'Upload a new logo to replace the current one'}
          </Text>
        </View>

        {/* Category Dropdown */}
        <Text style={styles.label}>Category *</Text>
        {loadingCategories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available.</Text>
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              {selectedCategoryId ? (
                <View style={styles.dropdownButtonContent}>
                  <View style={[
                    styles.dropdownColorBar,
                    { backgroundColor: categories.find(c => c.id === selectedCategoryId)?.color || Colors.primary }
                  ]} />
                  <Text style={styles.dropdownButtonText}>
                    {categories.find(c => c.id === selectedCategoryId)?.name}
                  </Text>
                </View>
              ) : (
                <Text style={styles.dropdownPlaceholder}>Select a category</Text>
              )}
              <Text style={styles.dropdownArrow}>{categoryDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {categoryDropdownOpen && (
              <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.dropdownOption,
                      selectedCategoryId === cat.id && styles.selectedDropdownOption
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(cat.id);
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    <View style={[styles.dropdownColorBar, { backgroundColor: cat.color }]} />
                    <View style={styles.dropdownContent}>
                      <Text style={[
                        styles.dropdownOptionText,
                        selectedCategoryId === cat.id && styles.selectedDropdownOptionText
                      ]}>
                        {cat.name}
                      </Text>
                    </View>
                    {selectedCategoryId === cat.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* SubCategory Dropdown */}
        {selectedCategoryId && (
          <>
            <Text style={styles.label}>SubCategory *</Text>
            {subCategories.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No subcategories available for this category.</Text>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setSubCategoryDropdownOpen(!subCategoryDropdownOpen)}
                >
                  {selectedSubCategoryId ? (
                    <View style={styles.dropdownButtonContent}>
                      <View style={[
                        styles.dropdownColorBar,
                        { backgroundColor: categories.find(c => c.id === selectedCategoryId)?.color || Colors.primary }
                      ]} />
                      <Text style={styles.dropdownButtonText}>
                        {subCategories.find(s => s.id === selectedSubCategoryId)?.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>Select a subcategory</Text>
                  )}
                  <Text style={styles.dropdownArrow}>{subCategoryDropdownOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {subCategoryDropdownOpen && (
                  <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
                    {subCategories.map((subCat) => (
                      <TouchableOpacity
                        key={subCat.id}
                        style={[
                          styles.dropdownOption,
                          selectedSubCategoryId === subCat.id && styles.selectedDropdownOption
                        ]}
                        onPress={() => {
                          setSelectedSubCategoryId(subCat.id);
                          setSubCategoryDropdownOpen(false);
                        }}
                      >
                        <View style={[
                          styles.dropdownColorBar,
                          { backgroundColor: categories.find(c => c.id === selectedCategoryId)?.color || Colors.primary }
                        ]} />
                        <View style={styles.dropdownContent}>
                          <Text style={[
                            styles.dropdownOptionText,
                            selectedSubCategoryId === subCat.id && styles.selectedDropdownOptionText
                          ]}>
                            {subCat.name}
                          </Text>
                        </View>
                        {selectedSubCategoryId === subCat.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </>
        )}

        {/* Color Pickers */}
        <View style={styles.colorSection}>
          <Text style={styles.sectionTitle}>Brand Colors</Text>
          
          <ColorPalettePicker
            label="Primary Color"
            selectedColor={primaryColor}
            onSelectColor={setPrimaryColor}
            type="primary"
          />
          
          <ColorPalettePicker
            label="Secondary Color (Accent)"
            selectedColor={secondaryColor}
            onSelectColor={setSecondaryColor}
            type="secondary"
          />
        </View>

        <Text style={styles.label}>Owner Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="owner@business.com"
          value={ownerEmail}
          onChangeText={setOwnerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.textLight}
        />

        {/* Points & Redemption Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Points & Redemption Settings</Text>
          
          <View style={styles.settingsGrid}>
            <View style={styles.settingItem}>
              <Text style={styles.label}>Points Earning Rate</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={earningRate}
                onChangeText={setEarningRate}
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.hint}>Points earned per $1 spent</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.label}>Home Redemption Rate</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                value={homeRedemptionRate}
                onChangeText={setHomeRedemptionRate}
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.hint}>Points needed per $1 at home business</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.label}>External Redemption Rate</Text>
              <TextInput
                style={styles.input}
                placeholder="20"
                value={externalRedemptionRate}
                onChangeText={setExternalRedemptionRate}
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.hint}>Points needed per $1 at other businesses</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.label}>Points Expiration (Months)</Text>
              <TextInput
                style={styles.input}
                placeholder="12"
                value={expirationMonths}
                onChangeText={setExpirationMonths}
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.hint}>Months until points expire</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.label}>Approval Threshold ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                value={approvalThreshold}
                onChangeText={setApprovalThreshold}
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.hint}>Transaction amount requiring approval</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.label}>Max Transaction Per Staff/Day ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                value={maxTransactionPerStaff}
                onChangeText={setMaxTransactionPerStaff}
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
              <Text style={styles.hint}>Daily limit per staff member</Text>
            </View>
          </View>
        </View>

        {/* Upload Progress Indicator */}
        {uploading && (
          <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.uploadingText}>Uploading image...</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving || uploading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (saving || uploading) && styles.buttonDisabled]}
            onPress={handleUpdateBusiness}
            disabled={saving || uploading}
          >
            {saving ? (
              <>
                <ActivityIndicator color={Colors.white} />
                <Text style={styles.buttonTextLoading}>Updating business...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Update Business</Text>
            )}
          </TouchableOpacity>
        </View>
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
    marginTop: Config.SPACING.md,
    fontSize: 16,
    color: Colors.textLight,
  },
  content: {
    padding: Config.SPACING.lg,
  },
  header: {
    marginBottom: Config.SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
    marginTop: Config.SPACING.md,
  },
  input: {
    backgroundColor: Colors.gray[100],
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    fontSize: 16,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoSection: {
    marginTop: Config.SPACING.lg,
    marginBottom: Config.SPACING.lg,
    padding: Config.SPACING.md,
    backgroundColor: Colors.gray[50],
    borderRadius: Config.BORDER_RADIUS.lg,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: Config.SPACING.md,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  removeImageButton: {
    marginTop: Config.SPACING.sm,
    paddingHorizontal: Config.SPACING.md,
    paddingVertical: Config.SPACING.xs,
    backgroundColor: Colors.error + '20',
    borderRadius: Config.BORDER_RADIUS.md,
  },
  removeImageText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  currentImageLabel: {
    marginTop: Config.SPACING.sm,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Config.SPACING.md,
    paddingHorizontal: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    marginVertical: Config.SPACING.sm,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImageNotice: {
    backgroundColor: Colors.success + '20',
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    marginTop: Config.SPACING.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  selectedImageNoticeText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Config.SPACING.xs,
    fontStyle: 'italic',
  },
  colorSection: {
    marginTop: Config.SPACING.lg,
    marginBottom: Config.SPACING.lg,
  },
  settingsSection: {
    marginTop: Config.SPACING.xl,
    marginBottom: Config.SPACING.lg,
    padding: Config.SPACING.md,
    backgroundColor: Colors.gray[50],
    borderRadius: Config.BORDER_RADIUS.lg,
  },
  settingsGrid: {
    gap: Config.SPACING.md,
  },
  settingItem: {
    marginBottom: Config.SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Config.SPACING.md,
    marginTop: Config.SPACING.xl,
    marginBottom: Config.SPACING.xl,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.gray[200],
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Config.SPACING.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: Config.BORDER_RADIUS.md,
    marginVertical: Config.SPACING.md,
  },
  uploadingText: {
    marginLeft: Config.SPACING.sm,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  buttonTextLoading: {
    marginLeft: Config.SPACING.sm,
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: Config.SPACING.md,
    backgroundColor: Colors.gray[50],
    borderRadius: Config.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: Config.SPACING.sm,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: Config.SPACING.sm,
  },
  dropdownMenu: {
    maxHeight: 250,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Config.BORDER_RADIUS.md,
    backgroundColor: Colors.white,
    marginTop: Config.SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Config.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  selectedDropdownOption: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownColorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Config.SPACING.md,
  },
  dropdownContent: {
    flex: 1,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  selectedDropdownOptionText: {
    color: Colors.primary,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: Config.SPACING.sm,
  },
});

export default EditBusinessScreen;

