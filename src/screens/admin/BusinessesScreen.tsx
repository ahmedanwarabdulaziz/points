/**
 * Businesses Screen
 * Display all businesses in the system
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AdminStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type BusinessesScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'Businesses'>;

interface BusinessItem {
  id: string;
  name: string;
  categoryId?: string;
  subCategoryId?: string;
  category?: string;
  logoUrl: string;
  primaryColor: string;
  status: string;
  ownerEmail: string;
  ownerName?: string;
  createdAt: any;
}

const BusinessesScreen = () => {
  const navigation = useNavigation<BusinessesScreenNavigationProp>();
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBusinesses = async () => {
    try {
      console.log('📂 Fetching businesses from Firestore...');
      const businessesRef = collection(db, 'businesses');
      const querySnapshot = await getDocs(businessesRef);
      
      console.log('📂 Total documents found:', querySnapshot.size);
      
      const businessList: BusinessItem[] = [];
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          console.log('📊 Business:', data.name, '| Status:', data.status, '| Owner:', data.ownerEmail);
          
          // Validate required fields
          if (!data.name || !data.ownerEmail) {
            console.warn('⚠️ Skipping invalid business document:', doc.id, '- Missing required fields');
            return;
          }
          
          businessList.push({
            id: doc.id,
            ...data
          } as BusinessItem);
        } catch (docError) {
          console.error('❌ Error processing document:', doc.id, docError);
        }
      });
      
      // Sort by creation date
      businessList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      console.log(`✅ Successfully loaded ${businessList.length} businesses`);
      setBusinesses(businessList);
    } catch (error: any) {
      console.error('❌ Error fetching businesses:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      alert('Error loading businesses: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Refresh data when screen comes into focus (e.g., after editing a business)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 BusinessesScreen focused - refreshing data...');
      fetchBusinesses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusinesses();
  };

  const handleToggleStatus = (business: BusinessItem) => {
    const newStatus = business.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    console.log(`🔄 TOGGLE STATUS CLICKED! ${business.name} - Current: ${business.status}, New: ${newStatus}`);
    
    // Direct toggle for debugging
    const performToggle = async () => {
      try {
        console.log('🔄 STARTING STATUS TOGGLE...');
        console.log('🔄 Business ID:', business.id);
        console.log('🔄 Old status:', business.status);
        console.log('🔄 New status:', newStatus);
        
        const businessRef = doc(db, 'businesses', business.id);
        await updateDoc(businessRef, {
          status: newStatus,
          updatedAt: Timestamp.now(),
        });
        
        console.log('🔄 UPDATE SUCCESSFUL!');
        
        // Update local state
        setBusinesses(prevBusinesses => {
          const newBusinesses = prevBusinesses.map(b => 
            b.id === business.id ? { ...b, status: newStatus } : b
          );
          console.log('🔄 Local state updated');
          return newBusinesses;
        });
        
        console.log(`✅ BUSINESS ${actionText.toUpperCase()}D SUCCESSFULLY!`);
      } catch (error: any) {
        console.error('❌ TOGGLE ERROR:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        Alert.alert('Toggle Error', `Failed to ${actionText}: ${error.message}`);
      }
    };
    
    // Call the toggle function directly
    performToggle();
  };

  const handleEditBusiness = (business: BusinessItem) => {
    console.log('✏️ EDIT BUTTON CLICKED!', business.name);
    console.log('✏️ Navigating to Edit Business screen with ID:', business.id);
    
    // Navigate to Edit Business screen (we'll create this)
    navigation.navigate('EditBusiness' as never, { businessId: business.id } as never);
  };

  const handleDeleteBusiness = (business: BusinessItem) => {
    console.log('🗑️ DELETE BUTTON CLICKED!', business.name);
    
    // Direct deletion for debugging
    const performDelete = async () => {
      try {
        console.log('🗑️ STARTING DELETE OPERATION...');
        console.log('🗑️ Business ID:', business.id);
        
        const businessRef = doc(db, 'businesses', business.id);
        console.log('🗑️ Document reference created');
        
        await deleteDoc(businessRef);
        console.log('🗑️ DELETE SUCCESSFUL!');
        
        // Update local state
        setBusinesses(prevBusinesses => {
          const newBusinesses = prevBusinesses.filter(b => b.id !== business.id);
          console.log('🗑️ Local state updated, new count:', newBusinesses.length);
          return newBusinesses;
        });
        
        console.log('✅ BUSINESS DELETED SUCCESSFULLY!');
      } catch (error: any) {
        console.error('❌ DELETE ERROR:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        Alert.alert('Delete Error', `Failed to delete: ${error.message}`);
      }
    };
    
    // Call the delete function directly
    performDelete();
  };

  const renderBusinessItem = ({ item }: { item: BusinessItem }) => {
    // Check if logo is a real uploaded image (not a placeholder)
    const isRealLogo = item.logoUrl && 
                       item.logoUrl.trim() && 
                       (item.logoUrl.includes('imgbb.com') || 
                        item.logoUrl.includes('ibb.co') ||
                        item.logoUrl.includes('cloudinary.com') || 
                        (item.logoUrl.startsWith('http') && !item.logoUrl.includes('placeholder')));
    
    // Use the logo URL directly (no cache-busting needed for ImgBB)
    const logoUrlToDisplay = item.logoUrl;
    
    console.log('🖼️ Rendering business:', item.name, '| Logo URL:', logoUrlToDisplay, '| Is real logo:', isRealLogo);
    
    return (
    <View style={styles.businessCard}>
      <View style={styles.businessHeader}>
        {isRealLogo ? (
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: logoUrlToDisplay }}
              style={styles.logoImage}
              resizeMode="cover"
              onError={(e) => {
                console.log('❌ Failed to load logo for:', item.name, '| URL:', item.logoUrl);
              }}
            />
          </View>
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: item.primaryColor || Colors.primary }]}>
            <Text style={styles.logoText}>
              {item.name && item.name.length > 0 ? item.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.name}</Text>
          <Text style={styles.businessCategory}>
            {item.categoryId || item.category || 'No category'}
          </Text>
          <Text style={styles.businessEmail}>
            {item.ownerName ? `${item.ownerName} - ${item.ownerEmail}` : item.ownerEmail}
          </Text>
        </View>
        <View style={[
          styles.statusBadge, 
          item.status === 'active' ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'active' ? styles.statusActiveText : styles.statusInactiveText
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            console.log('✏️ EDIT BUTTON TOUCHED!', item.name);
            handleEditBusiness(item);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.actionButtonText, styles.editButtonText]}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleStatus(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            console.log('🗑️ DELETE BUTTON TOUCHED!', item.name);
            handleDeleteBusiness(item);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏢</Text>
      <Text style={styles.emptyTitle}>No Businesses Yet</Text>
      <Text style={styles.emptySubtitle}>Create your first business to get started</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBusiness')}
      >
        <Text style={styles.addButtonText}>➕ Add First Business</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading businesses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Businesses ({businesses.length})</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('AddBusiness')}
        >
          <Text style={styles.headerButtonText}>➕ Add New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={businesses}
        renderItem={renderBusinessItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={businesses.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      />
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
    marginTop: Config.SPACING.md,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  headerButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Config.SPACING.md,
    paddingVertical: Config.SPACING.sm,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  headerButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    padding: Config.SPACING.lg,
  },
  emptyList: {
    flex: 1,
  },
  businessCard: {
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.lg,
    padding: Config.SPACING.md,
    marginBottom: Config.SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: Config.SPACING.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray[100],
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoFallbackOverlay: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  logoFallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[400],
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Config.SPACING.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 2,
  },
  businessCategory: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  businessEmail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: Config.SPACING.sm,
    paddingVertical: 4,
    borderRadius: Config.BORDER_RADIUS.sm,
    backgroundColor: Colors.gray[300],
  },
  statusActive: {
    backgroundColor: Colors.success + '20',
  },
  statusInactive: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statusActiveText: {
    color: Colors.success,
  },
  statusInactiveText: {
    color: Colors.error,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: Config.SPACING.md,
    gap: Config.SPACING.sm,
    paddingTop: Config.SPACING.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Config.SPACING.sm,
    paddingHorizontal: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  editButton: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  toggleButton: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning,
  },
  deleteButton: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
  },
  editButtonText: {
    color: Colors.primary,
  },
  deleteButtonText: {
    color: Colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Config.SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Config.SPACING.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Config.SPACING.xl,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Config.SPACING.xl,
    paddingVertical: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BusinessesScreen;
