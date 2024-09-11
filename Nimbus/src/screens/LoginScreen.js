import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import * as Device from 'expo-device';
import io from 'socket.io-client';
import { LocationContext } from '../utils/LocationContext'; // Import the LocationContext
import { BASE_URL ,BASE_URLIO} from '@env';
import { navigate } from '../utils/navigationRef';
const LoginScreen = ({ navigation }) => {
  const deviceId =Device.osBuildId;
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const { startTracking } = useContext(LocationContext); // Use the LocationContext
  const socket = io(BASE_URLIO, {
    query: {
      deviceId:deviceId ,  // Pass the unique clientId
    }
  });
 

  useEffect(() => {
    startTracking(deviceId);
    autoLogin();

    



    // Connect to Socket.IO
  

    // Listen for admin deactivation event
    socket.on('adminActivateDriver', () => {
      console.log('Admin actiiive driver');
      // Navigate to Login screen when driver is deactivated:
      autoLogin();
        });
return () => {
  socket.off('adminActivateDriver');
};
    

}, []);
  const autoLogin = async () => {
    const deviceId = Device.osBuildId;

    if (deviceId) {
      socket.emit('autoLoginDriver', { deviceId });
      startTracking(deviceId);
      socket.on('loginSuccess', () => {
        navigate('Test');
       return socket.off('loginSuccess');

      });
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        deviceId,
        phone,
        password,
      });

      if (response.status === 200) {
        Alert.alert('Login Successful', 'hi ,Welcome!');
        
        // Start tracking after successful login
        startTracking(deviceId);
        
        navigate('Test'); // Navigate to the main screen after login
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
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
