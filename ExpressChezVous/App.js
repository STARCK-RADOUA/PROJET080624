import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import io from 'socket.io-client';
import AppNavigator from './src/navigation/AppNavigator'; // Updated import path
import { registerForPushNotificationsAsync, saveDriverPushToken, configureNotifications } from './src/utils/notificationService';
import { BASE_URLIO } from '@env';
import { navigate } from './src/utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';
import * as Location from 'expo-location';  // Import expo-location for location fetching

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();
  const socketRef = useRef(null);
  const deviceId = Device.osBuildId;
  const [isSystemActive, setIsSystemActive] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(BASE_URLIO, {
      query: {
        deviceId: deviceId,  // Pass the unique deviceId
      },
    });    // Listen to the socket for the system status
    socket.on('statusSiteDriver', (systemActive) => {
      // Check the system status from the server
      console.log('System status received:', { systemActive });
      console.log('System status received:', { systemActive });
      console.log('System status received:', { systemActive });
      setIsSystemActive(systemActive);
       // Stop loading after receiving the status 
       if (!systemActive) {
navigate('SystemDownScreen') 
 } 

    });

    return () => {
      socket.off('statusSiteDriver');
    };
  }, []);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission Denied', 'You need to allow location access to continue.');
        return;
      }}

    fetchCurrentLocation();
    configureNotifications();

    console.log('------------------------------------');
    console.log('Client ID:', deviceId);
    console.log('------------------------------------');

    // Connect to Socket.IO
    const socket = io(BASE_URLIO, {
      query: {
        deviceId: deviceId,  // Pass the unique deviceId
      },
    });
    socket.emit('toggleSystemDriver'); // For example, emit an event to check system status

    // Listen for admin deactivation event
    socket.on('adminDeactivateClient', () => {
      console.log('You have been deactivated by the admin');
      // Navigate to Login screen when driver is deactivated
      console.log('Navigating t777777777777777777o Login');

      navigate('Login');
    });

    // Check and restore order status from AsyncStorage
  

    // Handle push notifications
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token) {
        saveDriverPushToken(token);
        console.log('------------------------------------');
        console.log('Push token:', token);
        console.log('------------------------------------');
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const targetScreen = response.notification.request.content.data.targetScreen;
      if (targetScreen) {
        console.log('Navigating to:', targetScreen);
        // navigate(targetScreen); // Uncomment when navigation logic is set
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
