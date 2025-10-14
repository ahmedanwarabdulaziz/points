/**
 * Scan Customer Screen
 * Business scans customer's QR code to send them points
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { BusinessStackParamList } from '../../types';
import { isValidCustomerId } from '../../utils/customerIdGenerator';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type ScanCustomerScreenNavigationProp = DrawerNavigationProp<BusinessStackParamList, 'ScanCustomer'>;

const ScanCustomerScreen = () => {
  const navigation = useNavigation<ScanCustomerScreenNavigationProp>();
  const { userProfile } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualQRCode, setManualQRCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(Platform.OS === 'web');

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  const lookupCustomer = async (inputCode: string) => {
    if (!userProfile?.businessId) {
      Alert.alert('Error', 'Business information not found');
      return;
    }

    setLoading(true);
    const cleanInput = inputCode.trim().toUpperCase();
    
    // Determine if input is customer ID (AB1234) or QR code ID (CUST_...)
    const isCustomerId = isValidCustomerId(cleanInput);
    const searchField = isCustomerId ? 'customerId' : 'qrCodeId';
    const searchValue = isCustomerId ? cleanInput : inputCode.trim();
    
    console.log('🔍 Looking up customer:', searchValue);
    console.log('🔍 Search type:', isCustomerId ? 'Customer ID (AB1234)' : 'QR Code ID');

    try {
      // Search for customer by customerId or qrCodeId in users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where(searchField, '==', searchValue));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('❌ Customer not found');
        Alert.alert(
          'Customer Not Found', 
          `No customer found with ${isCustomerId ? 'customer ID' : 'QR code'}: ${searchValue}\n\nPlease check and try again.`
        );
        setLoading(false);
        return;
      }

      const customerDoc = snapshot.docs[0];
      const customerData = customerDoc.data();
      const customerId = customerDoc.id;

      console.log('✅ Customer found:', customerData.name, customerData.email);

      // Check if customer is registered with this business
      const businessCustomerDoc = await getDoc(
        doc(db, 'businesses', userProfile.businessId, 'customers', customerId)
      );

      if (!businessCustomerDoc.exists()) {
        Alert.alert(
          'Customer Not Registered',
          `${customerData.name} is not registered with your business yet.`
        );
        setLoading(false);
        return;
      }

      const businessCustomerData = businessCustomerDoc.data();
      
      console.log('✅ Customer is registered with business');
      console.log('📋 Profile ID:', businessCustomerData.profileId);

      // Navigate to transaction form
      navigation.navigate('TransactionForm', {
        customerId: customerId,
        customerName: customerData.name,
        customerEmail: customerData.email,
        profileId: businessCustomerData.profileId,
      });
    } catch (error: any) {
      console.error('❌ Error looking up customer:', error);
      Alert.alert('Error', 'Failed to look up customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('📱 QR Code scanned:', data);
    lookupCustomer(data);

    // Allow scanning again after 3 seconds
    setTimeout(() => setScanned(false), 3000);
  };

  const handleManualSubmit = () => {
    if (!manualQRCode.trim()) {
      Alert.alert('Error', 'Please enter a QR code');
      return;
    }
    console.log('⌨️  Manual QR code entered:', manualQRCode);
    lookupCustomer(manualQRCode.trim());
  };

  if (Platform.OS !== 'web' && hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (Platform.OS !== 'web' && hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>📷 Camera permission denied</Text>
        <Text style={styles.subtitle}>Please enable camera access in your device settings</Text>
        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setShowManualInput(true)}
        >
          <Text style={styles.switchButtonText}>Use Manual Input Instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan Customer QR Code</Text>
        <Text style={styles.subtitle}>
          {showManualInput ? 'Enter customer ID or QR code' : 'Point camera at customer\'s QR code'}
        </Text>
      </View>

      {/* Scanner or Manual Input */}
      {showManualInput ? (
        <View style={styles.manualContainer}>
          <View style={styles.manualCard}>
            <Text style={styles.manualLabel}>Customer ID or QR Code</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="AB1234 or CUST_123456_abc"
              value={manualQRCode}
              onChangeText={setManualQRCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.manualHint}>
              💡 Customer can tell you their 6-character ID (e.g., AB1234)
            </Text>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleManualSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Look Up Customer</Text>
              )}
            </TouchableOpacity>
          </View>

          {Platform.OS !== 'web' && (
            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => {
                setShowManualInput(false);
                setManualQRCode('');
              }}
            >
              <Text style={styles.switchButtonText}>📷 Switch to Camera Scanner</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.scannerContainer}>
          <CameraView
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Scanner Overlay */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>
              {scanned ? 'Processing...' : 'Align QR code within frame'}
            </Text>
          </View>

          {/* Manual Input Button */}
          <TouchableOpacity 
            style={styles.manualInputButton}
            onPress={() => setShowManualInput(true)}
          >
            <Text style={styles.manualInputButtonText}>⌨️ Enter Code Manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>💡 How it works:</Text>
        <Text style={styles.instructionText}>1. Customer opens their app and shows QR code</Text>
        <Text style={styles.instructionText}>2. Scan the QR code with your camera</Text>
        <Text style={styles.instructionText}>3. Enter purchase amount and send points</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: Colors.white,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manualInputButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  manualInputButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  manualContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  manualCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  manualLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  manualHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  switchButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: Colors.textDark,
    marginBottom: 4,
  },
});

export default ScanCustomerScreen;
