import React, { useEffect, useRef, useState } from 'react';
import {  StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import io from 'socket.io-client';
import AppNavigator from './src/navigation/AppNavigator'; // Updated import path
import { registerForPushNotificationsAsync, saveDriverPushToken, configureNotifications } from './src/utils/notificationService';
import { BASE_URLIO } from '@env';
import { navigate } from './src/utils/navigationRef'; // Import navigate function

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    configureNotifications();

    // Connect to Socket.IO
    socketRef.current = io(BASE_URLIO);

    // Listen for admin deactivation event
    socketRef.current.on('adminDeactivateClient', () => {
      console.log('Admin deactivated Client');
      // Navigate to Login screen when driver is deactivated
      navigate('Login');
    });

    // Handle push notifications
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token) {
        saveDriverPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const targetScreen = response.notification.request.content.data.targetScreen;
      if (targetScreen) {
        console.log('Navigating to:', targetScreen);
        //navigate(targetScreen);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
    <AppNavigator />
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
