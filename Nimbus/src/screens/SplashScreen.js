
// src/screens/SplashScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { navigate } from '../utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';

const SplashScreen = ({ navigation }) => {
  const deviceId = Device.osBuildId;

  const [isSystemActive, setIsSystemActive] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(BASE_URLIO, {
      query: {
        deviceId: deviceId,  // Pass the unique deviceId
      },
    });    // Listen to the socket for the system status
    socket.on('statusSiteDriver', (systemActive) => {
      // Check the system status from the server
      console.log('System status received:', { systemActive });
      console.log('System status received:', { systemActive });
      console.log('System status received:', { systemActive });
      setIsSystemActive(systemActive);
       // Stop loading after receiving the status 
       if (!systemActive) {
navigate('SystemDownScreen') 
 } 
 if (systemActive) {
navigate('Login') 
 }
    });

    return () => {
      socket.off('statusSiteDriver');
    };
  }, []);
  React.useEffect(() => {
    setTimeout(() => {





      
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/sffff.webp')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b3b1fb3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
