import { BASE_URLIO, BASE_URL } from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ImageBackground, Dimensions, ActivityIndicator, Alert } from 'react-native';
import * as Device from 'expo-device';  // Pour obtenir l'ID de l'appareil
import io from 'socket.io-client';
import { styles } from './styles/loginstyle';

const { width } = Dimensions.get('window');

// Initialize the socket connection
const socket = io(`${BASE_URLIO}`);  // Remplacez par l'URL de votre serveur

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);  // Loading indicator
  const [phone, setPhone] = useState(''); // Store phone number
  const [password, setPassword] = useState(''); // Store password

  // Auto-login function
  const autoLogin = async () => {
    const deviceId = Device.osBuildId;  // Récupérez l'ID de l'appareil

    if (deviceId) {
      setLoading(true);  // Start loading indicator
      socket.emit('autoLogin', { deviceId });  // Send device ID to the server

      socket.on('loginSuccess', () => {
        setLoading(false);
        navigation.replace('Services');  // Automatically log in the user
      });

      socket.on('loginFailure', (data) => {
        setLoading(false);
        if (data.message === 'Device ID not found') {
          Alert.alert(
            'Compte introuvable',
            'Aucun compte lié à cet appareil. Veuillez créer un compte.',
            [{ text: 'OK' }]
          );
        } else if (data.message === 'User account is disabled') {
          navigation.replace('Loading');  // Navigate to loading screen if account is disabled
        }
      });
    } else {
      navigation.replace('QRScanner');  // Redirect to account creation if device ID is not found
    }
  };

  // Manual login function
  const manualLogin = async () => {
    const deviceId = Device.osBuildId;  // Get the device ID
    if (!phone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir les champs requis.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        phone: phone.trim(),
        password: password.trim(),
        deviceId: deviceId // Include device ID in the payload
      };

      // Send login request to the backend
      const response = await fetch(`${BASE_URL}/api/clients/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.replace('Services');  // Navigate to the services screen on successful login
      } else {
        Alert.alert('Login Failed', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../assets/8498789sd.png')} style={styles.backgroundImage}>
      <View style={styles.container1}>
        {/* Image container */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/8498789.png')}
            style={[styles.image, { width: width, height: width }]}
          />
        </View>

        {/* Input fields for manual login */}
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Numéro de Téléphone"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}  // Update phone state
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de Passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}  // Update password state
          />

          {/* Manual login button */}
          <TouchableOpacity style={styles.button} onPress={manualLogin}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
            <Text style={styles.linkText}>Créer un compte</Text>
          </TouchableOpacity>

          {/* Loading indicator during login */}
          {loading && <ActivityIndicator size="large" color="#fff" />}
        </View>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;
