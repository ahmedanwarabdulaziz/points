import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../types';
import Colors from '../../constants/Colors';
import Config from '../../constants/Config';

type OverviewScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'Overview'>;

const OverviewScreen = () => {
  const navigation = useNavigation<OverviewScreenNavigationProp>();

  const quickActions = [
    { title: '➕ Add New Business', screen: 'AddBusiness' as keyof AdminStackParamList },
    { title: '🏢 View All Businesses', screen: 'Businesses' as keyof AdminStackParamList },
    { title: '👥 View All Customers', screen: 'Customers' as keyof AdminStackParamList },
    { title: '🔗 Manage Connections', screen: 'Connections' as keyof AdminStackParamList },
    { title: '⚠️ Transaction Approvals', screen: 'Approvals' as keyof AdminStackParamList },
    { title: '📈 Platform Analytics', screen: 'Analytics' as keyof AdminStackParamList },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, Super Admin!</Text>
        <Text style={styles.subtitle}>Manage your Points Redeem platform</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Total Businesses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Total Points Issued</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => navigation.navigate(action.screen as any)}
          >
            <Text style={styles.actionButtonText}>{action.title}</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: Config.SPACING.xl,
    paddingTop: Config.SPACING.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Config.SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Config.SPACING.lg,
    gap: Config.SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Config.SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  section: {
    padding: Config.SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Config.SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    marginBottom: Config.SPACING.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: Colors.primary,
  },
});

export default OverviewScreen;

