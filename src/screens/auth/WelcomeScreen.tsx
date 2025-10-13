/**
 * Welcome Screen
 * Initial screen for unauthenticated users
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>💎</Text>
        <Text style={styles.title}>Points Redeem</Text>
        <Text style={styles.subtitle}>Your loyalty rewards, redefined</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Join exclusive loyalty programs from your favorite businesses.
          Earn points, redeem rewards, and enjoy special benefits.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ScanQR')}
        >
          <Text style={styles.primaryButtonText}>Scan QR to Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Config.SPACING.lg,
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: Config.SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Config.SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Config.SPACING.md,
  },
  description: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: Config.SPACING.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: Config.SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
  },
});

export default WelcomeScreen;


