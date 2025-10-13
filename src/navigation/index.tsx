/**
 * Main Navigation Container
 * Routes users to appropriate navigation stack based on auth state and role
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import BusinessNavigator from './BusinessNavigator';
import AdminNavigator from './AdminNavigator';
import Colors from '../constants/Colors';

const Stack = createStackNavigator();

// Deep linking configuration
const linking = {
  prefixes: ['http://localhost:8081', 'https://pointsredeem.app', 'pointsredeem://'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: {
            path: 'register',
            parse: {
              businessId: (businessId: string) => businessId,
              profileId: (profileId: string) => profileId,
            },
          },
          RegisterBusiness: 'register-business',
          ScanQR: 'scan',
        },
      },
      CustomerApp: 'customer',
      BusinessApp: 'business',
      AdminApp: 'admin',
    },
  },
};

const Navigation = () => {
  const { currentUser, userProfile, loading } = useAuth();

  useEffect(() => {
    // Handle registration URLs even when logged in
    if (typeof window !== 'undefined') {
      console.log('🔗 Current URL:', window.location.href);
      const params = new URLSearchParams(window.location.search);
      const urlParams = Object.fromEntries(params);
      console.log('🔗 URL params:', urlParams);
      
      // If on registration URL and user is logged in (not as customer)
      if (window.location.pathname === '/register' && currentUser && userProfile) {
        const businessId = params.get('businessId');
        
        if (businessId && userProfile.role !== 'customer') {
          console.log('⚠️ Logged in user trying to access registration link');
          console.log('💡 Suggestion: Logout first to register as customer');
          
          // Show alert to user
          if (confirm('You are currently logged in. To register as a customer, please logout first.\n\nLogout now?')) {
            // Will be handled by signOut in auth context
            console.log('User chose to logout');
          }
        }
      }
    }
  }, [currentUser, userProfile]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser || !userProfile ? (
          // User not authenticated - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // User authenticated - route based on role
          <>
            {userProfile.role === 'customer' && (
              <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
            )}
            {(userProfile.role === 'business_owner' || userProfile.role === 'business_staff') && (
              <Stack.Screen name="BusinessApp" component={BusinessNavigator} />
            )}
            {userProfile.role === 'super_admin' && (
              <Stack.Screen name="AdminApp" component={AdminNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});

export default Navigation;


