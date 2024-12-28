import React, { useContext, useEffect, useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Platform  , View , Text} from 'react-native';
import { AuthContext, AuthProvider } from './src/redux/AuthProvider';
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import * as Device from 'expo-device';
import { BASE_URL, BASE_URLIO } from '@env';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
    const [isConnected, setIsConnected] = useState(true); // State to track internet connection
  
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
    // Configurer les notifications pour le foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Configurer le canal de notification pour Android
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
  if (!isConnected) {
    return <DisconnectedScreen />;
  }

  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <AppContent />
      </SafeAreaView>
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isLoggedIn, login, logout } = useContext(AuthContext);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Enregistrer les notifications
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (isLoggedIn) {
        saveAdminPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue : ', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Réponse à la notification : ', response);
      const targetScreen = response.notification.request.content.data.targetScreen;
      if (targetScreen) {
        // navigation.navigate(targetScreen);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isLoggedIn]);

  return !isLoggedIn ? <LoginScreen onLogin={login} /> : <MainNavigator onLogin={logout} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  NoInternetcontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Soft light background color
    paddingHorizontal: 20,
  },
  iconWrapper: {
    marginBottom: 20, // Space between the icon and the title
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 12,
    height: 12,
    backgroundColor: '#FF5252', // Bright red for alert
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F5F5F5', // Matches background for a clean look
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#424242', // Neutral dark color for readability
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#616161', // Muted gray for secondary text
    lineHeight: 24,
  },
});

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
      alert('Failed to get push token for push notification!');
      return;
    }

    try {
      const projectId = 'e7053047-cf1d-400e-b255-1faee969efbb'; // Remplacez par votre projectId réel
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Token généré :', token);
    } catch (error) {
      console.error('Erreur lors de la génération du token:', error);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

async function saveAdminPushToken(expoPushToken) {
  try {
    console.log('Enregistrement du token : ', expoPushToken);
    if (!expoPushToken) {
      console.error('Le token est undefined, arrêt de la fonction.');
      return;
    }

    const response = await axios.post(`${BASE_URL}/api/notification/save-push-token`, {
      userType: 'Admin',
      pushToken: expoPushToken,
      deviceId: Device.osBuildId,
    });

    console.log('Token enregistré sur le serveur : ', response.data);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du token : ', error.response ? error.response.data : error.message);
  }
}

const DisconnectedScreen = () => {
  return (
    <View style={styles.NoInternetcontainer}>
    
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

