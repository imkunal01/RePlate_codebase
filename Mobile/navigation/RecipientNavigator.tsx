import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

import MapScreen from '../screens/recipient/MapScreen';
import NearbyListScreen from '../screens/recipient/NearbyListScreen';
import MyClaimsScreen from '../screens/recipient/MyClaimsScreen';
import DonationDetailScreen from '../screens/recipient/DonationDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack wrapper for list → detail navigation
function NearbyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NearbyList" component={NearbyListScreen} />
      <Stack.Screen name="DonationDetail" component={DonationDetailScreen} />
    </Stack.Navigator>
  );
}

function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="DonationDetail" component={DonationDetailScreen} />
    </Stack.Navigator>
  );
}

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

export default function RecipientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NearbyTab"
        component={NearbyStack}
        options={{
          tabBarLabel: 'Nearby',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'restaurant' : 'restaurant-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyClaims"
        component={MyClaimsScreen}
        options={{
          tabBarLabel: 'My Claims',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="RecipientProfile"
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
    backgroundColor: `${Colors.secondary}20`,
  },
});
