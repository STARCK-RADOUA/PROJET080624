import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import io from 'socket.io-client';
import * as Device from 'expo-device';
const socket = io('http://192.168.1.35:4000'); // Replace with your server's URL

const LoadingScreen = ({ navigation }) => {
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    const deviceId = Device.osBuildId;

    const intervalId = setInterval(() => {
      console.log('Emitting checkActivation event...');
      socket.emit('checkActivation', { deviceId });
    }, 3000); // Check every 3 seconds

    socket.on('activationStatus', (status) => {
      console.log('Activation status received:', status);
      if (status.activated) {
        setIsActivated(true);
        clearInterval(intervalId);
        navigation.replace('Services');
      }
    });

    return () => {
      clearInterval(intervalId);
      socket.off('activationStatus');
    };
  }, [navigation]);

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
