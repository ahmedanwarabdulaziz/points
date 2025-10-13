/**
 * Customers Screen  
 * Business owner views all their customers
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

interface Customer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  profileId: string;
  profileName?: string;
  profileColor?: string;
  profileIcon?: string;
  pointsBalance: number;
  lifetimeSpend: number;
  joinedAt: any;
  active: boolean;
}

const CustomersScreen = () => {
  const { userProfile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    if (!userProfile?.businessId) {
      setLoading(false);
      return;
    }

    try {
      console.log('👥 Loading customers for business:', userProfile.businessId);
      const customersRef = collection(db, 'businesses', userProfile.businessId, 'customers');
      const snapshot = await getDocs(customersRef);
      
      const customersData: Customer[] = [];
      
      // Load customer data and their profile info
      for (const customerDoc of snapshot.docs) {
        const customerData = customerDoc.data() as Customer;
        
        // Load profile info
        if (customerData.profileId) {
          const profileDoc = await getDoc(
            doc(db, 'businesses', userProfile.businessId, 'profiles', customerData.profileId)
          );
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            customerData.profileName = profileData.name;
            customerData.profileColor = profileData.badgeColor;
            customerData.profileIcon = profileData.badgeIcon;
          }
        }
        
        customersData.push(customerData);
      }

      // Sort by join date (newest first)
      customersData.sort((a, b) => {
        const aTime = a.joinedAt?.toMillis?.() || 0;
        const bTime = b.joinedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      console.log('✅ Loaded', customersData.length, 'customers');
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Customers ({customers.length})</Text>
        <Text style={styles.subtitle}>View and manage your customers</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
        />
      </View>

      {filteredCustomers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No customers found' : 'No customers yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Customers will appear here after they register via your QR code'}
          </Text>
        </View>
      ) : (
        <View style={styles.customersList}>
          {filteredCustomers.map((customer) => (
            <View key={customer.customerId} style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>
                    {customer.customerName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.customerName}</Text>
                  <Text style={styles.customerEmail}>{customer.customerEmail}</Text>
                  {customer.profileName && (
                    <View style={[styles.profileBadge, { backgroundColor: customer.profileColor || Colors.primary }]}>
                      <Text style={styles.profileBadgeIcon}>{customer.profileIcon || '👤'}</Text>
                      <Text style={styles.profileBadgeText}>{customer.profileName}</Text>
                    </View>
                  )}
                  <Text style={styles.customerDate}>
                    Joined {customer.joinedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.customerStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{customer.pointsBalance || 0}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>${customer.lifetimeSpend || 0}</Text>
                  <Text style={styles.statLabel}>Lifetime Spend</Text>
                </View>
              </View>
            </View>
          ))}
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
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    padding: 20,
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
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
  customersList: {
    padding: 20,
  },
  customerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  customerDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  profileBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  customerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
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
});

export default CustomersScreen;
