import React, { useEffect, useState, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-get-random-values';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { firebase } from './firebase'; // Assurez-vous que firebase.js est correctement configuré

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    Toast.show({
      type: 'success', // ou 'error', 'info'
      text1: 'Hello',
      text2: 'This is some something 👋',
    });

    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Réception de la notification en premier plan
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue :', notification);
      // Afficher la notification avec Toast
      Toast.show({
        type: 'success',
        text1: notification.request.content.title || 'Notification',
        text2: notification.request.content.body || 'Vous avez une nouvelle notification.',
      });
    });

    // Réponse à la notification (quand l'utilisateur clique)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Réponse à la notification :', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Permission pour les notifications refusée !');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Token pour les notifications Expo:', token);
    setExpoPushToken(token);

    // Sauvegarder le token dans Firebase Firestore ou tout autre backend
    if (token) {
      saveTokenToFirestore(token);
    }
  };

  const saveTokenToFirestore = async (token) => {
    const userRef = firebase.firestore().collection('users').doc('USER_ID'); // Remplace par la logique utilisateur
    await userRef.set({
      expoPushToken: token,
    }, { merge: true });
  };

  return (
    <>
      <AppNavigator />
      <Toast /> 
    </>
  );
}
