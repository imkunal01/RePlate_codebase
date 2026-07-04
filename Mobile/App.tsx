import React, { useEffect, useRef } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';

import { useAuthStore } from './store/authStore';
import { notificationService } from './services/notificationService';

// ─── Screens ─────────────────────────────────────────────────────────────────
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import DonorNavigator from './navigation/DonorNavigator';
import RecipientNavigator from './navigation/RecipientNavigator';

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { isAuthenticated, isLoading, user, restoreSession } = useAuthStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Restore session on startup
  useEffect(() => {
    restoreSession();
  }, []);

  // Register push notifications when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      notificationService.registerForPushNotifications();

      // Handle foreground notifications — show Toast
      notificationListener.current = notificationService.addForegroundListener(
        (notification) => {
          const { title, body } = notification.request.content;
          Toast.show({
            type: 'info',
            text1: title || 'RePlate',
            text2: body || '',
            position: 'top',
          });
        }
      );

      // Handle notification tap — navigate to relevant screen
      responseListener.current = notificationService.addResponseListener(
        (response) => {
          const data = response.notification.request.content.data as any;
          // Navigation based on notification type will be handled inside screens
          console.log('Notification tapped:', data?.type);
        }
      );

      return () => {
        if (notificationListener.current) notificationListener.current();
        if (responseListener.current) responseListener.current();
      };
    }
  }, [isAuthenticated]);

  if (isLoading) {
    // Return null or a splash component while restoring session
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0F1117"
          translucent={Platform.OS === 'android'}
        />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              // ─── Auth Stack ──────────────────────────────────────────────
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            ) : user?.activeRole === 'donor' ? (
              // ─── Donor Tab Navigator ─────────────────────────────────────
              <Stack.Screen name="DonorApp" component={DonorNavigator} />
            ) : (
              // ─── Recipient Tab Navigator ──────────────────────────────────
              <Stack.Screen name="RecipientApp" component={RecipientNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
