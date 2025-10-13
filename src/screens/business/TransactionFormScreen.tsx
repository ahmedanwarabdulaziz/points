/**
 * Transaction Form Screen
 * Business enters purchase amount and sends points to customer
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { doc, getDoc, setDoc, Timestamp, increment } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { BusinessStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type TransactionFormScreenNavigationProp = DrawerNavigationProp<BusinessStackParamList, 'TransactionForm'>;
type TransactionFormScreenRouteProp = RouteProp<BusinessStackParamList, 'TransactionForm'>;

interface ProfileInfo {
  name: string;
  badgeColor: string;
  badgeIcon: string;
  earningMultiplier: number;
}

interface WalletInfo {
  pointsBalance: number;
  lifetimePointsEarned: number;
  lifetimeSpend: number;
}

const TransactionFormScreen = () => {
  const navigation = useNavigation<TransactionFormScreenNavigationProp>();
  const route = useRoute<TransactionFormScreenRouteProp>();
  const { userProfile } = useAuth();
  
  const { customerId, customerName, customerEmail, profileId } = route.params;
  
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  
  useEffect(() => {
    loadCustomerInfo();
  }, []);

  const loadCustomerInfo = async () => {
    if (!userProfile?.businessId || !customerId) {
      setLoading(false);
      return;
    }

    try {
      // Load profile info
      if (profileId) {
        const profileDoc = await getDoc(
          doc(db, 'businesses', userProfile.businessId, 'profiles', profileId)
        );
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setProfileInfo({
            name: profileData.name,
            badgeColor: profileData.badgeColor,
            badgeIcon: profileData.badgeIcon,
            earningMultiplier: profileData.benefits.earningMultiplier || 1.0,
          });
        }
      }

      // Load customer wallet
      const walletDoc = await getDoc(
        doc(db, 'customers', customerId, 'wallets', userProfile.businessId)
      );
      if (walletDoc.exists()) {
        const walletData = walletDoc.data();
        setWalletInfo({
          pointsBalance: walletData.pointsBalance || 0,
          lifetimePointsEarned: walletData.lifetimePointsEarned || 0,
          lifetimeSpend: walletData.lifetimeSpend || 0,
        });
      }
    } catch (error) {
      console.error('Error loading customer info:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = (amount: number): number => {
    const basePoints = Math.floor(amount); // 1 point per $1
    const multiplier = profileInfo?.earningMultiplier || 1.0;
    return Math.floor(basePoints * multiplier);
  };

  const handleSendPoints = async () => {
    console.log('🔵 handleSendPoints called');
    console.log('Purchase amount:', purchaseAmount);
    
    if (!purchaseAmount.trim() || parseFloat(purchaseAmount) <= 0) {
      if (Platform.OS === 'web') {
        alert('Please enter a valid purchase amount');
      } else {
        Alert.alert('Invalid Amount', 'Please enter a valid purchase amount');
      }
      return;
    }

    if (!userProfile?.businessId) {
      if (Platform.OS === 'web') {
        alert('Business information not found');
      } else {
        Alert.alert('Error', 'Business information not found');
      }
      return;
    }

    const amount = parseFloat(purchaseAmount);
    const pointsToAdd = calculatePoints(amount);
    const basePoints = Math.floor(amount);
    const multiplier = profileInfo?.earningMultiplier || 1.0;

    console.log('💰 Transaction details:');
    console.log('Amount:', amount);
    console.log('Points to add:', pointsToAdd);
    console.log('Base points:', basePoints);
    console.log('Multiplier:', multiplier);

    // Confirm transaction
    const confirmMessage = `Send ${pointsToAdd} points to ${customerName}?\n\nPurchase: $${amount.toFixed(2)}\nBase Points: ${basePoints}\nMultiplier: ${multiplier}x\nTotal Points: ${pointsToAdd}`;
    
    if (Platform.OS === 'web') {
      const confirmed = confirm(confirmMessage);
      if (confirmed) {
        console.log('✅ Transaction confirmed (web)');
        processTransaction(amount, basePoints, multiplier, pointsToAdd);
      } else {
        console.log('❌ Transaction cancelled (web)');
      }
    } else {
      Alert.alert(
        'Confirm Transaction',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('❌ Transaction cancelled (mobile)') },
          { text: 'Confirm', onPress: () => {
            console.log('✅ Transaction confirmed (mobile)');
            processTransaction(amount, basePoints, multiplier, pointsToAdd);
          }}
        ]
      );
    }
  };

  const processTransaction = async (amount: number, basePoints: number, multiplier: number, pointsToAdd: number) => {
    setProcessing(true);
    console.log('💳 Processing transaction...');
    console.log('Amount:', amount, '| Points:', pointsToAdd);

    try {
      if (!userProfile?.businessId) throw new Error('Business ID not found');

      const businessId = userProfile.businessId;
      const transactionId = `TRANS_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Create transaction record
      const transactionData = {
        id: transactionId,
        type: 'purchase',
        customerId: customerId,
        customerName: customerName,
        customerEmail: customerEmail,
        businessId: businessId,
        businessName: userProfile.name || 'Unknown Business',
        
        // Points calculation
        purchaseAmount: amount,
        basePoints: basePoints,
        multiplier: multiplier,
        pointsAdded: pointsToAdd,
        
        // Profile info
        profileId: profileId || null,
        profileName: profileInfo?.name || 'General',
        
        // Optional fields
        reference: reference.trim() || null,
        notes: notes.trim() || null,
        
        // Staff tracking
        staffId: userProfile.id,
        staffName: userProfile.name,
        
        // Metadata
        status: 'completed',
        timestamp: Timestamp.now(),
        method: 'qr_scan',
      };

      // Save transaction
      await setDoc(doc(db, 'transactions', transactionId), transactionData);
      console.log('✅ Transaction record created');

      // Update customer wallet
      const walletRef = doc(db, 'customers', customerId, 'wallets', businessId);
      await setDoc(walletRef, {
        pointsBalance: increment(pointsToAdd),
        lifetimePointsEarned: increment(pointsToAdd),
        lifetimeSpend: increment(amount),
        lastTransaction: Timestamp.now(),
      }, { merge: true });
      console.log('✅ Customer wallet updated');

      // Update business customer record
      const businessCustomerRef = doc(db, 'businesses', businessId, 'customers', customerId);
      await setDoc(businessCustomerRef, {
        pointsBalance: increment(pointsToAdd),
        lifetimeSpend: increment(amount),
        lastTransaction: Timestamp.now(),
      }, { merge: true });
      console.log('✅ Business customer record updated');

      console.log('🎉 Transaction completed successfully');

      const successMessage = `${pointsToAdd} points sent to ${customerName}!\n\nNew balance: ${(walletInfo?.pointsBalance || 0) + pointsToAdd} points`;
      
      if (Platform.OS === 'web') {
        alert(successMessage);
        navigation.goBack();
      } else {
        Alert.alert(
          'Success!',
          successMessage,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      console.error('❌ Transaction failed:', error);
      console.error('Error details:', error);
      
      if (Platform.OS === 'web') {
        alert('Transaction Failed: ' + (error.message || 'An error occurred. Please try again.'));
      } else {
        Alert.alert('Transaction Failed', error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading customer info...</Text>
      </View>
    );
  }

  const amount = parseFloat(purchaseAmount) || 0;
  const basePoints = Math.floor(amount);
  const finalPoints = calculatePoints(amount);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Customer Info Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>
                {customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerEmail}>{customerEmail}</Text>
              {profileInfo && (
                <View style={[styles.profileBadge, { backgroundColor: profileInfo.badgeColor }]}>
                  <Text style={styles.profileBadgeIcon}>{profileInfo.badgeIcon}</Text>
                  <Text style={styles.profileBadgeText}>{profileInfo.name}</Text>
                  <Text style={styles.profileBadgeText}>({profileInfo.earningMultiplier}x)</Text>
                </View>
              )}
            </View>
          </View>

          {walletInfo && (
            <View style={styles.currentPoints}>
              <Text style={styles.currentPointsLabel}>Current Points</Text>
              <Text style={styles.currentPointsValue}>{walletInfo.pointsBalance}</Text>
            </View>
          )}
        </View>

        {/* Transaction Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Transaction Details</Text>

          {/* Purchase Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Purchase Amount ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={purchaseAmount}
              onChangeText={setPurchaseAmount}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Points Calculation Display */}
          {amount > 0 && (
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Base Points (1pt/$1):</Text>
                <Text style={styles.calculationValue}>{basePoints}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Profile Multiplier:</Text>
                <Text style={styles.calculationValue}>{profileInfo?.earningMultiplier || 1}x</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabelBold}>Points to Add:</Text>
                <Text style={styles.calculationValueBold}>{finalPoints}</Text>
              </View>
            </View>
          )}

          {/* Reference */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reference / Invoice # (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="INV-12345"
              value={reference}
              onChangeText={setReference}
              placeholderTextColor={Colors.textLight}
              autoCapitalize="characters"
            />
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about this transaction..."
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={processing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sendButton, (processing || !purchaseAmount) && styles.sendButtonDisabled]}
              onPress={handleSendPoints}
              disabled={processing || !purchaseAmount}
            >
              {processing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.sendButtonText}>Send Points</Text>
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
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
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
  customerCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customerAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    marginRight: 4,
  },
  currentPoints: {
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPointsLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  currentPointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  formCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  calculationCard: {
    backgroundColor: Colors.gray[100],
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  calculationLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  calculationValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  sendButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
});

export default TransactionFormScreen;

