import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import * as Device from 'expo-device';
import { LocationProvider } from './src/utils/LocationContext';
import AppNavigator from './src/navigation/AppNavigator'; 
import { BASE_URL } from '@env';

export default function App() {
  useEffect(() => {
    // Configure foreground notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, // Ensures alerts are shown in the foreground
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Configure Android-specific notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }, []);

  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    async function setupNotifications() {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);

      if (token) {
        await saveDriverPushToken(token);
      }

      // Handle foreground notification reception
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received (foreground):', notification);
      });

      // Handle notification response when clicked
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        const targetScreen = response.notification.request.content.data.targetScreen;
        if (targetScreen) {
          console.log('Navigating to:', targetScreen);
          // Implement navigation logic here
          // navigationRef.current?.navigate(targetScreen);
        }
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }

    setupNotifications();
  }, []);

  return (
    <LocationProvider>
      <View style={styles.container}>
        <AppNavigator />
        <StatusBar style="auto" />
      </View>
    </LocationProvider>
  );
}

async function registerForPushNotificationsAsync() {
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
      const projectId = 'your-real-project-id-here'; // Replace with your actual projectId
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

async function saveDriverPushToken(expoPushToken) {
  if (!expoPushToken) {
    console.error('Push token is undefined, skipping save operation.');
    return;
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/notification/save-push-token`, {
      userType: 'Driver',
      pushToken: expoPushToken,
      deviceId: Device.osBuildId,
    });

    console.log('Push token saved on the server:', response.data);
  } catch (error) {
    console.error('Error saving push token:', error.response ? error.response.data : error.message);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
