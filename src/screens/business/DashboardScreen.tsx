/**
 * Business Dashboard Screen
 * Main screen for business owners showing stats and QR code for customer registration
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Share 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { Business, BusinessStackParamList } from '../../types';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type DashboardScreenNavigationProp = DrawerNavigationProp<BusinessStackParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { userProfile } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Add hamburger menu button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ marginLeft: 15 }}
        >
          <Text style={{ fontSize: 24, color: Colors.white }}>☰</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadBusinessData();
    
    // Check if user needs to change password (first login)
    if (userProfile?.mustChangePassword) {
      setShowPasswordModal(true);
    }
  }, [userProfile]);

  const loadBusinessData = async () => {
    if (!userProfile?.businessId) {
      console.log('No business ID found for user');
      setLoading(false);
      return;
    }

    try {
      const businessDoc = await getDoc(doc(db, 'businesses', userProfile.businessId));
      if (businessDoc.exists()) {
        setBusiness({ ...businessDoc.data(), id: businessDoc.id } as Business);
      } else {
        console.log('Business not found');
      }
    } catch (error) {
      console.error('Error loading business:', error);
      Alert.alert('Error', 'Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const handleShareQR = async () => {
    if (!business) return;
    
    try {
      const registrationUrl = Config.API.getRegistrationUrl(business.id);
      
      await Share.share({
        message: `Join ${business.name} rewards program!\n\nScan the QR code or use this link:\n${registrationUrl}`,
        title: `${business.name} - Join our rewards program`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePasswordChanged = async () => {
    console.log('🔒 Password changed callback received - closing modal');
    setShowPasswordModal(false);
    
    // Reload user profile to get updated mustChangePassword flag
    if (userProfile?.id) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userProfile.id));
        if (userDoc.exists()) {
          console.log('✅ User profile reloaded after password change');
        }
      } catch (error) {
        console.error('Error reloading user profile:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>⚠️ Business not found</Text>
        <Text style={styles.errorSubtext}>Please contact support</Text>
      </View>
    );
  }

  // Check if business is rejected
  if (business.status === 'rejected') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>❌ Account Rejected</Text>
        <Text style={styles.errorSubtext}>
          Your business application was not approved. Please contact support for more information.
        </Text>
      </View>
    );
  }

  const isPending = business.status === 'pending';

  // Generate QR code data with dynamic URL
  const registrationUrl = Config.API.getRegistrationUrl(business.id);
  const qrData = JSON.stringify({
    type: 'business_join',
    businessId: business.id,
    businessName: business.name,
    url: registrationUrl,
  });
  
  console.log('📱 QR Code URL:', registrationUrl);

  return (
    <>
      {/* Password Change Modal (First Login) */}
      {userProfile && (
        <ChangePasswordModal
          visible={showPasswordModal}
          userId={userProfile.id}
          onPasswordChanged={handlePasswordChanged}
        />
      )}

      {/* Pending Approval Overlay */}
      {isPending && (
        <View style={styles.pendingOverlay}>
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingIcon}>⏳</Text>
            <View style={styles.pendingContent}>
              <Text style={styles.pendingTitle}>Account Pending Approval</Text>
              <Text style={styles.pendingText}>
                Your business "{business.name}" is currently under review by our admin team. 
                This usually takes 24-48 hours. You'll be notified once approved.
              </Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={[styles.container, isPending && styles.containerDisabled]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome! 👋</Text>
          <Text style={styles.businessName}>{business.name}</Text>
          {isPending && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>⏳ PENDING APPROVAL</Text>
            </View>
          )}
        </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionCard, isPending && styles.disabledButton]}
            onPress={() => navigation.navigate('ScanCustomer')}
            disabled={isPending}
          >
            <Text style={styles.quickActionIcon}>📷</Text>
            <Text style={styles.quickActionTitle}>Scan Customer</Text>
            <Text style={styles.quickActionSubtitle}>Scan QR to send points</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionCard, isPending && styles.disabledButton]}
            onPress={() => navigation.navigate('SendPoints')}
            disabled={isPending}
          >
            <Text style={styles.quickActionIcon}>💳</Text>
            <Text style={styles.quickActionTitle}>Send Points</Text>
            <Text style={styles.quickActionSubtitle}>Search & send manually</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>Customer Registration QR Code</Text>
        <Text style={styles.sectionSubtitle}>
          Customers can scan this code to join your rewards program
        </Text>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={220}
            backgroundColor="white"
            color={business.primaryColor || Colors.primary}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.shareButton, 
            { backgroundColor: business.primaryColor || Colors.primary },
            isPending && styles.disabledButton
          ]}
          onPress={isPending ? undefined : handleShareQR}
          disabled={isPending}
        >
          <Text style={styles.shareButtonText}>
            {isPending ? '🔒 Available After Approval' : '📤 Share QR Code'}
          </Text>
        </TouchableOpacity>

        <View style={styles.urlContainer}>
          <Text style={styles.urlLabel}>Registration Link:</Text>
          <Text style={styles.urlText}>{registrationUrl}</Text>
        </View>

        <Text style={styles.qrNote}>
          💡 Tip: Print this QR code and display it at your location or share it on social media
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Today's Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>New Customers</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Points Issued</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$0</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
      </View>

      {/* Business Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Business ID" value={business.id.substring(0, 8) + '...'} />
          <InfoRow label="Category" value={business.categoryId || 'N/A'} />
          <InfoRow label="Status" value={business.status} />
          <InfoRow label="Primary Color" value={business.primaryColor} />
        </View>
      </View>
      </ScrollView>
    </>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
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
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error,
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: Config.SPACING.sm,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  pendingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  pendingBanner: {
    backgroundColor: Colors.warning,
    padding: Config.SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  pendingIcon: {
    fontSize: 32,
    marginRight: Config.SPACING.md,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  pendingText: {
    fontSize: 13,
    color: Colors.white,
    lineHeight: 18,
  },
  statusBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Config.SPACING.md,
    paddingVertical: Config.SPACING.sm,
    borderRadius: Config.BORDER_RADIUS.md,
    marginTop: Config.SPACING.md,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
    opacity: 0.7,
  },
  quickActionsSection: {
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
    marginBottom: Config.SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Config.SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 40,
    marginBottom: Config.SPACING.sm,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  header: {
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: Config.SPACING.xs,
  },
  qrSection: {
    margin: Config.SPACING.lg,
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Config.SPACING.lg,
  },
  qrContainer: {
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButton: {
    marginTop: Config.SPACING.lg,
    paddingVertical: Config.SPACING.md,
    paddingHorizontal: Config.SPACING.xl,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  urlContainer: {
    marginTop: Config.SPACING.lg,
    padding: Config.SPACING.md,
    backgroundColor: Colors.gray[100],
    borderRadius: Config.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  urlText: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  qrNote: {
    marginTop: Config.SPACING.md,
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsSection: {
    margin: Config.SPACING.lg,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Config.SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    padding: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Config.SPACING.xs,
    textAlign: 'center',
  },
  infoSection: {
    margin: Config.SPACING.lg,
    marginTop: 0,
    marginBottom: Config.SPACING.xl,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: Config.SPACING.lg,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Config.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '500',
  },
});

export default DashboardScreen;


