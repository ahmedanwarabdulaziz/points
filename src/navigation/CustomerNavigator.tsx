/**
 * Customer Navigator
 * Bottom tab navigation for customer app
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomerStackParamList } from '../types';
import Colors from '../constants/Colors';

// Import customer screens (placeholders for now)
import HomeScreen from '../screens/customer/HomeScreen';
import MyQRCodeScreen from '../screens/customer/MyQRCodeScreen';
import RewardsScreen from '../screens/customer/RewardsScreen';
import HistoryScreen from '../screens/customer/HistoryScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

// Icons (we'll use simple text for now, can add icons later)
import { Text } from 'react-native';

const Tab = createBottomTabNavigator<CustomerStackParamList>();

const CustomerNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="MyQRCode"
        component={MyQRCodeScreen}
        options={{
          title: 'My QR Code',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📱</Text>,
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎁</Text>,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📜</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default CustomerNavigator;


