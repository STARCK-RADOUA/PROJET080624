import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ImageBackground, Dimensions, ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as Device from 'expo-device';
import io from 'socket.io-client';
import { styles } from './styles/loginstyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL, BASE_URLIO } from '@env';
const { width } = Dimensions.get('window');

// Initialize the socket connection
const socket = io(`${BASE_URLIO}`);

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Animation for logo
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the animation
    autoLogin();
    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 2,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-login function
  const autoLogin = async () => {
    const deviceId = Device.osBuildId;
console.log(deviceId)
    if (deviceId) {
      socket.emit('autoLogin', { deviceId });

      socket.on('loginSuccess', () => {
        navigation.replace('Services');
      });
    }
  };

  // Manual login function
  const manualLogin = async () => {
    const deviceId = Device.osBuildId;
    console.log(deviceId)
    console.log("fffffffffffffffffffff")
    if (!phone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir les champs requis.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        phone: phone.trim(),
        password: password.trim(),
        deviceId
      };

      const response = await fetch(`${BASE_URL}/api/clients/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.replace('Services');
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}  // Handle keyboard behavior on iOS
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}  // Adjust offset based on platform
      >
        {/* Animated Logo */}
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: logoAnim }] }]}>
              <Image
                source={require('../assets/images/8498789.png')}
                style={[styles.image, { width: width, height: width }]}
              />
            </Animated.View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          <View style={styles.container1}>
          

            {/* Input fields for manual login */}
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Numéro de Téléphone"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de Passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {/* Manual login button */}
              <TouchableOpacity style={styles.button} onPress={manualLogin}>
                <Text style={styles.buttonText}>Se connecter</Text>
              </TouchableOpacity>

              {/* QR Icon and Create Account */}
              <View style={styles.horizontalLayout}>
                <TouchableOpacity onPress={() => navigation.navigate('RegistrationLC')}>
                  <Text style={styles.linkText}>Créer un compte</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
                  <Icon name="qrcode-scan" size={40} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Loading indicator during login */}
              {loading && <ActivityIndicator size="large" color="#fff" />}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
    </ImageBackground>
  );
};

export default LoginScreen;
