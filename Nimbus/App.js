import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { LocationProvider } from './src/utils/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync, saveDriverPushToken, configureNotifications } from './src/utils/notificationService';
import { BASE_URLIO } from '@env';
import { navigate } from './src/utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const deviceId = Device.osBuildId;
// Initialize socket connection
const socket = io(BASE_URLIO, { query: { deviceId } });

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState); // Track app state
  const notificationListener = useRef();
  const responseListener = useRef();
  const socketRef = useRef(socket); // Use socketRef to store socket connection
  const BACKGROUND_PING_TASK = 'background-fetch';
  const [isSystemDown, setIsSystemDown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Define the background task
  TaskManager.defineTask(BACKGROUND_PING_TASK, async () => {
    try {
      console.log('Sending background ping');
      socketRef.current.emit('driverPing', { deviceId: Device.osBuildId });
      return BackgroundFetch.Result.NewData;
    } catch (error) {
      console.log('Error in background ping task', error);
      return BackgroundFetch?.Result?.Failed || BackgroundFetch.Result.NewData;
    }
  });

  useEffect(() => {
    // Activate keep awake asynchronously
    activateKeepAwakeAsync();
  
    return () => {
      // Deactivate keep awake
      deactivateKeepAwake();
    };
  }, []);
  
  useEffect(() => {
    // Listen to the socket for the system status
    socketRef.current.on('statusSiteDriver', (systemActive) => {
      setIsSystemDown(!systemActive);
      console.log('System status received:', systemActive);
      setLoading(false);
      if (!systemActive) {
        navigate('SystemDownScreen');
      }
    });

    return () => {
      socketRef.current.off('statusSiteDriver');
    };
  }, []);

  // Register background fetch task
  async function registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_PING_TASK, {
        minimumInterval: 1 * 60, // Ping every minute
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

    socketRef.current = socket;
    socket.emit('toggleSystemDriver'); // For example, emit an event to check system status

    socket.on('connect', () => {
      console.log('Socket reconnected');
    });
    
    console.log('Initial ping');
    socket.emit('driverPing', { deviceId });
    socket.on('adminDeactivateDriver', () => {
      console.log('Admin deactivated driver');
      navigate('Login');
    });

    const startPingInterval = () => {
      return setInterval(() => {
        if (appState === 'active' && isConnected) {
          console.log('Sending ping in active state');
          socket.emit('driverPing', { deviceId });
        }
      }, 25000); // Ping every 25 seconds
    };

    let pingInterval = startPingInterval();

    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
      if (nextAppState === 'active' && isConnected) {
        console.log('App is active, restarting ping interval');
        clearInterval(pingInterval); // Clear previous interval before starting a new one
        pingInterval = startPingInterval();
      } else if (nextAppState === 'background') {
        console.log('App is in the background, clearing ping interval');
        clearInterval(pingInterval);
      }
    };

    // Monitor app state changes
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

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

    return () => {
      appStateListener.remove();
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      clearInterval(pingInterval);
      socketRef.current.disconnect();
    };
  }, [appState, isConnected]);

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
