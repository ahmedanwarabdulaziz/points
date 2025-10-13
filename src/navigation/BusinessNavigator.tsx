/**
 * Business Navigator
 * Drawer navigation for business owner/staff app with logout
 */

import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BusinessStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/Colors';
import Config from '../constants/Config';

// Import business screens
import DashboardScreen from '../screens/business/DashboardScreen';
import ScanCustomerScreen from '../screens/business/ScanCustomerScreen';
import SendPointsScreen from '../screens/business/SendPointsScreen';
import TransactionFormScreen from '../screens/business/TransactionFormScreen';
import BusinessRewardsScreen from '../screens/business/BusinessRewardsScreen';
import CustomersScreen from '../screens/business/CustomersScreen';
import ProfilesScreen from '../screens/business/ProfilesScreen';
import CreateProfileScreen from '../screens/business/CreateProfileScreen';
import EditProfileScreen from '../screens/business/EditProfileScreen';
import SettingsScreen from '../screens/business/SettingsScreen';

const Drawer = createDrawerNavigator<BusinessStackParamList>();

// Custom Drawer Content
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { signOut, userProfile } = useAuth();

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Points Redeem</Text>
        <Text style={styles.drawerSubtitle}>Business Portal</Text>
        <View style={styles.businessBadge}>
          <Text style={styles.businessBadgeText}>BUSINESS</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userProfile?.name || 'Business Owner'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const BusinessNavigator = () => {
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768; // Tablet and above

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: Colors.white,
          width: 280,
        },
        drawerType: isLargeScreen ? 'permanent' : 'front', // Always visible on large screens
        drawerActiveTintColor: Colors.secondary,
        drawerInactiveTintColor: Colors.textLight,
        drawerActiveBackgroundColor: Colors.secondary + '10',
        drawerItemStyle: {
          borderRadius: Config.BORDER_RADIUS.md,
          marginVertical: 2,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: '📊 Dashboard',
          drawerLabel: '📊 Dashboard',
        }}
      />
      <Drawer.Screen
        name="ScanCustomer"
        component={ScanCustomerScreen}
        options={{
          title: '📷 Scan Customer',
          drawerLabel: '📷 Scan Customer',
        }}
      />
      <Drawer.Screen
        name="SendPoints"
        component={SendPointsScreen}
        options={{
          title: '💳 Send Points',
          drawerLabel: '💳 Send Points',
        }}
      />
      <Drawer.Screen
        name="TransactionForm"
        component={TransactionFormScreen}
        options={{
          title: '💰 Send Points',
          drawerLabel: '💰 Transaction',
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
      <Drawer.Screen
        name="Rewards"
        component={BusinessRewardsScreen}
        options={{
          title: '🎁 Rewards',
          drawerLabel: '🎁 Rewards',
        }}
      />
      <Drawer.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          title: '👥 Customers',
          drawerLabel: '👥 Customers',
        }}
      />
      <Drawer.Screen
        name="Profiles"
        component={ProfilesScreen}
        options={{
          title: '📋 Profiles',
          drawerLabel: '📋 Profiles',
        }}
      />
      <Drawer.Screen
        name="CreateProfile"
        component={CreateProfileScreen}
        options={{
          title: '➕ Create Profile',
          drawerLabel: '➕ Create Profile',
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
      <Drawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: '✏️ Edit Profile',
          drawerLabel: '✏️ Edit Profile',
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '⚙️ Settings',
          drawerLabel: '⚙️ Settings',
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: Config.SPACING.xl,
    paddingTop: Config.SPACING.xxl,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Config.SPACING.md,
  },
  businessBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Config.SPACING.sm,
    paddingVertical: 4,
    borderRadius: Config.BORDER_RADIUS.sm,
  },
  businessBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  drawerItems: {
    flex: 1,
    paddingTop: Config.SPACING.md,
    paddingHorizontal: Config.SPACING.sm,
  },
  drawerFooter: {
    padding: Config.SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  userInfo: {
    marginBottom: Config.SPACING.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutButton: {
    backgroundColor: Colors.error + '10',
    padding: Config.SPACING.md,
    borderRadius: Config.BORDER_RADIUS.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
});

export default BusinessNavigator;
