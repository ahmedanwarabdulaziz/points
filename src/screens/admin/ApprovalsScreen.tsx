/**
 * Approvals Screen
 * Super Admin approves pending business registrations and high-value transactions
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { collection, getDocs, query, where, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Business } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

interface PendingBusiness extends Business {
  ownerName?: string;
}

const ApprovalsScreen = () => {
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingBusinesses();
  }, []);

  const loadPendingBusinesses = async () => {
    try {
      console.log('📋 Loading pending businesses...');
      const businessesRef = collection(db, 'businesses');
      const q = query(businessesRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      const pending: PendingBusiness[] = [];
      snapshot.forEach((doc) => {
        pending.push({ id: doc.id, ...doc.data() } as PendingBusiness);
      });

      console.log('📋 Found', pending.length, 'pending businesses');
      setPendingBusinesses(pending);
    } catch (error) {
      console.error('Error loading pending businesses:', error);
      Alert.alert('Error', 'Failed to load pending approvals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingBusinesses();
  };

  const handleApproveBusiness = async (business: PendingBusiness) => {
    console.log('🔘 Approve button clicked for:', business.name, business.id);
    
    const confirmed = window.confirm(`Approve "${business.name}"?\n\nThis will activate the business and allow the owner to login and start using the platform.`);
    
    if (confirmed) {
      console.log('✅ User confirmed approval');
      await approveBusiness(business);
    } else {
      console.log('❌ User cancelled approval');
    }
  };

  const approveBusiness = async (business: PendingBusiness) => {
    setProcessingId(business.id);
    try {
      console.log('✅ Starting approval process for:', business.id);
      console.log('📝 Business data:', business);
      
      // Update business status to active
      const businessRef = doc(db, 'businesses', business.id);
      console.log('📝 Updating document at path:', `businesses/${business.id}`);
      
      await updateDoc(businessRef, {
        status: 'active',
        approvedAt: Timestamp.now(),
      });

      console.log('✅ Business approved successfully!');
      
      alert(`Success! ${business.name} has been approved and activated!`);
      
      // Reload the list
      await loadPendingBusinesses();
    } catch (error: any) {
      console.error('❌ Error approving business:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      alert('Error: Failed to approve business - ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBusiness = async (business: PendingBusiness) => {
    console.log('🔘 Reject button clicked for:', business.name, business.id);
    
    const confirmed = window.confirm(`Reject "${business.name}"?\n\nThis will mark the business as rejected. The owner will need to contact support.`);
    
    if (confirmed) {
      console.log('✅ User confirmed rejection');
      await rejectBusiness(business);
    } else {
      console.log('❌ User cancelled rejection');
    }
  };

  const rejectBusiness = async (business: PendingBusiness) => {
    setProcessingId(business.id);
    try {
      console.log('❌ Starting rejection process for:', business.id);
      
      // Update business status to rejected
      const businessRef = doc(db, 'businesses', business.id);
      console.log('📝 Updating document at path:', `businesses/${business.id}`);
      
      await updateDoc(businessRef, {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
      });

      console.log('❌ Business rejected successfully');
      
      alert(`${business.name} has been rejected.`);
      
      // Reload the list
      await loadPendingBusinesses();
    } catch (error: any) {
      console.error('❌ Error rejecting business:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      alert('Error: Failed to reject business - ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading approvals...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pending Approvals</Text>
        <Text style={styles.subtitle}>
          Review and approve business registrations
        </Text>
      </View>

      {/* Pending Businesses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            🏢 Business Registrations
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingBusinesses.length}</Text>
          </View>
        </View>

        {pendingBusinesses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>No pending business approvals</Text>
            <Text style={styles.emptySubtext}>
              All registrations have been reviewed
            </Text>
          </View>
        ) : (
          pendingBusinesses.map((business) => (
            <View key={business.id} style={styles.businessCard}>
              {/* Business Header */}
              <View style={styles.businessHeader}>
                <View style={[styles.colorDot, { backgroundColor: business.primaryColor }]} />
                <View style={styles.businessHeaderInfo}>
                  <Text style={styles.businessName}>{business.name}</Text>
                  <Text style={styles.businessCategory}>
                    {business.categoryId || 'No category'}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>PENDING</Text>
                </View>
              </View>

              {/* Business Info */}
              <View style={styles.businessInfo}>
                <InfoRow label="Owner" value={business.ownerName || 'N/A'} />
                <InfoRow label="Email" value={business.ownerEmail} />
                <InfoRow label="Registered" value={business.createdAt?.toDate().toLocaleDateString() || 'N/A'} />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.rejectButton, processingId === business.id && styles.buttonDisabled]}
                  onPress={() => handleRejectBusiness(business)}
                  disabled={processingId === business.id}
                >
                  {processingId === business.id ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <Text style={styles.rejectButtonText}>❌ Reject</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.approveButton, processingId === business.id && styles.buttonDisabled]}
                  onPress={() => handleApproveBusiness(business)}
                  disabled={processingId === business.id}
                >
                  {processingId === business.id ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.approveButtonText}>✅ Approve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Future: Transaction Approvals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            💳 Transaction Approvals
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No pending transactions</Text>
          <Text style={styles.emptySubtext}>
            High-value transactions will appear here (Phase 2)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: Config.SPACING.xs,
  },
  section: {
    padding: Config.SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Config.SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Config.SPACING.sm,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: Config.SPACING.xl,
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Config.SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Config.SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  businessCard: {
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
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Config.SPACING.md,
    paddingBottom: Config.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Config.SPACING.md,
  },
  businessHeaderInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  businessCategory: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Config.SPACING.xs,
  },
  statusBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Config.SPACING.md,
    paddingVertical: Config.SPACING.xs,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  statusBadgeText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: 'bold',
  },
  businessInfo: {
    marginBottom: Config.SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Config.SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Config.SPACING.md,
  },
  approveButton: {
    flex: 1,
    backgroundColor: Colors.success,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  approveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ApprovalsScreen;
