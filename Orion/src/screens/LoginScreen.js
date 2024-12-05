import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Device from 'expo-device';
import { BASE_URL, BASE_URLIO } from '@env';
import io from 'socket.io-client';

const LoginScreen = ({ onLogin }) => {
  const [deviceId, setDeviceId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const getDeviceId = async () => {
    if (Device.isDevice) {
      console.log(Device.isDevice)
      setDeviceId(Device.osBuildId);
      console.log('------------------------------------');
      console.log('Device ID:', Device.osBuildId);
      console.log('------------------------------------');
    } else {
      Alert.alert('Error', 'Must use a physical device for Device ID.');
    }
  };

  const autoLogin = async () => {
    const socket = io(`${BASE_URLIO}`);
    const deviceId = Device.osBuildId;
console.log(deviceId)
    if (deviceId) {
      socket.emit('adminAutoLogin', { deviceId });

      socket.on('adminloginSuccess', () => {
        Alert.alert('Login Successful', 'Welcome!');
        onLogin();
      });
    }
  };

  const restoreLogin = async () => {
    if (password !== 'restoreadmin') {
      return;
    }

    const socket = io(`${BASE_URLIO}`);
    const deviceId = Device.osBuildId;

    if (deviceId) {
      socket.emit('adminRestoreLogin', { deviceId });

      socket.on('adminRestoreSuccess', () => {
        Alert.alert('Welcome', 'To your platform admin : ) ');
      });
    }
  };

  useEffect(() => {
    getDeviceId();
    autoLogin();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/login`, {
        deviceId,
        phone,
        password,
      });

      if (response.status === 200) {
        Alert.alert('Login Successful', 'Welcome!');
        onLogin();
      } 
      if (response.status === 2000) {
        Alert.alert('Nouveau mot de passe envoyé', 'Nouveau mot de passe envoyé à votre adresse e-mail en raison d’un changement d’appareil. Veuillez utiliser ce mot de passe pour vous connecter.');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.logoImagecont} onPress={restoreLogin}>
            <Image 
              source={require('../assets/4gVJP0fdoZw00-aLyy3w--transformed.webp')} // Replace with your image file path
              style={styles.logoImage}
            />
          </TouchableOpacity>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign in to your platform</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your phone</Text>
              <TextInput
                placeholder="+33 6 00 00 00 00"
                value={phone}
                onChangeText={setPhone}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your password</Text>
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.customCheckboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <MaterialIcons
                  name={rememberMe ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={rememberMe ? "#007bff" : "#ccc"}
                />
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Lost Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login to your account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#fcfcfc',
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
   
  },  
  logoImagecont: {
    backgroundColor: '#ffffff00',
    width: "50%",
    height: "40%",
  },
  formContainer: {
    width: "90%",
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#d6c6b8',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0a5f6e',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#6665654b',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  customCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#0a5f6e',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#143c4d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
