// App.js
import React, { useEffect, useState, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import CustomToast from './src/components/CustomToast'; // Import du composant personnalisé
import { registerForPushNotificationsAsync, saveTokenToFirestore, addNotificationListeners } from './src/services/notifications';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    Toast.show({
      type: 'custom', // Utiliser le type 'custom' pour le toast personnalisé
      text1: 'Hello',
      text2: 'This is something 👋',
    });

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        saveTokenToFirestore(token);
      }
    });

    const removeListeners = addNotificationListeners(Toast, notificationListener, responseListener);

    return () => {
      removeListeners();
    };
  }, []);

  return (
    <>
      <AppNavigator />
      <Toast config={{
        custom: (internalState) => (
          <CustomToast
            type={internalState.type}
            message1={internalState.text1}
            message2={internalState.text2}
          />
        )
      }} />
    </>
  );
}
