import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const ConnectionsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Business Connections</Text>
      <Text style={styles.subtitle}>Connect businesses for cross-promotion</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
});

export default ConnectionsScreen;


