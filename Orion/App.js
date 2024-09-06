import React, { useContext, useEffect, useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { AuthContext, AuthProvider } from './src/redux/AuthProvider';
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { BASE_URL } from '@env';

export default function App() {
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

  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <AppContent />
      </SafeAreaView>
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isLoggedIn, login ,logout} = useContext(AuthContext);
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

  return !isLoggedIn ? <LoginScreen onLogin={login} /> : <MainNavigator  onLogin={logout} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
      const projectId = 'e7053047-cf1d-400e-b255-1faee969efbb';  // Remplacez par votre projectId réel
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
    console.log('------------------------------------');
    console.log('Enregistrement du token : ', expoPushToken);
    console.log('------------------------------------');
    
    if (!expoPushToken) {
      console.error('Le token est undefined, arrêt de la fonction.');
      return;
    }

    const response = await axios.post(`${BASE_URL}/api/notification/save-push-token`, {
      userType: 'Admin',
      pushToken: expoPushToken,
      deviceId: DeviceInfo.getUniqueId(),
    });

    console.log('Token enregistré sur le serveur : ', response.data);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du token : ', error.response ? error.response.data : error.message);
  }
}
