
// src/screens/SplashScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { navigate } from '../utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';

const SplashScreen = ({ navigation }) => {
  const deviceId = Device.osBuildId;
   const socket = io(BASE_URLIO, {
      query: {
        deviceId: deviceId,  // Pass the unique deviceId
      },
    });
  const [isSystemActive, setIsSystemActive] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    socket.emit('toggleSystemDriver');

     // Listen to the socket for the system status
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
      <Image source={require('../assets/images/8498789-23.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundImage: require('../assets/8498789sd.png'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
