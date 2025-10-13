/**
 * Add Business Screen
 * Super Admin can create new businesses
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, Timestamp, getDocs, query, where, orderBy, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Category, SubCategory } from '../../types';
import { uploadImage, getPlaceholderUrl } from '../../services/imageUpload';
import ColorPalettePicker from '../../components/common/ColorPalettePicker';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

const AddBusinessScreen = () => {
  const navigation = useNavigation();
  const { currentUser, userProfile } = useAuth();
  
  // Form state
  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#274290');
  const [secondaryColor, setSecondaryColor] = useState('#f27921');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  
  // Categories and subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Dropdown open/close state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subCategoryDropdownOpen, setSubCategoryDropdownOpen] = useState(false);
  
  // Points settings
  const [earningRate, setEarningRate] = useState('1');
  const [homeRedemptionRate, setHomeRedemptionRate] = useState('10');
  const [externalRedemptionRate, setExternalRedemptionRate] = useState('20');
  const [expirationMonths, setExpirationMonths] = useState('12');
  const [approvalThreshold, setApprovalThreshold] = useState('500');
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      loadSubCategories(selectedCategoryId);
    } else {
      setSubCategories([]);
      setSelectedSubCategoryId('');
    }
  }, [selectedCategoryId]);

  // Reset form when screen comes into focus (fixes old data persisting)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 AddBusinessScreen focused - resetting form...');
      
      // Reset all form fields to initial values
      setName('');
      setSelectedImage(null);
      setPrimaryColor('#274290');
      setSecondaryColor('#f27921');
      setSelectedCategoryId('');
      setSelectedSubCategoryId('');
      setOwnerEmail('');
      setOwnerPassword('');
      setOwnerName('');
      setEarningRate('1');
      setHomeRedemptionRate('10');
      setExternalRedemptionRate('20');
      setExpirationMonths('12');
      setApprovalThreshold('500');
      
      // Reset dropdown states
      setCategoryDropdownOpen(false);
      setSubCategoryDropdownOpen(false);
      
      console.log('✅ Form reset complete - ready for new business');
    }, [])
  );

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('📂 Loading categories...');
      
      const categoriesRef = collection(db, 'categories');
      // Try simple query first without orderBy to avoid index issues
      const snapshot = await getDocs(categoriesRef);
      
      console.log('📂 Categories found:', snapshot.size);
      
      const categoriesData: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Category;
        console.log('📂 Category:', data.name, '| Active:', data.isActive);
        // Only include active categories
        if (data.isActive) {
          categoriesData.push({ id: doc.id, ...data });
        }
      });
      
      // Sort manually
      categoriesData.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('📂 Active categories loaded:', categoriesData.length);
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubCategories = async (categoryId: string) => {
    try {
      console.log('📋 Loading subcategories for category:', categoryId);
      
      const subCategoriesRef = collection(db, 'subCategories');
      // Simple query without orderBy - we'll sort manually
      const snapshot = await getDocs(subCategoriesRef);
      
      console.log('📋 Total subcategories found:', snapshot.size);
      
      const subCategoriesData: SubCategory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as SubCategory;
        console.log('📋 SubCategory:', data.name, '| CategoryId:', data.categoryId, '| Active:', data.isActive);
        // Filter by categoryId and isActive
        if (data.categoryId === categoryId && data.isActive) {
          subCategoriesData.push({ id: doc.id, ...data });
        }
      });
      
      // Sort manually
      subCategoriesData.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('📋 Active subcategories for this category:', subCategoriesData.length);
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('❌ Error loading subcategories:', error);
      // Don't show error alert for subcategories, as they might not have index ready
      setSubCategories([]);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to upload a logo');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square image
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setLogoUrl(''); // Clear URL input when image is selected
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleCreateBusiness = async () => {
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
    if (!ownerPassword || ownerPassword.length < 6) {
      Alert.alert('Error', 'Owner password is required (min. 6 characters)');
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert('Error', 'Owner name is required');
      return;
    }

    setLoading(true);
    try {
      const now = Timestamp.now();
      
      // Determine final logo URL
      let finalLogoUrl = getPlaceholderUrl(name.charAt(0), primaryColor);
      
      console.log('📷 Logo processing:');
      console.log('  - selectedImage:', selectedImage ? 'YES' : 'NO');
      
      if (selectedImage) {
        // Upload image to ImgBB
        console.log('  - Uploading image to ImgBB...');
        setUploading(true);
        try {
          finalLogoUrl = await uploadImage(selectedImage, `${name.replace(/\s+/g, '_')}_logo`);
          console.log('  - ✅ Image uploaded successfully:', finalLogoUrl);
        } catch (uploadError: any) {
          console.error('  - ❌ Upload failed:', uploadError.message);
          Alert.alert('Upload Warning', 'Image upload failed. Using placeholder instead.');
          finalLogoUrl = getPlaceholderUrl(name.charAt(0), primaryColor);
        } finally {
          setUploading(false);
        }
      } else {
        console.log('  - No image selected, using placeholder with business color');
      }
      
      console.log('  - Final logoUrl to save:', finalLogoUrl);
      
      // Store admin credentials to re-authenticate after creating business owner
      const adminEmail = currentUser?.email;
      
      // Create business owner user account first
      let ownerUserId = '';
      try {
        console.log('📧 Creating business owner account with email:', ownerEmail);
        
        // Create the new user (this will log out the admin temporarily)
        const userCredential = await createUserWithEmailAndPassword(auth, ownerEmail, ownerPassword);
        ownerUserId = userCredential.user.uid;
        console.log('✅ Owner account created with UID:', ownerUserId);
        
        // Create user profile
        const userProfile = {
          id: ownerUserId,
          email: ownerEmail,
          name: ownerName,
          role: 'business_owner',
          mustChangePassword: true,
          createdAt: now,
          lastActive: now,
        };
        
        await setDoc(doc(db, 'users', ownerUserId), userProfile);
        console.log('✅ Owner profile created');
        
      } catch (authError: any) {
        console.error('❌ Error creating owner account:', authError);
        if (authError.code === 'auth/email-already-in-use') {
          Alert.alert('Error', 'This email is already registered. Please use a different email.');
        } else {
          Alert.alert('Error', 'Failed to create owner account: ' + authError.message);
        }
        setLoading(false);
        return;
      }
      
      // Create business document
      const businessData = {
        name: name.trim(),
        logoUrl: finalLogoUrl,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId,
        ownerEmail: ownerEmail.trim(),
        ownerName: ownerName.trim(),
        ownerId: ownerUserId, // Set to created owner's UID
        createdAt: now,
        status: 'active', // Active immediately when created by admin
        connectedBusinesses: [],
      };

      // Create business settings
      const settingsData = {
        pointsEarningRate: parseFloat(earningRate) || 1,
        homeRedemptionRate: parseFloat(homeRedemptionRate) || 10,
        externalRedemptionRate: parseFloat(externalRedemptionRate) || 20,
        pointsExpirationMonths: parseInt(expirationMonths) || 12,
        transactionApprovalThreshold: parseFloat(approvalThreshold) || 500,
        maxTransactionPerStaffDaily: 10000,
      };

      // Add business to Firestore
      const businessRef = await addDoc(collection(db, 'businesses'), businessData);
      
      // Add settings sub-document
      await setDoc(doc(db, 'businesses', businessRef.id, 'settings', 'config'), settingsData);
      
      // Link business to owner's user profile
      await setDoc(doc(db, 'users', ownerUserId), 
        { businessId: businessRef.id }, 
        { merge: true }
      );
      console.log('✅ Business linked to owner account');

      // Auto-create default profiles (General + Referred)
      console.log('📋 Creating default profiles...');
      
      // General Profile (default for all walk-in customers)
      const generalProfileRef = doc(collection(db, 'businesses', businessRef.id, 'profiles'));
      await setDoc(generalProfileRef, {
        id: generalProfileRef.id,
        name: 'General Members',
        description: 'Standard membership for all customers',
        badgeColor: Colors.primary,
        badgeIcon: '👤',
        qrCodeId: `GENERAL_${businessRef.id}`,
        visibility: 'public',
        isDefault: true,
        isDeletable: false,
        memberCount: 0,
        active: true,
        benefits: {
          earningMultiplier: 1.0,
          welcomeBonusPoints: 0,
          redemptionBonusPercent: 0,
          exclusiveRewards: false,
          referralBonus: {
            referrer: 100,
            referee: 100,
          },
        },
        createdAt: now,
        updatedAt: now,
      });
      console.log('✅ General profile created');

      // Referred Profile (for customers who join via referral)
      const referredProfileRef = doc(collection(db, 'businesses', businessRef.id, 'profiles'));
      await setDoc(referredProfileRef, {
        id: referredProfileRef.id,
        name: 'Referred Customers',
        description: 'Customers who joined through referrals',
        badgeColor: Colors.secondary,
        badgeIcon: '🎁',
        qrCodeId: `REFERRED_${businessRef.id}`,
        visibility: 'hidden',
        isDefault: false,
        isDeletable: false,
        memberCount: 0,
        active: true,
        benefits: {
          earningMultiplier: 1.5,
          welcomeBonusPoints: 200,
          redemptionBonusPercent: 0,
          exclusiveRewards: false,
          referralBonus: {
            referrer: 200,
            referee: 200,
          },
        },
        createdAt: now,
        updatedAt: now,
      });
      console.log('✅ Referred profile created');

      console.log('✅ Business created successfully:', businessRef.id);
      
      // Show success and refresh page to restore admin session
      // (Creating a new user account logs out the admin - Firebase limitation)
      Alert.alert(
        'Business Created!', 
        `Business "${name.trim()}" and owner account created successfully!\n\nThe page will refresh to restore your admin session.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              console.log('🔄 Refreshing page to restore admin session...');
              window.location.reload();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating business:', error);
      Alert.alert('Error', error.message || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create New Business</Text>
      
      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., XX Restaurant"
          value={name}
          onChangeText={setName}
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Business Logo</Text>
        
        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Text style={styles.removeImageText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Upload Button */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>
            {selectedImage ? '📷 Change Logo' : '📷 Upload Logo'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>
          {selectedImage ? 'Image selected - will be uploaded when you create the business' : 'Upload a logo or leave empty for auto-generated placeholder'}
        </Text>

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

        {/* Category Dropdown */}
        <Text style={styles.label}>Category *</Text>
        {loadingCategories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available. Please add categories first.</Text>
          </View>
        ) : (
          <View>
            {/* Dropdown Button */}
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

            {/* Dropdown Menu */}
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
                      <Text style={styles.dropdownOptionDescription}>{cat.description}</Text>
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
                {/* Dropdown Button */}
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

                {/* Dropdown Menu */}
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
                          <Text style={styles.dropdownOptionDescription}>{subCat.description}</Text>
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

        <Text style={styles.label}>Owner Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={ownerName}
          onChangeText={setOwnerName}
          autoCapitalize="words"
          placeholderTextColor={Colors.textLight}
        />

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

        <Text style={styles.label}>Owner Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Min. 6 characters"
          value={ownerPassword}
          onChangeText={setOwnerPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={Colors.textLight}
        />
        <Text style={styles.hint}>Business owner will use this to login</Text>
      </View>

      {/* Points Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Points Configuration</Text>
        
        <Text style={styles.label}>Earning Rate (points per $1)</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          value={earningRate}
          onChangeText={setEarningRate}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Home Redemption Rate (points = $1)</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          value={homeRedemptionRate}
          onChangeText={setHomeRedemptionRate}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />
        <Text style={styles.hint}>10 points = $1 at this business</Text>

        <Text style={styles.label}>External Redemption Rate (points = $1)</Text>
        <TextInput
          style={styles.input}
          placeholder="20"
          value={externalRedemptionRate}
          onChangeText={setExternalRedemptionRate}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />
        <Text style={styles.hint}>20 points = $1 at other businesses</Text>

        <Text style={styles.label}>Points Expiration (months)</Text>
        <TextInput
          style={styles.input}
          placeholder="12"
          value={expirationMonths}
          onChangeText={setExpirationMonths}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Transaction Approval Threshold ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="500"
          value={approvalThreshold}
          onChangeText={setApprovalThreshold}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />
        <Text style={styles.hint}>Transactions above this require admin approval</Text>
      </View>

      {/* Upload Progress Indicator */}
      {uploading && (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.uploadingText}>Uploading image...</Text>
        </View>
      )}

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.button, (loading || uploading) && styles.buttonDisabled]}
        onPress={handleCreateBusiness}
        disabled={loading || uploading}
      >
        {loading ? (
          <>
            <ActivityIndicator color={Colors.white} />
            <Text style={styles.buttonTextLoading}>Creating business...</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Create Business</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    padding: Config.SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Config.SPACING.xl,
  },
  section: {
    marginBottom: Config.SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.md,
  },
  colorSection: {
    marginVertical: Config.SPACING.lg,
    padding: Config.SPACING.md,
    backgroundColor: Colors.gray[100],
    borderRadius: Config.BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Config.SPACING.xs,
    fontStyle: 'italic',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Config.SPACING.md,
    backgroundColor: Colors.gray[50],
    borderRadius: Config.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    marginLeft: Config.SPACING.sm,
    fontSize: 14,
    color: Colors.textLight,
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
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Config.BORDER_RADIUS.md,
    backgroundColor: Colors.white,
    maxHeight: 300,
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
    marginBottom: Config.SPACING.xs,
  },
  selectedDropdownOptionText: {
    color: Colors.primary,
  },
  dropdownOptionDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: Config.SPACING.sm,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: Config.SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: Config.SPACING.md,
    alignItems: 'center',
    marginTop: Config.SPACING.md,
    marginBottom: Config.SPACING.xxl,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: Config.SPACING.md,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  removeImageButton: {
    marginTop: Config.SPACING.sm,
    backgroundColor: Colors.error + '10',
    paddingHorizontal: Config.SPACING.md,
    paddingVertical: Config.SPACING.sm,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  removeImageText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: Colors.secondary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: Config.SPACING.sm,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddBusinessScreen;

