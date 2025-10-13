/**
 * Profiles Screen
 * Business owner manages customer profiles/groups
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { collection, getDocs, query, where, getDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { BusinessStackParamList } from '../../types';
import ProfileQRModal from '../../components/business/ProfileQRModal';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type ProfilesScreenNavigationProp = DrawerNavigationProp<BusinessStackParamList, 'Profiles'>;

interface Profile {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  badgeIcon: string;
  memberCount: number;
  isDefault: boolean;
  isDeletable: boolean;
  benefits: {
    earningMultiplier: number;
    welcomeBonusPoints: number;
  };
}

const ProfilesScreen = () => {
  const navigation = useNavigation<ProfilesScreenNavigationProp>();
  const { userProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    loadProfiles();
    loadBusinessName();
  }, []);

  const loadBusinessName = async () => {
    if (!userProfile?.businessId) return;
    
    try {
      const businessDoc = await getDoc(doc(db, 'businesses', userProfile.businessId));
      if (businessDoc.exists()) {
        setBusinessName(businessDoc.data().name);
      }
    } catch (error) {
      console.error('Error loading business name:', error);
    }
  };

  const loadProfiles = async () => {
    if (!userProfile?.businessId) {
      setLoading(false);
      return;
    }

    try {
      console.log('📋 Loading profiles for business:', userProfile.businessId);
      const profilesRef = collection(db, 'businesses', userProfile.businessId, 'profiles');
      const snapshot = await getDocs(profilesRef);
      
      console.log('📋 Total profile documents found:', snapshot.size);
      
      // If no profiles found, create default ones
      if (snapshot.size === 0) {
        console.log('⚠️ No profiles found - creating default profiles...');
        await createDefaultProfiles();
        // Reload after creation
        await loadProfiles();
        return;
      }
      
      // Load customers to calculate accurate member counts
      console.log('👥 Loading customers to calculate member counts...');
      const customersRef = collection(db, 'businesses', userProfile.businessId, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      
      // Count members per profile
      const memberCounts: { [key: string]: number } = {};
      customersSnapshot.forEach((customerDoc) => {
        const customerData = customerDoc.data();
        const profileId = customerData.profileId;
        if (profileId) {
          memberCounts[profileId] = (memberCounts[profileId] || 0) + 1;
        }
      });
      
      console.log('📊 Member counts per profile:', memberCounts);
      
      const profilesData: Profile[] = [];
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const actualMemberCount = memberCounts[docSnapshot.id] || 0;
        
        console.log('📋 Profile:', data.name, '| Stored count:', data.memberCount, '| Actual count:', actualMemberCount);
        
        // Update profile with accurate member count if different
        if (data.memberCount !== actualMemberCount) {
          console.log('🔄 Updating member count for', data.name, 'from', data.memberCount, 'to', actualMemberCount);
          await setDoc(doc(db, 'businesses', userProfile.businessId, 'profiles', docSnapshot.id), 
            { memberCount: actualMemberCount }, 
            { merge: true }
          );
        }
        
        profilesData.push({ 
          id: docSnapshot.id, 
          ...data,
          memberCount: actualMemberCount  // Use actual count
        } as Profile);
      }

      console.log('✅ Loaded', profilesData.length, 'profiles with accurate member counts');
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading profiles:', error);
      alert('Failed to load profiles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createDefaultProfiles = async () => {
    if (!userProfile?.businessId) return;
    
    try {
      const businessDoc = await getDoc(doc(db, 'businesses', userProfile.businessId));
      if (!businessDoc.exists()) return;
      
      const businessData = businessDoc.data();
      const now = Timestamp.now();
      
      // General Profile
      const generalProfileRef = doc(collection(db, 'businesses', userProfile.businessId, 'profiles'));
      await setDoc(generalProfileRef, {
        id: generalProfileRef.id,
        name: 'General Members',
        description: 'Standard membership for all customers',
        badgeColor: businessData.primaryColor || Colors.primary,
        badgeIcon: '👤',
        qrCodeId: `GENERAL_${userProfile.businessId}`,
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
      
      // Referred Profile
      const referredProfileRef = doc(collection(db, 'businesses', userProfile.businessId, 'profiles'));
      await setDoc(referredProfileRef, {
        id: referredProfileRef.id,
        name: 'Referred Customers',
        description: 'Customers who joined through referrals',
        badgeColor: businessData.secondaryColor || Colors.secondary,
        badgeIcon: '🎁',
        qrCodeId: `REFERRED_${userProfile.businessId}`,
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
      
      console.log('✅ Default profiles created successfully');
    } catch (error) {
      console.error('❌ Error creating default profiles:', error);
      throw error;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfiles();
  };

  const handleViewQR = (profile: Profile) => {
    console.log('📱 Viewing QR code for profile:', profile.name);
    setSelectedProfile(profile);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedProfile(null);
  };

  const handleCreateProfile = () => {
    console.log('➕ Navigating to Create Profile screen');
    navigation.navigate('CreateProfile');
  };

  const handleEditProfile = (profile: Profile) => {
    console.log('✏️ Editing profile:', profile.name, profile.id);
    navigation.navigate('EditProfile', { profileId: profile.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <>
      {/* QR Code Modal */}
      {selectedProfile && userProfile?.businessId && (
        <ProfileQRModal
          visible={showQRModal}
          onClose={handleCloseQR}
          profile={selectedProfile}
          businessId={userProfile.businessId}
          businessName={businessName}
        />
      )}

      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Customer Profiles</Text>
        <Text style={styles.subtitle}>
          Manage customer groups with unique benefits and QR codes
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateProfile}
        >
          <Text style={styles.addButtonText}>+ Create Profile</Text>
        </TouchableOpacity>
      </View>

      {profiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No profiles yet</Text>
          <Text style={styles.emptySubtext}>Default profiles will be created automatically</Text>
        </View>
      ) : (
        <View style={styles.profilesList}>
          {profiles.map((profile) => (
            <View key={profile.id} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={[styles.badge, { backgroundColor: profile.badgeColor }]}>
                  <Text style={styles.badgeIcon}>{profile.badgeIcon}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileDescription}>{profile.description}</Text>
                </View>
                {profile.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>

              <View style={styles.profileStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profile.memberCount}</Text>
                  <Text style={styles.statLabel}>Members</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profile.benefits.earningMultiplier}x</Text>
                  <Text style={styles.statLabel}>Multiplier</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profile.benefits.welcomeBonusPoints}</Text>
                  <Text style={styles.statLabel}>Welcome Bonus</Text>
                </View>
              </View>

              <View style={styles.profileActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleViewQR(profile)}
                >
                  <Text style={styles.actionButtonText}>📱 View QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditProfile(profile)}
                >
                  <Text style={styles.actionButtonText}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
      </ScrollView>
    </>
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
  header: {
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Config.SPACING.md,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: Config.SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Config.SPACING.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  profilesList: {
    padding: Config.SPACING.lg,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.lg,
    padding: Config.SPACING.lg,
    marginBottom: Config.SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Config.SPACING.md,
    paddingBottom: Config.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Config.SPACING.md,
  },
  badgeIcon: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 2,
  },
  profileDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  defaultBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  profileStats: {
    flexDirection: 'row',
    marginBottom: Config.SPACING.md,
    gap: Config.SPACING.md,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  profileActions: {
    flexDirection: 'row',
    gap: Config.SPACING.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary + '10',
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default ProfilesScreen;

