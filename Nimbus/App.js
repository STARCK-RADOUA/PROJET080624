import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import * as Device from 'expo-device';
import { LocationProvider } from './src/utils/LocationContext'; // Import LocationContext
import AppNavigator from './src/navigation/AppNavigator'; 
import { BASE_URL } from '@env';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  // Configure notifications
  useEffect(() => {
    configureNotifications();

    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token) {
        saveDriverPushToken(token);
      }
    });

    // Listener for receiving notifications in the foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Listener for handling notification response when tapped
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const targetScreen = response.notification.request.content.data.targetScreen;
      if (targetScreen) {
        console.log('Navigating to:', targetScreen);
        // Implement your navigation logic here
        // Example: navigationRef.current?.navigate(targetScreen);
      }
    });

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
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

// Configure notification handler for foreground and background
function configureNotifications() {
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
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    console.log('------------------------------------');
    console.log('Device ID:', Device.osBuildId);
    console.log('------------------------------------');
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
      const projectId = '8a04b1f0-bf32-40a0-8ce1-354efa7c0cf0'; // Replace with your real Expo projectId
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
