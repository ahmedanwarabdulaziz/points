import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

const ProfileScreen = () => {
  const { signOut, userProfile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
      <Text style={styles.subtitle}>{userProfile?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: Config.SPACING.lg },
  text: { fontSize: 20, fontWeight: 'bold', color: Colors.textDark },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 8, marginBottom: 24 },
  button: { backgroundColor: Colors.error, padding: Config.SPACING.md, borderRadius: Config.BORDER_RADIUS.md, marginTop: 16 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;


