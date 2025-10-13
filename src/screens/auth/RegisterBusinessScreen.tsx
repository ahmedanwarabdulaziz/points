/**
 * Business Owner Registration Screen
 * Professional implementation with working scroll on all platforms
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { Category, SubCategory } from '../../types';
import { getPlaceholderUrl, uploadImage } from '../../services/imageUpload';
import ColorPalettePicker from '../../components/common/ColorPalettePicker';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

const RegisterBusinessScreen = () => {
  const navigation = useNavigation();
  
  // Owner Info
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#274290');
  const [secondaryColor, setSecondaryColor] = useState('#f27921');
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
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

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadSubCategories(selectedCategoryId);
    } else {
      setSubCategories([]);
      setSelectedSubCategoryId('');
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const categoriesData: Category[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as Category;
        if (data.isActive) {
          categoriesData.push({ ...data, id: docSnapshot.id });
        }
      });
      
      categoriesData.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubCategories = async (categoryId: string) => {
    try {
      const subCategoriesRef = collection(db, 'subCategories');
      const snapshot = await getDocs(subCategoriesRef);
      
      const subCategoriesData: SubCategory[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as SubCategory;
        if (data.categoryId === categoryId && data.isActive) {
          subCategoriesData.push({ ...data, id: docSnapshot.id });
        }
      });
      
      subCategoriesData.sort((a, b) => a.name.localeCompare(b.name));
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubCategories([]);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Please allow access to your photos to upload a logo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleRegister = async () => {
    if (!ownerName || !email || !password || !confirmPassword) {
      alert('Please fill in all personal fields');
      return;
    }

    if (!businessName) {
      alert('Business name is required');
      return;
    }

    if (!selectedCategoryId || !selectedSubCategoryId) {
      alert('Please select category and subcategory');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email!,
        name: ownerName,
        role: 'business_owner',
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now(),
      });

      const businessRef = doc(collection(db, 'businesses'));
      const businessId = businessRef.id;
      
      let finalLogoUrl = getPlaceholderUrl(businessName.charAt(0), primaryColor);
      
      if (selectedImage) {
        setUploading(true);
        try {
          finalLogoUrl = await uploadImage(selectedImage, `${businessName.replace(/\s+/g, '_')}_logo`);
        } catch (uploadError: any) {
          console.error('Upload failed:', uploadError);
          finalLogoUrl = getPlaceholderUrl(businessName.charAt(0), primaryColor);
        } finally {
          setUploading(false);
        }
      }

      await setDoc(businessRef, {
        id: businessId,
        name: businessName,
        logoUrl: finalLogoUrl,
        primaryColor,
        secondaryColor,
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId,
        ownerEmail: email,
        ownerId: user.uid,
        createdAt: Timestamp.now(),
        status: 'pending',
        connectedBusinesses: [],
      });

      await setDoc(doc(db, 'businesses', businessId, 'settings', 'config'), {
        pointsEarningRate: parseFloat(earningRate) || 1,
        homeRedemptionRate: parseFloat(homeRedemptionRate) || 10,
        externalRedemptionRate: parseFloat(externalRedemptionRate) || 20,
        pointsExpirationMonths: parseInt(expirationMonths) || 12,
        transactionApprovalThreshold: parseFloat(approvalThreshold) || 500,
        maxTransactionPerStaffDaily: 10000,
      });

      await setDoc(doc(db, 'users', user.uid), { businessId }, { merge: true });

      // Auto-create default profiles (General + Referred)
      console.log('📋 Creating default profiles...');
      
      const now = Timestamp.now();
      
      // General Profile
      const generalProfileRef = doc(collection(db, 'businesses', businessId, 'profiles'));
      await setDoc(generalProfileRef, {
        id: generalProfileRef.id,
        name: 'General Members',
        description: 'Standard membership for all customers',
        badgeColor: primaryColor,
        badgeIcon: '👤',
        qrCodeId: `GENERAL_${businessId}`,
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
          referralBonus: { referrer: 100, referee: 100 },
        },
        createdAt: now,
        updatedAt: now,
      });
      console.log('✅ General profile created');

      // Referred Profile
      const referredProfileRef = doc(collection(db, 'businesses', businessId, 'profiles'));
      await setDoc(referredProfileRef, {
        id: referredProfileRef.id,
        name: 'Referred Customers',
        description: 'Customers who joined through referrals',
        badgeColor: secondaryColor,
        badgeIcon: '🎁',
        qrCodeId: `REFERRED_${businessId}`,
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
          referralBonus: { referrer: 200, referee: 200 },
        },
        createdAt: now,
        updatedAt: now,
      });
      console.log('✅ Referred profile created');

      alert(`Success! Your business "${businessName}" has been submitted for approval. You'll be notified within 24-48 hours.`);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Register Your Business</Text>
      <Text style={styles.subtitle}>Join the Points Redeem platform</Text>

      {/* Owner Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Your Information</Text>
        
        <Text style={styles.label}>Your Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={ownerName}
          onChangeText={setOwnerName}
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="owner@business.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Min. 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      {/* Business Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏢 Business Information</Text>
        
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., XX Restaurant"
          value={businessName}
          onChangeText={setBusinessName}
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Business Logo</Text>
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Text style={styles.removeImageText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>
            {selectedImage ? '📷 Change Logo' : '📷 Upload Logo'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>
          {selectedImage ? 'Image selected' : 'Upload a logo or leave empty for placeholder'}
        </Text>

        <Text style={styles.label}>Category *</Text>
        {loadingCategories ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No categories available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
              <Text style={styles.retryText}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              {selectedCategoryId && (
                <View style={[styles.colorDot, { 
                  backgroundColor: categories.find(c => c.id === selectedCategoryId)?.color 
                }]} />
              )}
              <Text style={selectedCategoryId ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                {selectedCategoryId 
                  ? categories.find(c => c.id === selectedCategoryId)?.name 
                  : 'Select a category'}
              </Text>
              <Text style={styles.dropdownArrow}>{categoryDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {categoryDropdownOpen && (
              <View style={styles.dropdownList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.dropdownItem,
                      selectedCategoryId === cat.id && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(cat.id);
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                    <View style={styles.dropdownItemContent}>
                      <Text style={styles.dropdownItemText}>{cat.name}</Text>
                      <Text style={styles.dropdownItemDesc}>{cat.description}</Text>
                    </View>
                    {selectedCategoryId === cat.id && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {selectedCategoryId && (
          <>
            <Text style={styles.label}>SubCategory *</Text>
            {subCategories.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No subcategories</Text>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setSubCategoryDropdownOpen(!subCategoryDropdownOpen)}
                >
                  {selectedSubCategoryId && (
                    <View style={[styles.colorDot, { 
                      backgroundColor: categories.find(c => c.id === selectedCategoryId)?.color 
                    }]} />
                  )}
                  <Text style={selectedSubCategoryId ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                    {selectedSubCategoryId 
                      ? subCategories.find(s => s.id === selectedSubCategoryId)?.name 
                      : 'Select a subcategory'}
                  </Text>
                  <Text style={styles.dropdownArrow}>{subCategoryDropdownOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {subCategoryDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {subCategories.map((subCat) => (
                      <TouchableOpacity
                        key={subCat.id}
                        style={[
                          styles.dropdownItem,
                          selectedSubCategoryId === subCat.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setSelectedSubCategoryId(subCat.id);
                          setSubCategoryDropdownOpen(false);
                        }}
                      >
                        <View style={[styles.colorDot, { 
                          backgroundColor: categories.find(c => c.id === selectedCategoryId)?.color 
                        }]} />
                        <View style={styles.dropdownItemContent}>
                          <Text style={styles.dropdownItemText}>{subCat.name}</Text>
                          <Text style={styles.dropdownItemDesc}>{subCat.description}</Text>
                        </View>
                        {selectedSubCategoryId === subCat.id && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <View style={styles.colorSection}>
          <Text style={styles.label}>Brand Colors</Text>
          <ColorPalettePicker
            label="Primary Color"
            selectedColor={primaryColor}
            onSelectColor={setPrimaryColor}
            type="primary"
          />
          <ColorPalettePicker
            label="Secondary Color"
            selectedColor={secondaryColor}
            onSelectColor={setSecondaryColor}
            type="secondary"
          />
        </View>
      </View>

      {/* Points Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Points Configuration</Text>
        
        <Text style={styles.label}>Earning Rate (points per $1)</Text>
        <TextInput
          style={styles.input}
          value={earningRate}
          onChangeText={setEarningRate}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Home Redemption Rate (points = $1)</Text>
        <TextInput
          style={styles.input}
          value={homeRedemptionRate}
          onChangeText={setHomeRedemptionRate}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>External Redemption Rate (points = $1)</Text>
        <TextInput
          style={styles.input}
          value={externalRedemptionRate}
          onChangeText={setExternalRedemptionRate}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Points Expiration (months)</Text>
        <TextInput
          style={styles.input}
          value={expirationMonths}
          onChangeText={setExpirationMonths}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.label}>Transaction Approval Threshold ($)</Text>
        <TextInput
          style={styles.input}
          value={approvalThreshold}
          onChangeText={setApprovalThreshold}
          keyboardType="numeric"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      {uploading && (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.uploadingText}>Uploading logo...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, (loading || uploading) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading || uploading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>Submit for Approval</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Login</Text>
      </TouchableOpacity>
    </View>
  );

  // Platform-specific rendering
  if (Platform.OS === 'web') {
    return (
      <div style={{ 
        height: '100vh', 
        overflow: 'auto', 
        backgroundColor: 'white',
        WebkitOverflowScrolling: 'touch'
      }}>
        {renderContent()}
      </div>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  colorSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  dropdownSelected: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 14,
    color: Colors.textDark,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    ...(Platform.OS === 'web' && {
      overflowY: 'scroll' as any,
      display: 'block' as any,
    }),
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.white,
    minHeight: 60,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
    }),
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownItemContent: {
    flex: 1,
    paddingRight: 8,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  dropdownItemDesc: {
    fontSize: 11,
    color: Colors.textLight,
    lineHeight: 14,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textLight,
  },
  emptyBox: {
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  removeImageButton: {
    marginTop: 8,
    backgroundColor: Colors.error + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeImageText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 14,
  },
});

export default RegisterBusinessScreen;
