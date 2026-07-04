import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';
import { ENDPOINTS } from '../constants/api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Request permission and register the device's push token with our backend
   * Call this after the user logs in
   */
  registerForPushNotifications: async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('replate-default', {
        name: 'RePlate Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F97316',
        sound: 'default',
      });
    }

    try {
      // Get the Expo Push Token (works via Expo's FCM proxy)
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenData.data;

      // Register the token with our backend
      await api.post(ENDPOINTS.fcmToken, { fcmToken: expoPushToken });

      console.log('Push token registered:', expoPushToken);
      return expoPushToken;
    } catch (error: any) {
      console.error('Failed to get push token:', error.message);
      return null;
    }
  },

  /**
   * Add a listener for notifications received while the app is in the foreground
   * Returns an unsubscribe function
   */
  addForegroundListener: (
    handler: (notification: Notifications.Notification) => void
  ) => {
    const subscription = Notifications.addNotificationReceivedListener(handler);
    return () => subscription.remove();
  },

  /**
   * Add a listener for when the user taps on a notification
   * Returns an unsubscribe function
   */
  addResponseListener: (
    handler: (response: Notifications.NotificationResponse) => void
  ) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    return () => subscription.remove();
  },

  /**
   * Get the last notification response (e.g., if app was opened from a notification)
   */
  getLastResponse: async () => {
    return Notifications.getLastNotificationResponseAsync();
  },

  /**
   * Schedule a local notification (e.g., for expiry reminders)
   */
  scheduleExpiryReminder: async (
    foodName: string,
    expiryDate: Date,
    minutesBefore = 30
  ) => {
    const triggerTime = new Date(expiryDate.getTime() - minutesBefore * 60 * 1000);
    if (triggerTime <= new Date()) return; // Already past

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Food Expiring Soon!',
        body: `"${foodName}" expires in ${minutesBefore} minutes. Has it been picked up?`,
        data: { type: 'EXPIRY_REMINDER' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
      },
    });
  },

  /**
   * Cancel all scheduled notifications (useful on logout)
   */
  cancelAllScheduled: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Reset badge count
   */
  clearBadge: async () => {
    await Notifications.setBadgeCountAsync(0);
  },
};
