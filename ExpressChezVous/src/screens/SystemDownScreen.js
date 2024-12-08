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
      <View style={styles.iconWrapper}>
        <Icon 
          name="alert-circle-outline" 
          type="material-community" 
          color="#FFA500" 
          size={120} 
          containerStyle={styles.iconContainer} 
        />
      </View>

      {/* Section du message */}
      <Text style={styles.title}>Erreur Système</Text>
      <Text style={styles.message}>
        Nous rencontrons actuellement des problèmes. Veuillez réessayer dans un moment.
      </Text>

      {/* Illustration (facultatif) */}
      <Image 
        source={{ uri: 'https://example.com/system-issue-illustration.png' }} 
        style={styles.image} 
      />

      {/* Bouton Retry */}
      <TouchableOpacity style={styles.button} onPress={() => {fetchData()}}>
        <Text style={styles.buttonText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  iconWrapper: {
    backgroundColor: '#e0f7fa',
    padding: 20,
    borderRadius: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    lineHeight: 22,
  },
  image: {
    width: 250,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SystemDownScreen;
