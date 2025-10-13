/**
 * Admin Navigator
 * Responsive drawer navigation for super admin panel
 * - Side drawer on web/tablet (always visible)
 * - Drawer menu on mobile (can be opened)
 */

import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { AdminStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/Colors';
import Config from '../constants/Config';

// Import admin screens
import OverviewScreen from '../screens/admin/OverviewScreen';
import BusinessesScreen from '../screens/admin/BusinessesScreen';
import AddBusinessScreen from '../screens/admin/AddBusinessScreen';
import EditBusinessScreen from '../screens/admin/EditBusinessScreen';
import AdminCustomersScreen from '../screens/admin/AdminCustomersScreen';
import ConnectionsScreen from '../screens/admin/ConnectionsScreen';
import ApprovalsScreen from '../screens/admin/ApprovalsScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import CategoriesScreen from '../screens/admin/CategoriesScreen';
import AddCategoryScreen from '../screens/admin/AddCategoryScreen';
import EditCategoryScreen from '../screens/admin/EditCategoryScreen';
import SubCategoriesScreen from '../screens/admin/SubCategoriesScreen';
import AddSubCategoryScreen from '../screens/admin/AddSubCategoryScreen';
import EditSubCategoryScreen from '../screens/admin/EditSubCategoryScreen';

const Drawer = createDrawerNavigator<AdminStackParamList>();

// Custom Drawer Content
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { signOut, userProfile } = useAuth();

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Points Redeem</Text>
        <Text style={styles.drawerSubtitle}>Super Admin Panel</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{userProfile?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const AdminNavigator = () => {
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768; // Tablet and above

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
          width: isLargeScreen ? 280 : 280,
        },
        drawerType: isLargeScreen ? 'permanent' : 'front', // Always visible on large screens
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textLight,
        drawerActiveBackgroundColor: Colors.primary + '10',
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
        name="Overview"
        component={OverviewScreen}
        options={{
          title: '📊 Dashboard',
          drawerLabel: '📊 Dashboard',
        }}
      />
      <Drawer.Screen
        name="Businesses"
        component={BusinessesScreen}
        options={{
          title: '🏢 Businesses',
          drawerLabel: '🏢 Businesses',
        }}
      />
      <Drawer.Screen
        name="AddBusiness"
        component={AddBusinessScreen}
        options={{
          title: '➕ Add Business',
          drawerLabel: '➕ Add Business',
          drawerItemStyle: {
            display: 'none', // Hide from drawer, accessed via button
          },
        }}
      />
      <Drawer.Screen
        name="EditBusiness"
        component={EditBusinessScreen}
        options={{
          title: '✏️ Edit Business',
          drawerLabel: '✏️ Edit Business',
          drawerItemStyle: {
            display: 'none', // Hide from drawer, accessed via button
          },
        }}
      />
      <Drawer.Screen
        name="Customers"
        component={AdminCustomersScreen}
        options={{
          title: '👥 Customers',
          drawerLabel: '👥 Customers',
        }}
      />
      <Drawer.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={{
          title: '🔗 Connections',
          drawerLabel: '🔗 Connections',
        }}
      />
      <Drawer.Screen
        name="Approvals"
        component={ApprovalsScreen}
        options={{
          title: '⚠️ Approvals',
          drawerLabel: '⚠️ Approvals',
        }}
      />
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: '📈 Analytics',
          drawerLabel: '📈 Analytics',
        }}
      />
      <Drawer.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: '📂 Categories',
          drawerLabel: '📂 Categories',
        }}
      />
      <Drawer.Screen
        name="AddCategory"
        component={AddCategoryScreen}
        options={{
          title: '➕ Add Category',
          drawerLabel: '➕ Add Category',
          drawerItemStyle: {
            display: 'none', // Hide from drawer, accessed via button
          },
        }}
      />
      <Drawer.Screen
        name="EditCategory"
        component={EditCategoryScreen}
        options={{
          title: '✏️ Edit Category',
          drawerLabel: '✏️ Edit Category',
          drawerItemStyle: {
            display: 'none', // Hide from drawer, accessed via button
          },
        }}
      />
      <Drawer.Screen
        name="SubCategories"
        component={SubCategoriesScreen}
        options={{
          title: '📋 SubCategories',
          drawerLabel: '📋 SubCategories',
          drawerItemStyle: {
            display: 'none', // Hide from drawer, accessed via button
          },
        }}
      />
      <Drawer.Screen
        name="AddSubCategory"
        component={AddSubCategoryScreen}
        options={{
          title: '➕ Add SubCategory',
          drawerLabel: '➕ Add SubCategory',
          drawerItemStyle: {
            display: 'none', // Hide from drawer, accessed via button
          },
        }}
      />
      <Drawer.Screen
        name="EditSubCategory"
        component={EditSubCategoryScreen}
        options={{
          title: '✏️ Edit SubCategory',
          drawerLabel: '✏️ Edit SubCategory',
          drawerItemStyle: {
            display: 'none', // Hide from drawer, accessed via button
          },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={AdminSettingsScreen}
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
  adminBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Config.SPACING.sm,
    paddingVertical: 4,
    borderRadius: Config.BORDER_RADIUS.sm,
  },
  adminBadgeText: {
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

export default AdminNavigator;
