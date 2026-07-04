import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';

import DonorHomeScreen from '../screens/donor/DonorHomeScreen';
import PostFoodScreen from '../screens/donor/PostFoodScreen';
import DonorHistoryScreen from '../screens/donor/DonorHistoryScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Ionicons name={name} size={22} color={color} />
  </View>
);

export default function DonorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="DonorHome"
        component={DonorHomeScreen}
        options={{
          tabBarLabel: 'My Donations',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PostFood"
        component={PostFoodScreen}
        options={{
          tabBarLabel: 'Donate',
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.postButton}>
              <Ionicons name="add" size={28} color={Colors.white} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="DonorHistory"
        component={DonorHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'time' : 'time-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DonorProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 8,
  },
  iconContainerActive: {
    backgroundColor: `${Colors.primary}20`,
  },
  postButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
