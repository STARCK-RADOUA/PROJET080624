import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import * as Device from 'expo-device'; // Import expo-device for retrieving device info

const LoginScreen = ({ navigation }) => {
  const [deviceId, setDeviceId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Function to get device ID
  const getDeviceId = async () => {

      setDeviceId(Device.osBuildId); // Set deviceId using expo-device's osBuildId
   
  };

  // UseEffect to get deviceId when component loads
  useEffect(() => {
    getDeviceId(); // Get the deviceId when the component mounts
  }, []);

  console.log(deviceId)
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.8.131:4000/api/users/login', {
        deviceId,
        phone,
        password,
      });

      if (response.status === 200) {
        Alert.alert('Login Successful', 'Welcome!');
        // Navigate to the TestScreen after successful login
        navigation.navigate('Test');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/splash.png')} style={styles.logo} />

      {/* Login Form */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
