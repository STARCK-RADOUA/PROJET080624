import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image , TouchableOpacity} from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo
import io from 'socket.io-client';
import AppNavigator from './src/navigation/AppNavigator'; // Updated import path
import { registerForPushNotificationsAsync, saveDriverPushToken, configureNotifications } from './src/utils/notificationService';
import { BASE_URLIO } from '@env';
import { navigate } from './src/utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';
import * as Location from 'expo-location'; // Import expo-location for location fetching
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';
import myPic from './assets/internet.png'; // Import the local image


export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [isConnected, setIsConnected] = useState(true); // State to track internet connection
  const [isSystemActive, setIsSystemActive] = useState(true); // System status
  const notificationListener = useRef();
  const responseListener = useRef();
  const deviceId = Device.osBuildId;

  useEffect(() => {
    // Monitor network connection status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe(); // Unsubscribe from NetInfo listener when the component unmounts
    };
  }, []);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission Denied', 'Vous devez autoriser l\'accès à la localisation pour continuer.');
        return;
      }
    };

    fetchCurrentLocation();
    configureNotifications();

    console.log('------------------------------------');
    console.log('Client ID:', deviceId);
    console.log('------------------------------------');

    // Connect to Socket.IO
    const socket = io(BASE_URLIO, {
      query: {
        deviceId: deviceId, // Pass the unique deviceId
      },
    });

    // Emit an event to check system status
    socket.emit('toggleSystemDriver');

    // Listen for system status updates
    socket.on('statusSiteDriver', (systemActive) => {
      console.log('System status received:', { systemActive });
      setIsSystemActive(systemActive);
      if (!systemActive) {
        navigate('SystemDownScreen');
      }
    });

    // Listen for admin deactivation event
    socket.on('adminDeactivateClient', () => {
      console.log('Vous avez été désactivé par l\'administrateur');
      navigate('Login');
    });

    // Handle push notifications
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      if (token) {
        saveDriverPushToken(token);
        console.log('------------------------------------');
        console.log('Push token:', token);
        console.log('------------------------------------');
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification reçue en premier plan:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const targetScreen = response.notification.request.content.data.targetScreen;
      if (targetScreen) {
        console.log('Naviguer vers:', targetScreen);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      socket.disconnect();
    };
  }, []);

  if (!isConnected) {
    return <DisconnectedScreen />;
  }

  return <AppNavigator />;
}

const DisconnectedScreen = () => {
  return (
    <View style={styles.container}>
    <Image
        source={myPic} // Use the imported image
        style={styles.image}
        resizeMode="contain"
      />
    <View style={styles.iconWrapper}>
      <MaterialIcons name="wifi-off" size={50} color="#FFB74D" />
      <View style={styles.badge} />
    </View>
    <Text style={styles.title}>Ouups !</Text>
    <Text style={styles.message}>
    Aucune connexion Internet n'a été trouvée, 
      {'\n'}
      Veuillez vérifier vos paramètres Internet
    </Text>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: '#FFB74D',
    borderRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFB74D',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  }
});
