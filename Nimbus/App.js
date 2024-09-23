import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo for connectivity
import io from 'socket.io-client';
import { LocationProvider } from './src/utils/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync, saveDriverPushToken, configureNotifications } from './src/utils/notificationService';
import { BASE_URLIO } from '@env';
import { navigate } from './src/utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState); // Track app state
  const notificationListener = useRef();
  const responseListener = useRef();
  const socketRef = useRef(null);
  const BACKGROUND_PING_TASK = 'background-fetch';

  // Define the background task
  TaskManager.defineTask(BACKGROUND_PING_TASK, async () => {
    try {
      const socket = io(BASE_URLIO, { query: { deviceId: Device.osBuildId } });
      console.log('Sending background ping');
      socket.emit('driverPing', { deviceId: Device.osBuildId });
      return BackgroundFetch.Result.NewData;
    } catch (error) {
      console.log('Error in background ping task', error);
      return BackgroundFetch.Result.Failed;
    }
  });

  // Register background fetch task
  async function registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_PING_TASK, {
        minimumInterval: 10, // Ping every 5 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('Background task registered successfully');
    } catch (error) {
      console.log('Error registering background task', error);
    }
  }

  useEffect(() => {
    configureNotifications();
    registerBackgroundTask();

    const deviceId = Device.osBuildId;
    // Initialize socket connection
    const socket = io(BASE_URLIO, { query: { deviceId } });
    socketRef.current = socket;
    socket.on('connect', () => {
      console.log('Socket reconnected');
    });
    
    // Send initial ping
    console.log('Initial ping');
    socket.emit('driverPing', { deviceId });
    socket.on('adminDeactivateDriver', () => {
      console.log('Admin deactivated driver');
      navigate('Login');
    });
    // Start interval ping when app is active
    const startPingInterval = () => {
      return setInterval(() => {
        if (appState === 'active' && isConnected) {
          console.log('Sending ping in active state');
          socket.emit('driverPing', { deviceId });
        }
      }, 30000); // Ping every 50 seconds
    };

    let pingInterval = startPingInterval();

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
      if (nextAppState === 'active' && isConnected) {
        console.log('App is active, restarting ping interval');
        pingInterval = startPingInterval();
      } else if (nextAppState === 'background') {
        console.log('App is in the background, clearing ping interval');
        clearInterval(pingInterval);
      }
    };

    // Monitor connectivity changes
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        console.log('Driver lost internet connection');
        socket.emit('driverDisconnected', { deviceId });
      } else {
        console.log('Driver reconnected to the internet');
      }
    });

    // Monitor push notifications
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      if (token) {
        saveDriverPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const targetScreen = response.notification.request.content.data.targetScreen;
      if (targetScreen) {
        console.log('Navigating to:', targetScreen);
        navigate(targetScreen);
      }
    });

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      unsubscribeNetInfo();
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      clearInterval(pingInterval);
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
