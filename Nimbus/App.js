import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import io from 'socket.io-client';
import { LocationProvider } from './src/utils/LocationContext';
import AppNavigator from './src/navigation/AppNavigator'; // Updated import path
import { registerForPushNotificationsAsync, saveDriverPushToken, configureNotifications } from './src/utils/notificationService';
import { BASE_URLIO } from '@env';
import { navigate } from './src/utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();
  const socketRef = useRef(null);
const deviceId =  Device.osBuildId;
  useEffect(() => {
    configureNotifications();
    const socket = io(BASE_URLIO, {
      query: {
        deviceId:deviceId ,  // Pass the unique clientId
      }
    });



    // Connect to Socket.IO
  

    // Listen for admin deactivation event
    socket.on('adminDeactivateDriver', () => {
      console.log('Admin deactivated driver');
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
        navigate(targetScreen);
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
    <LocationProvider>
      <View style={styles.container}>
        <AppNavigator />
        <StatusBar style="auto" />
      </View>
    </LocationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
