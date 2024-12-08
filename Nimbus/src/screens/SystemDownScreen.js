import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';

import React, { useEffect, useState } from 'react';

import { navigate } from '../utils/navigationRef'; // Import navigate function
import * as Device from 'expo-device';
const SystemDownScreen = ({navigation}) => {
  const deviceId = Device.identifierForVendor;

  const [isSystemActive, setIsSystemActive] = useState(true);
  const fetchData = async () => {

    const socket = io(BASE_URLIO, {
      query: {
        deviceId: deviceId,  // Pass the unique deviceId
      },
    }); 
    socket.emit('toggleSystemDriver'); // For example, emit an event to check system status

  };
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
      {/* Section de l'icône */}
      <Icon 
        name="power-off" 
        type="font-awesome" 
        color="#ff5252" 
        size={100} 
        containerStyle={styles.iconContainer} 
      />

      {/* Section du message */}
      <Text style={styles.title}>Système en panne</Text>
      <Text style={styles.message}>
        Le système est actuellement indisponible. Veuillez réessayer plus tard.
      </Text>

      {/* Illustration (facultatif) */}
      <Image 
        source={{ uri: 'https://example.com/system-down-illustration.png' }} 
        style={styles.image} 
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff5252',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SystemDownScreen;
