import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import useDeviceId from './useDeviceId';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { BASE_URL, BASE_URLIO } from '@env';
import { navigate } from '../utils/navigationRef';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const deviceIdFromHook = useDeviceId();

  useEffect(() => {
    // Attendre que deviceId soit prêt (mis à jour)
    if (deviceIdFromHook) {
      setDeviceId(deviceIdFromHook);
    }
  }, [deviceIdFromHook]);  // Dépendance à deviceIdFromHook
  
  const socket = io(BASE_URLIO, {
    query: {
      deviceId: deviceId,
    },
  });

  useEffect(() => {
    // Demande de permission et récupération de la localisation
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La localisation est nécessaire pour cette fonctionnalité.');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log('------------------------------------');
      console.log("location login", currentLocation);
      console.log('------------------------------------');
    })();
  }, []);

  useEffect(() => {
    // Auto-login dès que la localisation est disponible
    if (deviceId && location) {
      autoLogin();
    }
  }, [location]);

  useEffect(() => {
    socket.on('adminActivateDriver', () => {
      autoLogin();
    });

    return () => {
      socket.off('adminActivateDriver');
    };
  }, [location]);

  const autoLogin = () => {
    socket.emit('autoLoginDriver', { deviceId, location: `${location.coords.latitude} ${location.coords.longitude}` });
    socket.on('loginSuccess', () => {
      navigate('Home');
      socket.off('loginSuccess');
    });
  };

  const handleLogin = async () => {
    if (!location) {
      Alert.alert('Erreur', 'Localisation en attente. Veuillez réessayer.');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        deviceId,
        phone,
        password,
        location: `${location.coords.latitude} ${location.coords.longitude}`
      });

      if (response.status === 401) {
        Alert.alert('Connexion', 'Veuillez activer votre compte.');
      } else if (response.status === 200) {
        Alert.alert('Bienvenue');
        navigate('Home');


      }else if (response.status === 404) {
        Alert.alert('Activation requise', 'Une activation supplémentaire est requise.');


      }
    } catch (error) {
      Alert.alert('Échec de la connexion', error.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/nimbusfont.png')} style={styles.logoH} />

      <View style={styles.overlay} />

      <View style={styles.containerH}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            placeholderTextColor="#A5A5A5"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#A5A5A5"
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <Image source={require('../assets/sffff.webp')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3B1F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030503',
    opacity: 0.7,
    zIndex: 1,
  },
  containerH: {
    width: '100%',
    backgroundColor: '#2C4231',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    zIndex: 2,
    borderTopLeftRadius: 65,
    borderBottomRightRadius: 65,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '40%',
    position: 'absolute',
    bottom: 0,
  },
  logoH: {
    width: '100%',
    height: '40%',
    position: 'absolute',
    top: 0,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#4A7A4C',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#283C2B',
    color: '#FFFFFF',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
