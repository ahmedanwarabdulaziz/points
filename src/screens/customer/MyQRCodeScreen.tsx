/**
 * My QR Code Screen
 * Customer displays their unique QR code for business to scan
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

interface WalletInfo {
  businessName: string;
  pointsBalance: number;
}

const MyQRCodeScreen = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      // Load all wallets to show total points
      const walletsRef = collection(db, 'customers', currentUser.uid, 'wallets');
      const snapshot = await getDocs(walletsRef);
      
      const walletsData: WalletInfo[] = [];
      let total = 0;

      for (const walletDoc of snapshot.docs) {
        const walletData = walletDoc.data();
        const businessId = walletDoc.id;
        
        // Load business name
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        if (businessDoc.exists()) {
          const businessData = businessDoc.data();
          walletsData.push({
            businessName: businessData.name,
            pointsBalance: walletData.pointsBalance || 0,
          });
          total += walletData.pointsBalance || 0;
        }
      }

      setWallets(walletsData);
      setTotalPoints(total);
    } catch (error) {
      console.error('Error loading wallet info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your QR code...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My QR Code</Text>
        <Text style={styles.subtitle}>Show this to the cashier to earn points</Text>
      </View>

      {/* Customer ID Badge (Large & Prominent) */}
      {userProfile?.customerId && (
        <View style={styles.customerIdBadge}>
          <Text style={styles.customerIdLabel}>YOUR CUSTOMER ID</Text>
          <Text style={styles.customerIdValue}>{userProfile.customerId}</Text>
          <Text style={styles.customerIdHint}>Tell this to the cashier</Text>
        </View>
      )}

      {/* QR Code Card */}
      <View style={styles.qrCard}>
        <View style={styles.qrCodeContainer}>
          {userProfile?.qrCodeId ? (
            <QRCode
              value={userProfile.qrCodeId}
              size={Platform.OS === 'web' ? 250 : 200}
              backgroundColor={Colors.white}
              color={Colors.primary}
            />
          ) : (
            <Text style={styles.errorText}>QR Code not available</Text>
          )}
        </View>
        
        <View style={styles.qrInfo}>
          <Text style={styles.qrLabel}>QR Code ID</Text>
          <Text style={styles.qrValue}>{userProfile?.qrCodeId || 'N/A'}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{userProfile?.name || 'N/A'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userProfile?.email || 'N/A'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Points</Text>
          <Text style={[styles.infoValue, styles.pointsValue]}>{totalPoints}</Text>
        </View>
      </View>

      {/* Wallets List */}
      {wallets.length > 0 && (
        <View style={styles.walletsSection}>
          <Text style={styles.walletsTitle}>Your Points by Business</Text>
          {wallets.map((wallet, index) => (
            <View key={index} style={styles.walletItem}>
              <View style={styles.walletIcon}>
                <Text style={styles.walletIconText}>
                  {wallet.businessName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{wallet.businessName}</Text>
                <Text style={styles.walletPoints}>{wallet.pointsBalance} points</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>💡 How to Use</Text>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1</Text>
          <Text style={styles.instructionText}>Show this QR code to the cashier</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2</Text>
          <Text style={styles.instructionText}>They will scan it with their device</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3</Text>
          <Text style={styles.instructionText}>Points will be added to your account instantly</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
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
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  customerIdBadge: {
    backgroundColor: Colors.primary,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  customerIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
    letterSpacing: 1,
  },
  customerIdValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 4,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  customerIdHint: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.85,
  },
  qrCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
  },
  qrInfo: {
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  qrValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  pointsValue: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  walletsSection: {
    marginBottom: 16,
  },
  walletsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  walletPoints: {
    fontSize: 12,
    color: Colors.textLight,
  },
  instructionsCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 24,
  },
});

export default MyQRCodeScreen;

