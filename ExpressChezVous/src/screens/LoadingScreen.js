import { BASE_URL, BASE_URLIO } from '@env';

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import io from 'socket.io-client';
import DeviceInfo from 'react-native-device-info';

const socket = io(`${BASE_URLIO}`); // Replace with your server's URL

const LoadingScreen = ({ navigation }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);



  useEffect(() => {
    const deviceId = DeviceInfo.getUniqueId();

  
      socket.emit('checkActivation', { deviceId });

    socket.on('activationStatus', (status) => {
      console.log('Activation status received:', status);
      if (status.activated) {
        setIsActivated(true);
        navigation.replace('Services');
      }
    });

    return () => {
      socket.off('activationStatus');
    };
  }, [navigation]);
  useEffect(() => {

    const deviceId = DeviceInfo.getUniqueId();

    const socket1 = io(BASE_URLIO, {
      query: {
        deviceId: deviceId,  // Passer l'identifiant unique
      }
    });

    // Écouter l'événement d'activation de l'administrateur
    socket1.on('adminActivateClient', () => {
      console.log('Admin activated Client');
      navigation.replace('Login');
      setIsActivated(true);
      setIsLoginSuccess(true);
    });

    return () => {
      socket1.off('adminActivateClient');
    };
  }, [isLoginSuccess]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Votre compte est en cours d'activation</Text>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 20,
  },
});

export default LoadingScreen;
