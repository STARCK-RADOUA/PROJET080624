// src/services/notifications.js
import * as Notifications from 'expo-notifications';
import { firebase } from '../../firebase'; // Assurez-vous que firebase est configuré

export const registerForPushNotificationsAsync = async () => {
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
  return token;
};

export const saveTokenToFirestore = async (token) => {
  const userRef = firebase.firestore().collection('users').doc('USER_ID'); // Remplace par la logique utilisateur
  await userRef.set({ expoPushToken: token }, { merge: true });
};

export const addNotificationListeners = (Toast, notificationListener, responseListener) => {
  notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification reçue :', notification);
    Toast.show({
      type: 'success',
      text1: notification.request.content.title || 'Notification',
      text2: notification.request.content.body || 'Vous avez une nouvelle notification.',
    });
  });

  responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Réponse à la notification :', response);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener.current);
    Notifications.removeNotificationSubscription(responseListener.current);
  };
};
