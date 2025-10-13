/**
 * Edit Profile Screen
 * Business owner edits an existing customer profile/group
 */

import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { BusinessStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type EditProfileScreenRouteProp = RouteProp<BusinessStackParamList, 'EditProfile'>;

const ICONS = ['⭐', '💎', '👑', '🎯', '🔥', '💪', '🎨', '📱', '🎵', '🏆', '✨', '🌟', '👤', '🎁'];
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

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditProfileScreenRouteProp>();
  const { profileId } = route.params;
  const { userProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('⭐');
  const [selectedColor, setSelectedColor] = useState(Colors.primary);
  const [earningMultiplier, setEarningMultiplier] = useState('1.0');
  const [welcomeBonus, setWelcomeBonus] = useState('0');
  const [referrerBonus, setReferrerBonus] = useState('100');
  const [refereeBonus, setRefereeBonus] = useState('100');
  const [isDeletable, setIsDeletable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!userProfile?.businessId) return;

    try {
      const profileDoc = await getDoc(doc(db, 'businesses', userProfile.businessId, 'profiles', profileId));
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setName(data.name);
        setDescription(data.description);
        setSelectedIcon(data.badgeIcon);
        setSelectedColor(data.badgeColor);
        setEarningMultiplier(data.benefits.earningMultiplier.toString());
        setWelcomeBonus(data.benefits.welcomeBonusPoints.toString());
        setReferrerBonus(data.benefits.referralBonus.referrer.toString());
        setRefereeBonus(data.benefits.referralBonus.referee.toString());
        setIsDeletable(data.isDeletable !== false);
      } else {
        alert('Profile not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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

    if (!userProfile?.businessId) return;

    setSaving(true);
    try {
      const profileRef = doc(db, 'businesses', userProfile.businessId, 'profiles', profileId);
      
      await updateDoc(profileRef, {
        name: name.trim(),
        description: description.trim(),
        badgeColor: selectedColor,
        badgeIcon: selectedIcon,
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
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Profile updated:', name);
      alert('Profile updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isDeletable) {
      alert('This profile cannot be deleted. It is a system default profile.');
      return;
    }

    if (confirm(`Delete "${name}" profile?\n\nThis action cannot be undone. All customers in this profile will be moved to General Members.`)) {
      deleteProfile();
    }
  };

  const deleteProfile = async () => {
    if (!userProfile?.businessId) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, 'businesses', userProfile.businessId, 'profiles', profileId));
      
      console.log('✅ Profile deleted');
      alert('Profile deleted successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update profile settings and benefits</Text>

        {!isDeletable && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ This is a system profile. You can edit settings but cannot delete it.
            </Text>
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Profile Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., VIP Members"
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
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {isDeletable && (
          <TouchableOpacity
            style={[styles.deleteButton, saving && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={saving}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Profile</Text>
          </TouchableOpacity>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
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
  warningBox: {
    backgroundColor: Colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textDark,
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
  deleteButton: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.error,
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

export default EditProfileScreen;


