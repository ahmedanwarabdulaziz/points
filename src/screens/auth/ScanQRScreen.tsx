/**
 * Scan QR Screen
 * Allows new users to scan a business QR code to register
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type ScanQRScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ScanQR'>;

const ScanQRScreen = () => {
  const navigation = useNavigation<ScanQRScreenNavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    try {
      console.log('📱 QR Code scanned:', data);
      
      // Try to parse as JSON first
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'business_join' && qrData.businessId) {
        console.log('✅ Valid business QR code:', qrData.businessName);
        console.log('🔗 Registration URL:', qrData.url);
        
        Alert.alert(
          '🎉 Business Found!',
          `Join ${qrData.businessName || 'this business'} rewards program and start earning points!`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setScanned(false),
            },
            {
              text: 'Continue',
              onPress: () => navigation.navigate('Register', { 
                businessId: qrData.businessId,
                inviteCode: qrData.inviteCode 
              }),
            },
          ]
        );
      } else {
        Alert.alert('Invalid QR Code', 'This is not a valid business invitation QR code.');
        setScanned(false);
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      
      // If JSON parsing fails, check if it's a direct URL
      if (typeof data === 'string' && data.includes('businessId=')) {
        const urlParams = new URLSearchParams(data.split('?')[1]);
        const businessId = urlParams.get('businessId');
        
        if (businessId) {
          console.log('✅ Valid URL-based QR code, businessId:', businessId);
          navigation.navigate('Register', { businessId });
          return;
        }
      }
      
      Alert.alert('Invalid QR Code', 'Unable to read QR code. Please try again.');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.subtitle}>Please enable camera permission in settings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>Scan the QR code at your business to get started</Text>
      </View>

      <View style={styles.scanner}>
        <CameraView
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </View>

      <View style={styles.footer}>
        {scanned && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.buttonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Config.SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  scanner: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.md,
  },
  footer: {
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Config.SPACING.sm,
  },
});

export default ScanQRScreen;


