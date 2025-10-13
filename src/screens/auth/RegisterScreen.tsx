/**
 * Register Screen
 * New user registration (usually after scanning QR)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { doc, getDoc, setDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { AuthStackParamList } from '../../types';
import { generateUniqueCustomerId } from '../../utils/customerIdGenerator';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type RegisterScreenRouteProp = RouteProp<AuthStackParamList, 'Register'>;

interface ProfileInfo {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  welcomeBonusPoints: number;
  earningMultiplier: number;
}

const RegisterScreen = () => {
  const route = useRoute<RegisterScreenRouteProp>();
  const { businessId, inviteCode, profileId } = route.params || {};
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadBusinessInfo();
    }
  }, [businessId, profileId]);

  const loadBusinessInfo = async () => {
    if (!businessId) return;
    
    try {
      console.log('📋 Loading business info for:', businessId);
      console.log('📋 Profile ID from URL:', profileId);
      
      // Load business name
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));
      if (businessDoc.exists()) {
        setBusinessName(businessDoc.data().name);
        console.log('✅ Business loaded:', businessDoc.data().name);
      }
      
      // Load profile info if profileId is provided
      if (profileId) {
        console.log('📋 Loading profile info for:', profileId);
        const profileDoc = await getDoc(doc(db, 'businesses', businessId, 'profiles', profileId));
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setProfileInfo({
            id: profileDoc.id,
            name: profileData.name,
            description: profileData.description,
            badgeColor: profileData.badgeColor,
            welcomeBonusPoints: profileData.benefits.welcomeBonusPoints,
            earningMultiplier: profileData.benefits.earningMultiplier,
          });
          console.log('✅ Profile loaded:', profileData.name);
        } else {
          console.warn('⚠️ Profile not found, will use General profile');
        }
      }
    } catch (error) {
      console.error('Error loading business info:', error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 ============================================');
      console.log('🚀 STARTING CUSTOMER REGISTRATION');
      console.log('🚀 Business ID:', businessId);
      console.log('🚀 Profile ID:', profileId);
      console.log('🚀 ============================================');
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Step 1: User account created:', user.uid);

      // Generate unique QR code ID for customer (used by staff to scan)
      const qrCodeId = `CUST_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log('✅ Step 2: Generated QR code ID:', qrCodeId);

      // Generate unique customer ID (2 letters + 4 numbers, e.g., AB1234)
      const customerId = await generateUniqueCustomerId();
      console.log('✅ Step 2.5: Generated customer ID:', customerId);

      // Create customer profile
      const customerProfile = {
        id: user.uid,
        name: name,
        email: user.email!,
        role: 'customer',
        customerId: customerId, // Short ID for easy lookup (e.g., AB1234)
        qrCodeId: qrCodeId, // Long QR code ID for scanning
        registeredVia: businessId || 'direct',
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now(),
        totalReferrals: 0,
      };

      await setDoc(doc(db, 'users', user.uid), customerProfile);
      console.log('✅ Step 3: Created user profile in /users');
      
      await setDoc(doc(db, 'customers', user.uid), customerProfile);
      console.log('✅ Step 4: Created customer profile in /customers');

      // If registered via business QR, create wallet and assign profile
      if (businessId) {
        console.log('💼 PROCESSING BUSINESS REGISTRATION');
        
        let assignedProfileId = profileId;
        let welcomeBonusPoints = 0;
        
        // If no specific profile, find and assign General profile
        if (!assignedProfileId) {
          console.log('📋 No specific profile ID, finding General profile...');
          const profilesRef = collection(db, 'businesses', businessId, 'profiles');
          const profilesSnapshot = await getDocs(profilesRef);
          
          console.log('📋 Found', profilesSnapshot.size, 'profiles in business');
          
          profilesSnapshot.forEach((profileDoc) => {
            const data = profileDoc.data();
            console.log('📋 Checking profile:', profileDoc.id, '| isDefault:', data.isDefault, '| name:', data.name);
            if (data.isDefault === true) {
              assignedProfileId = profileDoc.id;
              welcomeBonusPoints = data.benefits?.welcomeBonusPoints || 0;
              console.log('✅ Found General/Default profile:', profileDoc.id, '| Welcome bonus:', welcomeBonusPoints);
            }
          });
          
          if (!assignedProfileId) {
            console.error('❌ ERROR: No default profile found for business:', businessId);
            throw new Error('No default profile found. Please contact the business.');
          }
        } else {
          // Use the profile from URL
          welcomeBonusPoints = profileInfo?.welcomeBonusPoints || 0;
          console.log('✅ Using specific profile from URL:', profileId);
          console.log('✅ Welcome bonus from profile:', welcomeBonusPoints);
        }
        
        console.log('💰 CREATING WALLET');
        console.log('💰 Assigned Profile ID:', assignedProfileId);
        console.log('💰 Welcome Bonus Points:', welcomeBonusPoints);
        
        // Create wallet with welcome bonus
        const walletData = {
          businessId: businessId,
          pointsBalance: welcomeBonusPoints,
          lifetimePointsEarned: welcomeBonusPoints,
          lifetimePointsRedeemed: 0,
          lifetimeSpend: 0,
          joinedAt: Timestamp.now(),
          lastTransaction: Timestamp.now(),
        };

        const walletPath = `customers/${user.uid}/wallets/${businessId}`;
        console.log('💰 Creating wallet at:', walletPath);
        
        await setDoc(doc(db, 'customers', user.uid, 'wallets', businessId), walletData);
        console.log('✅ Step 5: Customer wallet created with', welcomeBonusPoints, 'welcome bonus points');

        // Assign customer to profile
        if (assignedProfileId) {
          console.log('👤 ASSIGNING TO PROFILE');
          
          const profileAssignmentData = {
            profileId: assignedProfileId,
            businessId: businessId,
            assignedAt: Timestamp.now(),
            assignedVia: 'qr_scan',
            active: true,
          };

          const profileAssignmentPath = `customers/${user.uid}/profiles/${businessId}_${assignedProfileId}`;
          console.log('👤 Creating profile assignment at:', profileAssignmentPath);
          console.log('👤 Assignment data:', JSON.stringify(profileAssignmentData, null, 2));
          
          await setDoc(
            doc(db, 'customers', user.uid, 'profiles', businessId + '_' + assignedProfileId), 
            profileAssignmentData
          );
          console.log('✅ Step 6: Customer assigned to profile:', assignedProfileId);
          
          // Increment the memberCount in the profile
          console.log('📈 Incrementing memberCount for profile:', assignedProfileId);
          const profileRef = doc(db, 'businesses', businessId, 'profiles', assignedProfileId);
          const profileSnapshot = await getDoc(profileRef);
          if (profileSnapshot.exists()) {
            const currentCount = profileSnapshot.data().memberCount || 0;
            await setDoc(profileRef, { memberCount: currentCount + 1 }, { merge: true });
            console.log('✅ Profile memberCount updated:', currentCount, '→', currentCount + 1);
          }
          
          // Create a record in business->customers collection for easy querying
          const businessCustomerPath = `businesses/${businessId}/customers/${user.uid}`;
          console.log('👥 Creating business customer record at:', businessCustomerPath);
          
          const businessCustomerData = {
            customerId: user.uid,
            customerName: name,
            customerEmail: user.email!,
            qrCodeId: qrCodeId,
            profileId: assignedProfileId,
            joinedAt: Timestamp.now(),
            pointsBalance: welcomeBonusPoints,
            lifetimeSpend: 0,
            active: true,
          };
          console.log('👥 Business customer data:', JSON.stringify(businessCustomerData, null, 2));
          
          await setDoc(doc(db, 'businesses', businessId, 'customers', user.uid), businessCustomerData);
          console.log('✅ Step 7: Customer record created in business collection');
        } else {
          console.error('❌ ERROR: No profile ID assigned!');
        }
        
        // Record welcome bonus transaction if bonus > 0
        if (welcomeBonusPoints > 0) {
          console.log('💸 RECORDING WELCOME BONUS TRANSACTION');
          
          const transactionRef = doc(collection(db, 'transactions'));
          const transactionData = {
            id: transactionRef.id,
            customerId: user.uid,
            businessId: businessId,
            type: 'bonus',
            points: welcomeBonusPoints,
            basePoints: welcomeBonusPoints,
            multiplierApplied: 1,
            description: 'Welcome bonus',
            profileId: assignedProfileId,
            status: 'completed',
            timestamp: Timestamp.now(),
          };
          
          console.log('💸 Transaction data:', JSON.stringify(transactionData, null, 2));
          await setDoc(transactionRef, transactionData);
          console.log('✅ Step 8: Welcome bonus transaction recorded');
        } else {
          console.log('ℹ️  No welcome bonus to record (0 points)');
        }
        
        console.log('🎉 ============================================');
        console.log('🎉 REGISTRATION COMPLETED SUCCESSFULLY');
        console.log('🎉 Customer ID:', user.uid);
        console.log('🎉 Business ID:', businessId);
        console.log('🎉 Profile ID:', assignedProfileId);
        console.log('🎉 Welcome Bonus:', welcomeBonusPoints);
        console.log('🎉 ============================================');
      }

      // Build success message
      let successMessage = businessName 
        ? `Welcome to ${businessName}! Your account has been created.`
        : 'Your account has been created successfully!';
      
      if (businessId && profileInfo) {
        successMessage += `\n\nYou've joined as: ${profileInfo.name}`;
        if (profileInfo.welcomeBonusPoints > 0) {
          successMessage += `\n🎁 Welcome Bonus: ${profileInfo.welcomeBonusPoints} points!`;
        }
        if (profileInfo.earningMultiplier > 1) {
          successMessage += `\n⚡ You earn ${profileInfo.earningMultiplier}x points on purchases!`;
        }
      }
      
      Alert.alert('Success!', successMessage, [{ text: 'OK' }]);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            {businessName ? `Join ${businessName}` : 'Join the rewards program'}
          </Text>

          {businessName && (
            <View style={[
              styles.welcomeBox,
              profileInfo && { 
                backgroundColor: profileInfo.badgeColor + '15',
                borderLeftColor: profileInfo.badgeColor 
              }
            ]}>
              <Text style={styles.welcomeIcon}>🎉</Text>
              <Text style={styles.welcomeTitle}>
                Welcome to {businessName}!
              </Text>
              {profileInfo ? (
                <>
                  <View style={styles.profileBadgeContainer}>
                    <View style={[styles.profileBadge, { backgroundColor: profileInfo.badgeColor }]}>
                      <Text style={styles.profileBadgeText}>{profileInfo.name}</Text>
                    </View>
                  </View>
                  <Text style={styles.welcomeText}>
                    {profileInfo.description}
                  </Text>
                  <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>Your Benefits:</Text>
                    {profileInfo.earningMultiplier > 1 && (
                      <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>⚡</Text>
                        <Text style={styles.benefitText}>{profileInfo.earningMultiplier}x Points on Every Purchase</Text>
                      </View>
                    )}
                    {profileInfo.welcomeBonusPoints > 0 && (
                      <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>🎁</Text>
                        <Text style={styles.benefitText}>{profileInfo.welcomeBonusPoints} Welcome Bonus Points</Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.welcomeText}>
                  Create your account to start earning points and redeeming rewards
                </Text>
              )}
            </View>
          )}

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor={Colors.textLight}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              placeholderTextColor={Colors.textLight}
            />

            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Config.SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Config.SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: Config.SPACING.xl,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: Colors.gray[100],
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    fontSize: 16,
    marginBottom: Config.SPACING.md,
    color: Colors.textDark,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: Config.SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeBox: {
    backgroundColor: Colors.primary + '10',
    padding: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.lg,
    marginBottom: Config.SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: Config.SPACING.sm,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Config.SPACING.xs,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  profileBadgeContainer: {
    marginVertical: 12,
  },
  profileBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  profileBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  benefitsContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '600',
  },
});

export default RegisterScreen;


