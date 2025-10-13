/**
 * Simple Color Picker
 * Clean hex input with color preview - no complex palettes
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

interface ColorPalettePickerProps {
  label: string;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  type: 'primary' | 'secondary';
}

const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  label,
  selectedColor,
  onSelectColor,
  type,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState(selectedColor);
  const [hexInput, setHexInput] = useState(selectedColor);

  useEffect(() => {
    setTempColor(selectedColor);
    setHexInput(selectedColor.toUpperCase());
  }, [selectedColor]);

  const handleHexInput = (text: string) => {
    const cleanText = text.replace('#', '').toUpperCase();
    setHexInput('#' + cleanText);
    
    // Validate hex color
    const hexRegex = /^#?([A-Fa-f0-9]{6})$/;
    const match = ('#' + cleanText).match(hexRegex);
    if (match) {
      const hex = '#' + match[1];
      setTempColor(hex);
    }
  };

  const handleConfirm = () => {
    // Validate final color
    const hexRegex = /^#?([A-Fa-f0-9]{6})$/;
    const match = hexInput.match(hexRegex);
    if (match) {
      onSelectColor('#' + match[1].toUpperCase());
    } else {
      // If invalid, keep the original color
      onSelectColor(selectedColor);
    }
    setModalVisible(false);
  };

  const isValidColor = () => {
    const hexRegex = /^#?([A-Fa-f0-9]{6})$/;
    return hexInput.match(hexRegex);
  };

  return (
    <View style={styles.container}>
      {/* Current Color Display */}
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.colorPreview}
          onPress={() => {
            setTempColor(selectedColor);
            setHexInput(selectedColor.toUpperCase());
            setModalVisible(true);
          }}
        >
          <View style={[styles.colorCircle, { backgroundColor: selectedColor }]} />
          <Text style={styles.colorText}>{selectedColor.toUpperCase()}</Text>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Simple Color Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Color Code</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* Large Color Preview */}
              <View style={styles.previewSection}>
                <View style={[styles.largePreview, { backgroundColor: isValidColor() ? tempColor : selectedColor }]}>
                  <Text style={styles.previewText}>
                    {isValidColor() ? tempColor.toUpperCase() : selectedColor.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Hex Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Hex Color Code:</Text>
                <TextInput
                  style={[
                    styles.hexInput,
                    { borderColor: isValidColor() ? Colors.success : Colors.error }
                  ]}
                  value={hexInput}
                  onChangeText={handleHexInput}
                  autoCapitalize="characters"
                  maxLength={7}
                  placeholder="#593c3c"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.inputHint}>
                  Enter hex code like #593c3c or 593c3c
                </Text>
              </View>

              {/* Quick Color Examples */}
              <View style={styles.examplesSection}>
                <Text style={styles.examplesLabel}>Quick Examples:</Text>
                <View style={styles.exampleColors}>
                  {['#593c3c', '#274290', '#f27921', '#10b981', '#ef4444', '#8b5cf6'].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={styles.exampleColor}
                      onPress={() => {
                        setTempColor(color);
                        setHexInput(color);
                      }}
                    >
                      <View style={[styles.exampleSwatch, { backgroundColor: color }]} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: isValidColor() ? tempColor : Colors.gray[400] }
                ]}
                onPress={handleConfirm}
                disabled={!isValidColor()}
              >
                <Text style={styles.confirmButtonText}>Apply Color</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Config.SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Config.SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Config.SPACING.md,
    paddingVertical: Config.SPACING.sm,
    borderRadius: Config.BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Config.SPACING.sm,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  colorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
    fontFamily: 'monospace',
    marginRight: Config.SPACING.sm,
  },
  editIcon: {
    fontSize: 16,
    color: Colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Config.SPACING.lg,
    backgroundColor: Colors.gray[50],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: 'bold',
  },
  pickerContainer: {
    padding: Config.SPACING.lg,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: Config.SPACING.xl,
  },
  largePreview: {
    width: 200,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  previewText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  inputSection: {
    marginBottom: Config.SPACING.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Config.SPACING.sm,
  },
  hexInput: {
    backgroundColor: Colors.gray[50],
    padding: Config.SPACING.md,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    fontFamily: 'monospace',
    textAlign: 'center',
    borderWidth: 2,
    letterSpacing: 1,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Config.SPACING.sm,
    fontStyle: 'italic',
  },
  examplesSection: {
    marginBottom: Config.SPACING.md,
  },
  examplesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: Config.SPACING.sm,
    textAlign: 'center',
  },
  exampleColors: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Config.SPACING.sm,
  },
  exampleColor: {
    padding: Config.SPACING.xs,
  },
  exampleSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Config.SPACING.lg,
    backgroundColor: Colors.gray[50],
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: Config.SPACING.md,
  },
  cancelButton: {
    flex: 1,
    padding: Config.SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  confirmButton: {
    flex: 1,
    padding: Config.SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ColorPalettePicker;