/**
 * Change Password Modal
 * Shown on first login for accounts created by admin
 * Forces user to change their password
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

interface ChangePasswordModalProps {
  visible: boolean;
  userId: string;
  onPasswordChanged: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  userId,
  onPasswordChanged,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Update password in Firebase Auth
      await updatePassword(user, newPassword);
      console.log('✅ Password updated in Firebase Auth');

      // Update user profile to remove mustChangePassword flag
      await updateDoc(doc(db, 'users', userId), {
        mustChangePassword: false,
      });
      console.log('✅ User profile updated - password change flag removed');

      // Clear form fields
      setNewPassword('');
      setConfirmPassword('');
      
      // Call the callback to close modal
      console.log('✅ Calling onPasswordChanged callback to close modal');
      onPasswordChanged();
      
      // Show success message after modal closes
      setTimeout(() => {
        alert('Success! Your password has been changed successfully.');
      }, 300);
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert('Error: ' + (error.message || 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        // Prevent closing - user MUST change password
        Alert.alert('Required', 'You must change your password to continue');
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>🔒</Text>
            <Text style={styles.title}>Change Your Password</Text>
            <Text style={styles.subtitle}>
              For security reasons, please change your password before continuing.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password (min. 6 characters)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
              editable={!loading}
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
              editable={!loading}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ Your password must be at least 6 characters long.
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Change Password</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            Note: You cannot skip this step. This is required for your account security.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Config.SPACING.lg,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.lg,
    padding: Config.SPACING.xl,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: Config.SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Config.SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Config.SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: Config.SPACING.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
    marginTop: Config.SPACING.md,
  },
  input: {
    backgroundColor: Colors.gray[100],
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    fontSize: 16,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBox: {
    backgroundColor: Colors.primary + '10',
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    marginTop: Config.SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Config.SPACING.md,
    fontStyle: 'italic',
  },
});

export default ChangePasswordModal;

