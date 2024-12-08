import * as Notifications from 'expo-notifications';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { BASE_URL } from '@env';
import { Platform } from 'react-native';

// Configure notification handler for foreground and background
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

// Register for push notifications and obtain the token
export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return;
    }

    try {
      const projectId = '45d377ef-5a79-42d4-8c70-64c57e628942'; // Replace with your real Expo projectId
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push token generated:', token);
    } catch (error) {
      console.error('Error generating push token:', error);
    }
  } else {
    alert('Must use a physical device for Push Notifications');
  }

  return token;
}

// Save the push token for the driver to the backend
export async function saveDriverPushToken(expoPushToken) {
  if (!expoPushToken) {
    console.error('Push token is undefined, skipping save operation.');
    return;
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/notification/save-push-token`, {
      userType: 'Client',
      pushToken: expoPushToken,
      deviceId: DeviceInfo.getUniqueId(),
    });

    console.log('Push token saved on the server:', response.data);
  } catch (error) {
    console.error('Error saving push token:', error.response ? error.response.data : error.message);
  }
}
