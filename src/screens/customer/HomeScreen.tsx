/**
 * Customer Home Screen
 * Displays all businesses the customer is a member of and their points
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
  Image
} from 'react-native';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

interface Wallet {
  businessId: string;
  businessName: string;
  businessLogo: string;
  primaryColor: string;
  pointsBalance: number;
  lifetimePointsEarned: number;
  lifetimeSpend: number;
  profileNames: string[];
}

const HomeScreen = () => {
  const { currentUser, userProfile } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      console.log('💰 Loading wallets for customer:', currentUser.uid);
      
      // Load all wallets
      const walletsRef = collection(db, 'customers', currentUser.uid, 'wallets');
      const snapshot = await getDocs(walletsRef);
      
      console.log('💰 Found', snapshot.size, 'wallets');
      
      const walletsData: Wallet[] = [];
      let total = 0;

      for (const walletDoc of snapshot.docs) {
        const walletData = walletDoc.data();
        const businessId = walletDoc.id;
        
        // Load business info
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        
        if (businessDoc.exists()) {
          const businessData = businessDoc.data();
          
          // Load customer's profiles for this business
          const profilesRef = collection(db, 'customers', currentUser.uid, 'profiles');
          const profilesSnapshot = await getDocs(profilesRef);
          const profileNames: string[] = [];
          
          for (const profileDoc of profilesSnapshot.docs) {
            const profileData = profileDoc.data();
            if (profileData.businessId === businessId) {
              // Load profile name from business
              const businessProfileDoc = await getDoc(
                doc(db, 'businesses', businessId, 'profiles', profileData.profileId)
              );
              if (businessProfileDoc.exists()) {
                profileNames.push(businessProfileDoc.data().name);
              }
            }
          }
          
          walletsData.push({
            businessId: businessId,
            businessName: businessData.name,
            businessLogo: businessData.logoUrl,
            primaryColor: businessData.primaryColor,
            pointsBalance: walletData.pointsBalance || 0,
            lifetimePointsEarned: walletData.lifetimePointsEarned || 0,
            lifetimeSpend: walletData.lifetimeSpend || 0,
            profileNames: profileNames,
          });
          
          total += walletData.pointsBalance || 0;
        }
      }

      console.log('✅ Loaded', walletsData.length, 'wallets, Total points:', total);
      setWallets(walletsData);
      setTotalPoints(total);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWallets();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your points...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header with Total Points */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userProfile?.name || 'Customer'}! 👋</Text>
        <View style={styles.totalPointsCard}>
          <Text style={styles.totalPointsLabel}>Total Points</Text>
          <Text style={styles.totalPointsValue}>{totalPoints}</Text>
          <Text style={styles.totalPointsSubtext}>Across all businesses</Text>
        </View>
      </View>

      {/* Businesses List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Businesses</Text>
        
        {wallets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyText}>No businesses yet</Text>
            <Text style={styles.emptySubtext}>
              Scan a business QR code to join and start earning points
            </Text>
          </View>
        ) : (
          wallets.map((wallet) => (
            <View key={wallet.businessId} style={styles.businessCard}>
              {/* Business Header */}
              <View style={styles.businessHeader}>
                <View style={[styles.businessLogo, { backgroundColor: wallet.primaryColor }]}>
                  <Text style={styles.businessLogoText}>
                    {wallet.businessName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.businessInfo}>
                  <Text style={styles.businessName}>{wallet.businessName}</Text>
                  {wallet.profileNames.length > 0 && (
                    <View style={styles.profileTags}>
                      {wallet.profileNames.map((profileName, index) => (
                        <View key={index} style={[styles.profileTag, { backgroundColor: wallet.primaryColor + '20' }]}>
                          <Text style={[styles.profileTagText, { color: wallet.primaryColor }]}>
                            {profileName}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Points Display */}
              <View style={styles.pointsContainer}>
                <View style={styles.pointsBox}>
                  <Text style={[styles.pointsValue, { color: wallet.primaryColor }]}>
                    {wallet.pointsBalance}
                  </Text>
                  <Text style={styles.pointsLabel}>Available Points</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>Earned</Text>
                    <Text style={styles.miniStatValue}>{wallet.lifetimePointsEarned}</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatLabel}>Spent</Text>
                    <Text style={styles.miniStatValue}>${wallet.lifetimeSpend}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
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
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
  totalPointsCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalPointsLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  totalPointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  totalPointsSubtext: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    textAlign: 'center',
  },
  businessCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  businessLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  businessLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  profileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  profileTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pointsContainer: {
    gap: 12,
  },
  pointsBox: {
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    padding: 20,
    borderRadius: 12,
  },
  pointsValue: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStat: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
});

export default HomeScreen;
