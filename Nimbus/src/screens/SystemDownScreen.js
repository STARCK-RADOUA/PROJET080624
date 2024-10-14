import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';
import { navigate } from '../utils/navigationRef'; // Importer la fonction de navigation

const SystemDownScreen = ({navigation}) => {
  

 
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
