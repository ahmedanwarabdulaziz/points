/**
 * Send Points Screen
 * Business manually searches for a customer to send points
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { BusinessStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type SendPointsScreenNavigationProp = DrawerNavigationProp<BusinessStackParamList, 'SendPoints'>;

interface Customer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  profileId: string;
  profileName?: string;
  profileColor?: string;
  profileIcon?: string;
  pointsBalance: number;
}

const SendPointsScreen = () => {
  const navigation = useNavigation<SendPointsScreenNavigationProp>();
  const { userProfile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    if (!userProfile?.businessId) {
      setLoading(false);
      return;
    }

    try {
      console.log('👥 Loading customers for manual search...');
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

      // Sort alphabetically by name
      customersData.sort((a, b) => a.customerName.localeCompare(b.customerName));

      console.log('✅ Loaded', customersData.length, 'customers');
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = customers.filter((customer) =>
      customer.customerName.toLowerCase().includes(query) ||
      customer.customerEmail.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const handleSelectCustomer = (customer: Customer) => {
    console.log('✅ Customer selected:', customer.customerName);
    navigation.navigate('TransactionForm', {
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      profileId: customer.profileId,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Send Points</Text>
        <Text style={styles.subtitle}>Search and select a customer</Text>

        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
        </Text>
      </View>

      {/* Customers List */}
      <ScrollView style={styles.scrollView}>
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {searchQuery ? '🔍' : '👥'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Customers will appear here after they register'}
            </Text>
          </View>
        ) : (
          <View style={styles.customersList}>
            {filteredCustomers.map((customer) => (
              <TouchableOpacity 
                key={customer.customerId}
                style={styles.customerCard}
                onPress={() => handleSelectCustomer(customer)}
                activeOpacity={0.7}
              >
                <View style={styles.customerContent}>
                  <View style={styles.customerAvatar}>
                    <Text style={styles.customerAvatarText}>
                      {customer.customerName.charAt(0).toUpperCase()}
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
                  </View>

                  <View style={styles.customerPoints}>
                    <Text style={styles.pointsValue}>{customer.pointsBalance}</Text>
                    <Text style={styles.pointsLabel}>points</Text>
                  </View>
                </View>

                <View style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>Send Points →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  customersList: {
    padding: 16,
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
  customerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 6,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileBadgeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  customerPoints: {
    alignItems: 'center',
    marginLeft: 12,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  pointsLabel: {
    fontSize: 11,
    color: Colors.textLight,
  },
  selectButton: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
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
});

export default SendPointsScreen;


