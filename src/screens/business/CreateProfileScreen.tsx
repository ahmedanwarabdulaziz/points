/**
 * Create Profile Screen
 * Business owner creates a new customer profile/group
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

const ICONS = ['⭐', '💎', '👑', '🎯', '🔥', '💪', '🎨', '📱', '🎵', '🏆', '✨', '🌟'];
const PRESET_COLORS = [
  '#274290', // Blue
  '#f27921', // Orange
  '#10b981', // Green
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

const CreateProfileScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('⭐');
  const [selectedColor, setSelectedColor] = useState(Colors.primary);
  const [earningMultiplier, setEarningMultiplier] = useState('1.0');
  const [welcomeBonus, setWelcomeBonus] = useState('0');
  const [referrerBonus, setReferrerBonus] = useState('100');
  const [refereeBonus, setRefereeBonus] = useState('100');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Profile name is required');
      return;
    }

    if (!description.trim()) {
      alert('Profile description is required');
      return;
    }

    const multiplier = parseFloat(earningMultiplier);
    if (isNaN(multiplier) || multiplier < 1 || multiplier > 10) {
      alert('Multiplier must be between 1.0 and 10.0');
      return;
    }

    if (!userProfile?.businessId) {
      alert('Business ID not found');
      return;
    }

    setLoading(true);
    try {
      const profileRef = doc(collection(db, 'businesses', userProfile.businessId, 'profiles'));
      const profileData = {
        id: profileRef.id,
        name: name.trim(),
        description: description.trim(),
        badgeColor: selectedColor,
        badgeIcon: selectedIcon,
        qrCodeId: `PROFILE_${profileRef.id}`,
        visibility: 'public',
        isDefault: false,
        isDeletable: true,
        memberCount: 0,
        active: true,
        benefits: {
          earningMultiplier: multiplier,
          welcomeBonusPoints: parseInt(welcomeBonus) || 0,
          redemptionBonusPercent: 0,
          exclusiveRewards: false,
          referralBonus: {
            referrer: parseInt(referrerBonus) || 100,
            referee: parseInt(refereeBonus) || 100,
          },
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(profileRef, profileData);
      console.log('✅ Profile created:', profileData.name);

      alert(`Success! Profile "${name}" has been created.`);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Customer Profile</Text>
        <Text style={styles.subtitle}>Set up a new customer group with unique benefits</Text>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Profile Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., VIP Members, Instagram Followers"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textLight}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe this customer group..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badge Icon</Text>
          <View style={styles.iconsGrid}>
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconButton,
                  selectedIcon === icon && styles.iconButtonSelected,
                  { borderColor: selectedColor }
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badge Color</Text>
          <View style={styles.colorsGrid}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && <Text style={styles.colorCheckmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <View style={[styles.previewBadge, { backgroundColor: selectedColor }]}>
              <Text style={styles.previewIcon}>{selectedIcon}</Text>
            </View>
            <Text style={styles.previewName}>{name || 'Profile Name'}</Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Benefits</Text>
          
          <Text style={styles.label}>Points Earning Multiplier *</Text>
          <TextInput
            style={styles.input}
            placeholder="1.0"
            value={earningMultiplier}
            onChangeText={setEarningMultiplier}
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.textLight}
          />
          <Text style={styles.hint}>1.0 = normal, 2.0 = double points, 3.0 = triple points</Text>

          <Text style={styles.label}>Welcome Bonus Points</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={welcomeBonus}
            onChangeText={setWelcomeBonus}
            keyboardType="numeric"
            placeholderTextColor={Colors.textLight}
          />
          <Text style={styles.hint}>Points given when customer joins this profile</Text>

          <Text style={styles.label}>Referrer Bonus (points)</Text>
          <TextInput
            style={styles.input}
            placeholder="100"
            value={referrerBonus}
            onChangeText={setReferrerBonus}
            keyboardType="numeric"
            placeholderTextColor={Colors.textLight}
          />

          <Text style={styles.label}>Referee Bonus (points)</Text>
          <TextInput
            style={styles.input}
            placeholder="100"
            value={refereeBonus}
            onChangeText={setRefereeBonus}
            keyboardType="numeric"
            placeholderTextColor={Colors.textLight}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  iconButtonSelected: {
    borderWidth: 3,
    backgroundColor: Colors.white,
  },
  iconText: {
    fontSize: 28,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: Colors.textDark,
    borderWidth: 4,
  },
  colorCheckmark: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: 'bold',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    gap: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  previewBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 24,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: 16,
  },
});

export default CreateProfileScreen;


