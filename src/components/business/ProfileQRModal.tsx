/**
 * Profile QR Code Modal
 * Displays QR code for a specific customer profile
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

interface ProfileQRModalProps {
  visible: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name: string;
    description: string;
    badgeColor: string;
    badgeIcon: string;
    benefits: {
      earningMultiplier: number;
      welcomeBonusPoints: number;
    };
  };
  businessId: string;
  businessName: string;
}

const ProfileQRModal: React.FC<ProfileQRModalProps> = ({
  visible,
  onClose,
  profile,
  businessId,
  businessName,
}) => {
  // Generate registration URL with profileId
  const registrationUrl = `${Config.API.getBaseUrl()}/register?businessId=${businessId}&profileId=${profile.id}`;
  
  // QR code data
  const qrData = JSON.stringify({
    type: 'business_join',
    businessId: businessId,
    profileId: profile.id,
    businessName: businessName,
    profileName: profile.name,
    url: registrationUrl,
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join ${businessName} as ${profile.name}!\n\nSpecial Benefits:\n• ${profile.benefits.earningMultiplier}x points multiplier\n• ${profile.benefits.welcomeBonusPoints} welcome bonus points\n\nScan the QR code or use this link:\n${registrationUrl}`,
        title: `${businessName} - ${profile.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.profileBadge, { backgroundColor: profile.badgeColor }]}>
              <Text style={styles.profileIcon}>{profile.badgeIcon}</Text>
            </View>
            <Text style={styles.title}>{profile.name}</Text>
            <Text style={styles.businessName}>{businessName}</Text>
          </View>

          {/* Benefits Display */}
          <View style={styles.benefitsBox}>
            <Text style={styles.benefitsTitle}>Profile Benefits:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>{profile.benefits.earningMultiplier}x Points Multiplier</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎁</Text>
              <Text style={styles.benefitText}>{profile.benefits.welcomeBonusPoints} Welcome Bonus Points</Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}
              size={240}
              backgroundColor="white"
              color={profile.badgeColor}
            />
          </View>

          {/* URL Display */}
          <View style={styles.urlBox}>
            <Text style={styles.urlLabel}>Registration Link:</Text>
            <Text style={styles.urlText} numberOfLines={2}>{registrationUrl}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: profile.badgeColor }]}
              onPress={handleShare}
            >
              <Text style={styles.shareButtonText}>📤 Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: Config.SPACING.lg,
  },
  profileBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Config.SPACING.md,
  },
  profileIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  businessName: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  benefitsBox: {
    backgroundColor: Colors.primary + '10',
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    marginBottom: Config.SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  qrContainer: {
    alignItems: 'center',
    padding: Config.SPACING.lg,
    backgroundColor: Colors.white,
    borderRadius: Config.BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: Config.SPACING.lg,
  },
  urlBox: {
    backgroundColor: Colors.gray[100],
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    marginBottom: Config.SPACING.lg,
  },
  urlLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  urlText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: Config.SPACING.md,
  },
  shareButton: {
    flex: 1,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  closeButtonText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileQRModal;


